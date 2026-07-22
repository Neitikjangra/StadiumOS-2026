import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";
import { detectPromptInjection, validateInputLength, runGuardrails } from "@/lib/ai/guardrails";
import { retrieveRelevantSources, formatSourcesForPrompt, verifyGrounding, createGroundedResponse } from "@/lib/ai/grounding";
import { calculateConfidence } from "@/lib/ai/confidence";
import { FAN_ASSISTANT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { AISource, AIResponse } from "@/lib/ai/types";

const assistantSchema = z.object({
  query: z.string().min(1, "Query is required").max(2000, "Query too long"),
  conversationId: z.string().uuid().optional(),
  language: z.enum(["en", "es", "fr", "ar", "pt", "de"]).optional().default("en"),
});

function generateGroundedAnswer(query: string, sources: AISource[], language: string): string {
  if (sources.length === 0) {
    return "I don't have specific information about that in my knowledge base. Please ask a stadium staff member for assistance, or try rephrasing your question.";
  }

  const topSources = sources.slice(0, 3);
  const hasHighRelevance = topSources.some((s) => s.relevance > 0.6);

  let answer = "";

  if (hasHighRelevance) {
    const topSource = topSources[0];
    answer = `Based on official stadium information:\n\n**${topSource.title}**\n\n${topSource.snippet}\n\n`;

    if (topSources.length > 1) {
      answer += `Additional relevant information:\n`;
      for (const src of topSources.slice(1)) {
        answer += `- **${src.title}**: ${src.snippet}\n`;
      }
    }

    answer += `\nFor the most up-to-date information, please check with stadium staff or the nearest information desk.`;
  } else {
    answer = `I found some related information, but I'm not fully confident it answers your specific question:\n\n`;
    for (const src of topSources) {
      answer += `- **${src.title}**: ${src.snippet}\n`;
    }
    answer += `\nFor a more specific answer, please try rephrasing your question or ask a stadium staff member.`;
  }

  return answer;
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const user = session.user as any;

  if (!hasPermission(user.role, "ai:use")) {
    return NextResponse.json(
      { success: false, error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  const rl = checkRateLimit(`ai:${user.id}`, 20, 60000);
  if (!rl.allowed) {
    return NextResponse.json(rateLimitResponse(rl.resetAt), { status: 429 });
  }

  const body = await request.json();
  const parsed = assistantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { query, conversationId, language } = parsed.data;
  const queryId = `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();

  // Step 1: Input validation and length check
  if (!validateInputLength(query, 2000)) {
    return NextResponse.json(
      { success: false, error: "Query exceeds maximum length of 2000 characters" },
      { status: 400 }
    );
  }

  // Step 2: Prompt injection detection
  if (detectPromptInjection(query)) {
    return NextResponse.json({
      success: true,
      data: {
        response: "I can't process that request. Please ask a genuine question about stadium services.",
        sources: [],
        confidence: { level: "none", score: 0, factors: ["Prompt injection detected"] },
        groundingScore: 0,
        queryId,
      },
    });
  }

  // Step 3: Manage conversation
  let conversation;
  if (conversationId) {
    conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });
  }

  if (!conversation) {
    conversation = await prisma.aIConversation.create({
      data: {
        staffUserId: user.id,
        context: {
          role: user.role,
          stadiumId: user.stadiumId,
          language,
        },
      },
    });
  }

  // Step 4: Store user message
  await prisma.aIMessage.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: query,
    },
  });

  // Step 5: Vector-based knowledge retrieval
  const sources = retrieveRelevantSources(query, {
    topK: 5,
    language,
  });

  // Step 6: Also query Prisma for additional keyword-matched documents
  const searchTerms = query
    .toLowerCase()
    .split(" ")
    .filter((w: string) => w.length > 3);

  const dbDocs = await prisma.knowledgeDocument.findMany({
    where: {
      isDeleted: false,
      status: "published",
      OR: searchTerms.map((term: string) => ({
        OR: [
          { title: { contains: term } },
          { content: { contains: term } },
        ],
      })),
    },
    take: 3,
  });

  // Merge vector results with DB results (deduplicate by id)
  const dbSources: AISource[] = dbDocs.map((doc) => ({
    id: doc.id,
    type: "knowledge" as const,
    title: doc.title,
    relevance: 0.7,
    snippet: doc.content.substring(0, 200) + (doc.content.length > 200 ? "..." : ""),
  }));

  const mergedSources = [...sources];
  for (const dbSrc of dbSources) {
    if (!mergedSources.find((s) => s.id === dbSrc.id)) {
      mergedSources.push(dbSrc);
    }
  }
  const topSources = mergedSources.slice(0, 5);

  // Step 7: Generate grounded answer
  const answer = generateGroundedAnswer(query, topSources, language);

  // Step 8: Run guardrails on the generated answer
  const guardrailResult = runGuardrails(query, answer, {
    isOperator: user.role !== "fan_user",
    isFanFacing: user.role === "fan_user",
  });

  let finalAnswer = answer;
  if (!guardrailResult.passed && guardrailResult.action === "refuse") {
    finalAnswer = "I cannot provide that information. Please contact stadium staff for assistance.";
  }

  // Step 9: Verify grounding
  const grounding = verifyGrounding(finalAnswer, topSources);

  // Step 10: Calculate confidence
  const confidence = calculateConfidence(topSources, query, finalAnswer);

  // Step 11: Build sources for response
  const responseSources = topSources.map((s) => ({
    articleId: s.id,
    title: s.title,
    relevance: s.relevance,
    excerpt: s.snippet,
  }));

  // Step 12: Store assistant message
  const assistantMessage = await prisma.aIMessage.create({
    data: {
      conversationId: conversation.id,
      role: "assistant",
      content: finalAnswer,
      sources: responseSources.length > 0 ? responseSources : undefined,
    },
  });

  const processingTime = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    data: {
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      response: finalAnswer,
      sources: responseSources,
      confidence: {
        level: confidence.level,
        score: confidence.score,
        factors: confidence.factors,
      },
      groundingScore: grounding.score,
      guardrailPassed: guardrailResult.passed,
      processingTimeMs: processingTime,
      queryId,
    },
  });
}
