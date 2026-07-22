"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield, Globe2, Zap, UserPlus } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.success("Welcome to StadiumOS 2026");
        router.push("/command-center");
        router.refresh();
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center stadium-gradient relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-stadium-green/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-stadium-blue/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-stadium-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stadium-green/10 border border-stadium-green/20 mb-4">
            <Globe2 className="w-4 h-4 text-stadium-green" />
            <span className="text-sm text-stadium-green font-medium">
              FIFA World Cup 2026
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Stadium<span className="text-gradient">OS</span>
          </h1>
          <p className="text-text-muted">
            Intelligent Operations Platform
          </p>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-text-muted">
              Access the tournament operations dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-secondary">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ops@stadiumos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-surface-alt border-white/10 text-text-primary placeholder:text-text-muted focus:border-stadium-green/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-text-secondary">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-surface-alt border-white/10 text-text-primary placeholder:text-text-muted focus:border-stadium-green/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-stadium-green hover:bg-stadium-green/90 text-white"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <Link
                href="/sign-up"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-stadium-green/30 text-stadium-green hover:bg-stadium-green/10 transition-colors text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Create New Account
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Real-time</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe2 className="w-3 h-3" />
            <span>Multilingual</span>
          </div>
        </div>
      </div>
    </div>
  );
}
