"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, AtSign, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [themeBackground, setThemeBackground] = useState("#020617");
  const [themeCard, setThemeCard] = useState("#020617");
  const [themeAccent, setThemeAccent] = useState("#4b5563");
  const [themeText, setThemeText] = useState("#f9fafb");
  const [themeFont, setThemeFont] = useState("sans");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      setUserId(user.id);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select(
          "username, display_name, bio, avatar_url, theme_background, theme_card, theme_accent, theme_text, theme_font"
        )
        .eq("id", user.id)
        .single();

      if (profileError || !data) {
        setError("Problem loading your settings.");
        setLoading(false);
        return;
      }

      setUsername(data.username ?? "");
      setDisplayName(data.display_name ?? "");
      setBio(data.bio ?? "");
      setProfilePicture(data.avatar_url ?? "");
      setThemeBackground(data.theme_background ?? "#020617");
      setThemeCard(data.theme_card ?? "#020617");
      setThemeAccent(data.theme_accent ?? "#4b5563");
      setThemeText(data.theme_text ?? "#f9fafb");
      setThemeFont(data.theme_font ?? "sans");
      setLoading(false);
    };

    load();
  }, [router]);

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
      return;
    }

    setCheckingUsername(true);
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    usernameCheckTimeoutRef.current = setTimeout(async () => {
      const { data, error: availabilityError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (availabilityError) {
        console.error("Settings: error checking username availability", availabilityError);
        setUsernameAvailable(null);
      } else {
        if (!data || data.id === userId) {
          setUsernameAvailable(true);
        } else {
          setUsernameAvailable(false);
        }
      }
      setCheckingUsername(false);
    }, 400);

    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, [username, userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: username || null,
        display_name: displayName,
        bio,
        avatar_url: profilePicture,
        theme_background: themeBackground || null,
        theme_card: themeCard || null,
        theme_accent: themeAccent || null,
        theme_text: themeText || null,
        theme_font: themeFont || null,
      })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    router.push("/app");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading settings…</p>
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
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-viewtree mx-auto px-4 py-6">
        <form onSubmit={handleSave} className="max-w-lg mx-auto space-y-6">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {/* Profile Picture */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-2 border-white">
                <AvatarImage src={profilePicture} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Update your avatar from your dashboard profile header.
              </p>
            </div>
          </div>

          {/* Username (permanent) */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Username</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  )
                }
                placeholder="yourname"
                className="pl-10 pr-10"
                minLength={3}
                maxLength={20}
                required
              />
              {checkingUsername && username.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="inline-block w-3 h-3 border-2 border-muted-foreground/40 border-t-muted-foreground rounded-full animate-spin" />
                </div>
              )}
              {!checkingUsername && usernameAvailable !== null && username.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameAvailable ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <span className="text-xs text-destructive">Taken</span>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your public link is viewtr.ee/@{username || "username"}
            </p>
          </div>

          {/* Display Name */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Bio
              <span className="text-muted-foreground ml-2 font-normal">
                (optional, one line)
              </span>
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 100))}
              placeholder="A short bio..."
              className="min-h-[60px] resize-none"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {bio.length}/100
            </p>
          </div>

          {/* Profile theme */}
          <div className="pt-4 border-t border-border space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1 block">Profile theme</Label>
              <p className="text-xs text-muted-foreground">
                Customize how your public page looks. Leave fields blank to use the default theme.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium mb-1 block">Background color</Label>
                <Input
                  value={themeBackground}
                  onChange={(e) => setThemeBackground(e.target.value)}
                  placeholder="#020617"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1 block">Card color</Label>
                <Input
                  value={themeCard}
                  onChange={(e) => setThemeCard(e.target.value)}
                  placeholder="#020617"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1 block">Accent color</Label>
                <Input
                  value={themeAccent}
                  onChange={(e) => setThemeAccent(e.target.value)}
                  placeholder="#4b5563"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1 block">Text color</Label>
                <Input
                  value={themeText}
                  onChange={(e) => setThemeText(e.target.value)}
                  placeholder="#f9fafb"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium mb-1 block">Font</Label>
              <select
                value={themeFont}
                onChange={(e) => setThemeFont(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="sans">Sans (default)</option>
                <option value="serif">Serif</option>
                <option value="mono">Mono</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              asChild
            >
              <Link href="/app">Cancel</Link>
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={
                isSaving ||
                checkingUsername ||
                usernameAvailable === false ||
                username.length < 3
              }
            >
              Save Changes
            </Button>
          </div>

          {/* Sign Out */}
          <div className="pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
