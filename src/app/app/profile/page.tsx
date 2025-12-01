"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { View } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileCard, type PublicProfile } from "@/components/profile/profile-card";

type Profile = PublicProfile;

export default function ProfileEditorPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [views, setViews] = useState<View[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [themeBackground, setThemeBackground] = useState("#020617");
  const [themeCard, setThemeCard] = useState("#020617");
  const [themeAccent, setThemeAccent] = useState("#4b5563");
  const [themeText, setThemeText] = useState("#f9fafb");
  const [themeFont, setThemeFont] = useState("sans");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialSpotify, setSocialSpotify] = useState("");
  const [socialWebsite, setSocialWebsite] = useState("");
  const [hideDisplayName, setHideDisplayName] = useState(false);
  const [hideUsername, setHideUsername] = useState(false);
  const [hideBio, setHideBio] = useState(false);

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

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, bio, avatar_url, theme_background, theme_card, theme_accent, theme_text, theme_font, social_instagram, social_twitter, social_youtube, social_spotify, social_website, hide_display_name, hide_username, hide_bio"
        )
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        setError("Problem loading your profile.");
        setLoading(false);
        return;
      }

      const typedProfile = profileData as Profile;
      setProfile(typedProfile);

      setDisplayName(typedProfile.display_name ?? "");
      setBio(typedProfile.bio ?? "");
      setThemeBackground(typedProfile.theme_background ?? "#020617");
      setThemeCard(typedProfile.theme_card ?? "#020617");
      setThemeAccent(typedProfile.theme_accent ?? "#4b5563");
      setThemeText(typedProfile.theme_text ?? "#f9fafb");
      setThemeFont(typedProfile.theme_font ?? "sans");
      setSocialInstagram(typedProfile.social_instagram ?? "");
      setSocialTwitter(typedProfile.social_twitter ?? "");
      setSocialYoutube(typedProfile.social_youtube ?? "");
      setSocialSpotify(typedProfile.social_spotify ?? "");
      setSocialWebsite(typedProfile.social_website ?? "");
      setHideDisplayName(Boolean(typedProfile.hide_display_name));
      setHideUsername(Boolean(typedProfile.hide_username));
      setHideBio(Boolean(typedProfile.hide_bio));

      const { data: rawViews, error: viewsError } = await supabase
        .from("views")
        .select(
          "id, user_id, stem_type, custom_stem, statement, description, category, pinned, position, visibility, created_at, updated_at"
        )
        .eq("user_id", user.id)
        .eq("visibility", "public")
        .order("position", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (viewsError) {
        setError(viewsError.message);
        setLoading(false);
        return;
      }

      type RawViewRow = {
        id: string;
        user_id: string;
        stem_type: View["stemType"];
        custom_stem: string | null;
        statement: string;
        description: string | null;
        category: View["category"];
        pinned: boolean;
        position: number | null;
        visibility: View["visibility"];
        created_at: string;
        updated_at: string;
      };

      const mapped: View[] = (rawViews || []).map((v: RawViewRow) => ({
        id: v.id,
        userId: v.user_id,
        stemType: v.stem_type,
        customStem: v.custom_stem ?? undefined,
        statement: v.statement,
        description: v.description ?? undefined,
        category: v.category,
        sources: [],
        pinned: v.pinned,
        position: typeof v.position === "number" ? v.position : undefined,
        visibility: v.visibility,
        createdAt: new Date(v.created_at),
        updatedAt: new Date(v.updated_at),
      }));

      setViews(mapped);
      setLoading(false);
    };

    load();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);

    const trimmedName = displayName.trim();
    const trimmedBio = bio.trim();

    const trimmedInstagram = socialInstagram?.trim() || "";
    const trimmedTwitter = socialTwitter?.trim() || "";
    const trimmedYoutube = socialYoutube?.trim() || "";
    const trimmedSpotify = socialSpotify?.trim() || "";
    const trimmedWebsite = socialWebsite?.trim() || "";

    const lowerInstagram = trimmedInstagram.toLowerCase();
    const lowerTwitter = trimmedTwitter.toLowerCase();
    const lowerYoutube = trimmedYoutube.toLowerCase();
    const lowerSpotify = trimmedSpotify.toLowerCase();

    if (
      (trimmedInstagram && !lowerInstagram.includes("instagram")) ||
      (trimmedTwitter &&
        !(lowerTwitter.includes("twitter") || lowerTwitter.includes("x.com"))) ||
      (trimmedYoutube && !lowerYoutube.includes("youtube")) ||
      (trimmedSpotify && !lowerSpotify.includes("spotify"))
    ) {
      setError(
        "Social links must include the platform name (Instagram, Twitter/X, YouTube, Spotify).",
      );
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: trimmedName || null,
        bio: trimmedBio || null,
        theme_background: themeBackground?.trim() || null,
        theme_card: themeCard?.trim() || null,
        theme_accent: themeAccent?.trim() || null,
        theme_text: themeText?.trim() || null,
        theme_font: themeFont,
        social_instagram: trimmedInstagram || null,
        social_twitter: trimmedTwitter || null,
        social_youtube: trimmedYoutube || null,
        social_spotify: trimmedSpotify || null,
        social_website: trimmedWebsite || null,
        hide_display_name: hideDisplayName,
        hide_username: hideUsername,
        hide_bio: hideBio,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setProfile({
      ...profile,
      display_name: trimmedName || null,
      bio: trimmedBio || null,
      theme_background: themeBackground?.trim() || null,
      theme_card: themeCard?.trim() || null,
      theme_accent: themeAccent?.trim() || null,
      theme_text: themeText?.trim() || null,
      theme_font: themeFont,
      social_instagram: trimmedInstagram || null,
      social_twitter: trimmedTwitter || null,
      social_youtube: trimmedYoutube || null,
      social_spotify: trimmedSpotify || null,
      social_website: trimmedWebsite || null,
      hide_display_name: hideDisplayName,
      hide_username: hideUsername,
      hide_bio: hideBio,
    });

    setSaving(false);
  };

  const handleReset = () => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setBio(profile.bio ?? "");
    setThemeBackground(profile.theme_background ?? "#020617");
    setThemeCard(profile.theme_card ?? "#020617");
    setThemeAccent(profile.theme_accent ?? "#4b5563");
    setThemeText(profile.theme_text ?? "#f9fafb");
    setThemeFont(profile.theme_font ?? "sans");
    setSocialInstagram(profile.social_instagram ?? "");
    setSocialTwitter(profile.social_twitter ?? "");
    setSocialYoutube(profile.social_youtube ?? "");
    setSocialSpotify(profile.social_spotify ?? "");
    setSocialWebsite(profile.social_website ?? "");
    setHideDisplayName(Boolean(profile.hide_display_name));
    setHideUsername(Boolean(profile.hide_username));
    setHideBio(Boolean(profile.hide_bio));
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-destructive">{error ?? "Problem loading your profile."}</p>
      </div>
    );
  }

  const previewProfile: Profile = {
    ...profile,
    display_name: displayName || null,
    bio: bio || null,
    theme_background: themeBackground || null,
    theme_card: themeCard || null,
    theme_accent: themeAccent || null,
    theme_text: themeText || null,
    theme_font: themeFont,
    social_instagram: socialInstagram || null,
    social_twitter: socialTwitter || null,
    social_youtube: socialYoutube || null,
    social_spotify: socialSpotify || null,
    social_website: socialWebsite || null,
    hide_display_name: hideDisplayName,
    hide_username: hideUsername,
    hide_bio: hideBio,
  };

  const themeBackgroundColor = previewProfile.theme_background ?? "#020617";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/app")}
          >
            ← Back to dashboard
          </button>
          <div className="flex items-center gap-3">
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View public page →
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* Editor */}
        <section>
          <h1 className="text-lg font-semibold mb-1">Profile settings</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Update your public profile details, theme, and social links. Changes are visible in
            the preview on the right.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Display name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Bio <span className="font-normal">(optional, one line)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 100))}
                placeholder="A short bio..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 min-h-[56px] resize-none"
              />
              <p className="text-[11px] text-muted-foreground mt-1 text-right">
                {bio.length}/100
              </p>
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">Public theme</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Background (hex)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={themeBackground}
                      onChange={(e) => setThemeBackground(e.target.value)}
                      placeholder="#020617"
                      className="flex-1"
                    />
                    <input
                      type="color"
                      value={themeBackground}
                      onChange={(e) => setThemeBackground(e.target.value)}
                      className="h-9 w-9 rounded-md border border-border bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Card color (hex)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={themeCard}
                      onChange={(e) => setThemeCard(e.target.value)}
                      placeholder="#020617"
                      className="flex-1"
                    />
                    <input
                      type="color"
                      value={themeCard}
                      onChange={(e) => setThemeCard(e.target.value)}
                      className="h-9 w-9 rounded-md border border-border bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Accent (hex)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={themeAccent}
                      onChange={(e) => setThemeAccent(e.target.value)}
                      placeholder="#4b5563"
                      className="flex-1"
                    />
                    <input
                      type="color"
                      value={themeAccent}
                      onChange={(e) => setThemeAccent(e.target.value)}
                      className="h-9 w-9 rounded-md border border-border bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Text (hex)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={themeText}
                      onChange={(e) => setThemeText(e.target.value)}
                      placeholder="#f9fafb"
                      className="flex-1"
                    />
                    <input
                      type="color"
                      value={themeText}
                      onChange={(e) => setThemeText(e.target.value)}
                      className="h-9 w-9 rounded-md border border-border bg-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <label className="text-xs text-muted-foreground mb-1 block">Font</label>
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

            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Visibility</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hideDisplayName}
                    onChange={(e) => setHideDisplayName(e.target.checked)}
                    className="h-3 w-3 rounded border-border"
                  />
                  <span>Hide display name on public page</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hideUsername}
                    onChange={(e) => setHideUsername(e.target.checked)}
                    className="h-3 w-3 rounded border-border"
                  />
                  <span>Hide @username on public page</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hideBio}
                    onChange={(e) => setHideBio(e.target.checked)}
                    className="h-3 w-3 rounded border-border"
                  />
                  <span>Hide bio on public page</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Social links</p>
              <div className="space-y-3">
                <Input
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  placeholder="Instagram URL"
                />
                <Input
                  value={socialTwitter}
                  onChange={(e) => setSocialTwitter(e.target.value)}
                  placeholder="Twitter/X URL"
                />
                <Input
                  value={socialYoutube}
                  onChange={(e) => setSocialYoutube(e.target.value)}
                  placeholder="YouTube URL"
                />
                <Input
                  value={socialSpotify}
                  onChange={(e) => setSocialSpotify(e.target.value)}
                  placeholder="Spotify URL"
                />
                <Input
                  value={socialWebsite}
                  onChange={(e) => setSocialWebsite(e.target.value)}
                  placeholder="Website URL"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-primary hover:bg-primary/90"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </section>

        {/* Live preview */}
        <section>
          <div
            className="rounded-3xl border border-border/60 p-4"
            style={{ backgroundColor: themeBackgroundColor }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-white/80">Live preview</p>
                <p className="text-[11px] text-white/60">This is how your public profile looks.</p>
              </div>
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-white/80 hover:underline"
              >
                Open live page →
              </a>
            </div>

            <div className="max-w-[540px] mx-auto">
              <ProfileCard
                profile={previewProfile}
                views={views}
                showWatermark={true}
                canCopyViews={false}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
