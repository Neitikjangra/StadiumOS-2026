export const AI_RESPONSE_SCHEMA = {
  type: 'object',
  required: ['answer', 'sources', 'confidence', 'fallbackStatus'],
  properties: {
    answer: { type: 'string', description: 'The grounded answer to the query' },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'type', 'title', 'relevance', 'snippet'],
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['sop', 'faq', 'policy', 'venue', 'accessibility', 'transport', 'live_data', 'incident', 'knowledge'] },
          title: { type: 'string' },
          relevance: { type: 'number', minimum: 0, maximum: 1 },
          snippet: { type: 'string' },
        },
      },
    },
    confidence: {
      type: 'object',
      required: ['level', 'score', 'factors'],
      properties: {
        level: { type: 'string', enum: ['high', 'medium', 'low', 'none'] },
        score: { type: 'number', minimum: 0, maximum: 1 },
        factors: { type: 'array', items: { type: 'string' } },
      },
    },
    recommendedFollowUp: { type: 'string' },
    fallbackStatus: { type: 'string', enum: ['complete', 'partial', 'refused'] },
  },
};

export const INCIDENT_SUMMARY_SCHEMA = {
  type: 'object',
  required: ['summary', 'keyFactors', 'recommendedActions', 'confidence'],
  properties: {
    summary: { type: 'string', description: 'Concise incident summary' },
    keyFactors: { type: 'array', items: { type: 'string' } },
    recommendedActions: { type: 'array', items: { type: 'string' } },
    severityAssessment: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    estimatedResolution: { type: 'string' },
    resourcesNeeded: { type: 'array', items: { type: 'string' } },
    confidence: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: ['high', 'medium', 'low', 'none'] },
        score: { type: 'number' },
      },
    },
  },
};

export const NEXT_BEST_ACTION_SCHEMA = {
  type: 'object',
  required: ['actions', 'priority', 'context'],
  properties: {
    actions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['action', 'priority', 'reason', 'estimatedImpact'],
        properties: {
          action: { type: 'string' },
          priority: { type: 'string', enum: ['immediate', 'high', 'medium', 'low'] },
          reason: { type: 'string' },
          estimatedImpact: { type: 'string' },
          relatedSOP: { type: 'string' },
          estimatedTime: { type: 'string' },
        },
      },
    },
    priority: { type: 'string', enum: ['immediate', 'high', 'medium', 'low'] },
    context: { type: 'string', description: 'Summary of current operational context' },
    riskLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
  },
};

export const SOP_CHECKLIST_SCHEMA = {
  type: 'object',
  required: ['sopId', 'title', 'steps', 'estimatedDuration'],
  properties: {
    sopId: { type: 'string' },
    title: { type: 'string' },
    category: { type: 'string' },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        required: ['stepNumber', 'instruction', 'required', 'category'],
        properties: {
          stepNumber: { type: 'number' },
          instruction: { type: 'string' },
          required: { type: 'boolean' },
          category: { type: 'string', enum: ['safety', 'communication', 'logistics', 'medical', 'security', 'operations'] },
          estimatedTime: { type: 'string' },
          dependsOn: { type: 'array', items: { type: 'number' } },
          safetyNote: { type: 'string' },
        },
      },
    },
    estimatedDuration: { type: 'string' },
    requiredRoles: { type: 'array', items: { type: 'string' } },
    escalationPath: { type: 'array', items: { type: 'string' } },
  },
};

export const TRANSLATION_SCHEMA = {
  type: 'object',
  required: ['translatedText', 'terminology', 'confidence'],
  properties: {
    translatedText: { type: 'string' },
    terminology: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          original: { type: 'string' },
          translated: { type: 'string' },
          note: { type: 'string' },
        },
      },
    },
    confidence: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: ['high', 'medium', 'low', 'none'] },
        score: { type: 'number' },
      },
    },
    culturalNotes: { type: 'array', items: { type: 'string' } },
  },
};

export const ALERT_REWRITE_SCHEMA = {
  type: 'object',
  required: ['title', 'message', 'audience', 'tone'],
  properties: {
    title: { type: 'string' },
    message: { type: 'string' },
    audience: { type: 'string' },
    tone: { type: 'string', enum: ['urgent', 'informative', 'calm', 'directive', 'reassuring'] },
    urgency: { type: 'string', enum: ['immediate', 'high', 'normal', 'low'] },
    channel: { type: 'string', enum: ['push', 'sms', 'email', 'display', 'audio', 'all'] },
    characterCount: { type: 'number' },
    readabilityScore: { type: 'number' },
  },
};

export const POST_INCIDENT_SCHEMA = {
  type: 'object',
  required: ['executiveSummary', 'timeline', 'rootCause', 'impact', 'recommendations'],
  properties: {
    executiveSummary: { type: 'string' },
    timeline: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          time: { type: 'string' },
          event: { type: 'string' },
          significance: { type: 'string' },
        },
      },
    },
    rootCause: { type: 'string' },
    impact: {
      type: 'object',
      properties: {
        operational: { type: 'string' },
        safety: { type: 'string' },
        financial: { type: 'string' },
        reputational: { type: 'string' },
      },
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          recommendation: { type: 'string' },
          priority: { type: 'string' },
          owner: { type: 'string' },
          deadline: { type: 'string' },
        },
      },
    },
    lessonsLearned: { type: 'array', items: { type: 'string' } },
    confidence: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: ['high', 'medium', 'low', 'none'] },
        score: { type: 'number' },
      },
    },
  },
};
