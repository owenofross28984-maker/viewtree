"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import {
  CATEGORIES,
  STEM_TYPES,
  STATEMENT_CHAR_LIMIT,
  DESCRIPTION_CHAR_LIMIT,
  CUSTOM_STEM_CHAR_LIMIT,
  type Visibility,
  type StemType,
} from "@/types";
import { supabase } from "@/lib/supabase";

export default function NewViewPage() {
  const router = useRouter();
  const [stem, setStem] = useState<StemType | "custom">("I believe");
  const [customStem, setCustomStem] = useState("");
  const [statement, setStatement] = useState("");
  const [category, setCategory] = useState("Technology");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You need to be logged in to create a view.");
        setIsLoading(false);
        return;
      }

      // Compute next position for this user's views so ordering works with drag-and-drop
      const { data: existing, error: posError } = await supabase
        .from("views")
        .select("position")
        .eq("user_id", user.id)
        .order("position", { ascending: true, nullsFirst: false })
        .limit(1);

      let nextPosition = 0;
      if (!posError && existing && existing.length > 0) {
        const pos = (existing[0] as { position: number | null }).position;
        if (typeof pos === "number") {
          nextPosition = pos - 1;
        }
      }

      const payload = {
        user_id: user.id,
        stem_type: stem === "custom" ? "custom" : stem,
        custom_stem: stem === "custom" ? customStem : null,
        statement,
        description: description || null,
        category,
        position: nextPosition,
        pinned: false,
        visibility,
      };

      const { error: insertError } = await supabase.from("views").insert(payload);

      if (insertError) {
        setError(insertError.message);
        setIsLoading(false);
        return;
      }

      router.push("/app");
    } catch {
      setError("Unexpected error while saving your view.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-viewtree mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold">New View</h1>
        </div>
      </header>

      <main className="max-w-viewtree mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stem selector */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Stem</Label>
            <select
              value={stem}
              onChange={(e) => setStem(e.target.value as StemType | "custom")}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              {STEM_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Custom stem input */}
          {stem === "custom" && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Custom Stem</Label>
              <Input
                value={customStem}
                onChange={(e) =>
                  setCustomStem(e.target.value.slice(0, CUSTOM_STEM_CHAR_LIMIT))
                }
                placeholder="e.g., I think that..."
                required
                maxLength={CUSTOM_STEM_CHAR_LIMIT}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {customStem.length}/{CUSTOM_STEM_CHAR_LIMIT}
              </p>
            </div>
          )}

          {/* Statement */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Statement
              <span className="text-muted-foreground ml-2 font-normal">
                (max {STATEMENT_CHAR_LIMIT} chars)
              </span>
            </Label>
            <Textarea
              value={statement}
              onChange={(e) =>
                setStatement(e.target.value.slice(0, STATEMENT_CHAR_LIMIT))
              }
              placeholder="your view here..."
              className="min-h-[120px] resize-none"
              required
              maxLength={STATEMENT_CHAR_LIMIT}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {statement.length}/{STATEMENT_CHAR_LIMIT}
            </p>
          </div>

          {/* Description (optional) */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Description
              <span className="text-muted-foreground ml-2 font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value.slice(0, DESCRIPTION_CHAR_LIMIT))
              }
              placeholder="Explain or add context for your view..."
              className="min-h-[120px] resize-none"
              maxLength={DESCRIPTION_CHAR_LIMIT}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {description.length}/{DESCRIPTION_CHAR_LIMIT}
            </p>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium mb-1 block">Category</Label>
            <p className="text-xs text-muted-foreground mb-2">
              For your own organization only. Categories aren&apos;t shown on your public page.
            </p>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Visibility</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={visibility === "public" ? "default" : "outline"}
                onClick={() => setVisibility("public")}
              >
                Public
              </Button>
              <Button
                type="button"
                size="sm"
                variant={visibility === "private" ? "default" : "outline"}
                onClick={() => setVisibility("private")}
              >
                Private
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!statement.trim() || isLoading}
            >
              {isLoading ? "Saving..." : "Save View"}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </form>
      </main>
    </div>
  );
}
