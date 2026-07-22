"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Shield, Globe2, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success("Account created. Please sign in.");
      router.push("/login");
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
            Create your operations account
          </p>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Sign Up</CardTitle>
            <CardDescription className="text-text-muted">
              Register for tournament operations access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-text-secondary">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-surface-alt border-white/10 text-text-primary placeholder:text-text-muted focus:border-stadium-green/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-secondary">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@fifa.org"
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
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-surface-alt border-white/10 text-text-primary placeholder:text-text-muted focus:border-stadium-green/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-text-secondary">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-surface-alt border-white/10 text-text-primary focus:border-stadium-green/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="stadium_manager">Stadium Manager</SelectItem>
                    <SelectItem value="security_lead">Security Lead</SelectItem>
                    <SelectItem value="mobility_lead">Mobility Lead</SelectItem>
                  </SelectContent>
                </Select>
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
                Create Account
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-stadium-green hover:text-stadium-green/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Already have an account? Sign In
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
