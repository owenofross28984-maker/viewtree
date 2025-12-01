"use client";

import { useEffect, useState } from "react";
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
  type Category,
  type StemType,
  type Visibility,
} from "@/types";
import { supabase } from "@/lib/supabase";

interface EditViewPageProps {
  params: { id: string };
}

export default function EditViewPage({ params }: EditViewPageProps) {
  const router = useRouter();
  const [stem, setStem] = useState<StemType | "">("");
  const [customStem, setCustomStem] = useState("");
  const [statement, setStatement] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data, error: viewError } = await supabase
        .from("views")
        .select(
          "id, user_id, stem_type, custom_stem, statement, description, category, visibility"
        )
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (viewError || !data) {
        setError("View not found.");
        setLoading(false);
        return;
      }

      setStem(data.stem_type as StemType);
      setCustomStem(data.custom_stem ?? "");
      setStatement(data.statement ?? "");
      setDescription(data.description ?? "");
      setCategory(data.category as Category);
      setVisibility(data.visibility as Visibility);
      setLoading(false);
    };

    load();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stem || !category) return;

    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You need to be logged in to edit a view.");
        setSaving(false);
        return;
      }

      const payload = {
        stem_type: stem === "custom" ? "custom" : stem,
        custom_stem: stem === "custom" ? customStem : null,
        statement,
        description: description || null,
        category,
        visibility,
      };

      const { error: updateError } = await supabase
        .from("views")
        .update(payload)
        .eq("id", params.id)
        .eq("user_id", user.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      router.push("/app");
    } catch {
      setError("Unexpected error while updating your view.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading view…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-viewtree mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold">Edit View</h1>
        </div>
      </header>

      <main className="max-w-viewtree mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stem selector */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Stem</Label>
            <select
              value={stem || ""}
              onChange={(e) => setStem(e.target.value as StemType)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="" disabled>
                Select a stem
              </option>
              {STEM_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
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
            </Label>
            <Textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value.slice(0, STATEMENT_CHAR_LIMIT))}
              placeholder="science is cool"
              className="min-h-[120px] resize-none"
              required
              maxLength={STATEMENT_CHAR_LIMIT}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {statement.length}/{STATEMENT_CHAR_LIMIT}
            </p>
          </div>

          {/* Description (Optional) */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Description <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_CHAR_LIMIT))}
              placeholder="Explain your view in more detail..."
              className="min-h-[150px] resize-none"
              maxLength={DESCRIPTION_CHAR_LIMIT}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {description.length}/{DESCRIPTION_CHAR_LIMIT}
            </p>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Category</Label>
            <select
              value={category || ""}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Visibility</Label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
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
              disabled={!statement.trim() || saving}
            >
              {saving ? "Saving..." : "Save Changes"}
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
