"use client";

import { useEffect, useState, useCallback } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ViewTreeLogo } from "@/components/layout/logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Camera, ChevronDown } from "lucide-react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { View, type Category } from "@/types";
import { supabase } from "@/lib/supabase";
import { ViewCard } from "@/components/beliefs/belief-card";
import { ProfileCard } from "@/components/profile/profile-card";
import { CategoryFilter } from "@/components/views/category-filter";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme_background?: string | null;
  theme_card?: string | null;
  theme_accent?: string | null;
  theme_text?: string | null;
  theme_font?: string | null;
  social_instagram?: string | null;
  social_twitter?: string | null;
  social_youtube?: string | null;
  social_spotify?: string | null;
  social_website?: string | null;
  hide_display_name?: boolean | null;
  hide_username?: boolean | null;
  hide_bio?: boolean | null;
};

export default function AppPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [views, setViews] = useState<View[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"all" | Category>("all");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [hideDisplayName, setHideDisplayName] = useState(false);
  const [hideUsername, setHideUsername] = useState(false);
  const [hideBio, setHideBio] = useState(false);
  const [themeBackground, setThemeBackground] = useState("#020617");
  const [themeCard, setThemeCard] = useState("#020617");
  const [themeAccent, setThemeAccent] = useState("#4b5563");
  const [themeText, setThemeText] = useState("#f9fafb");
  const [themeFont, setThemeFont] = useState("sans");
  const [showThemeControls, setShowThemeControls] = useState(false);
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialSpotify, setSocialSpotify] = useState("");
  const [socialWebsite, setSocialWebsite] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const router = useRouter();

  const usedCategories = Array.from(
    new Set(views.map((v) => v.category))
  ) as Category[];

  const filteredViews =
    selectedCategory === "all"
      ? views
      : views.filter((v) => v.category === selectedCategory);

  // Keep editable profile drafts in sync with loaded profile
  useEffect(() => {
    if (profile) {
      setProfileDisplayName(profile.display_name ?? "");
      setProfileBio(profile.bio ?? "");
      setHideDisplayName(Boolean(profile.hide_display_name));
      setHideUsername(Boolean(profile.hide_username));
      setHideBio(Boolean(profile.hide_bio));
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
    }
  }, [profile]);

  const refreshViews = useCallback(
    async (uid: string) => {
      const { data: rawViews, error: viewsError } = await supabase
        .from("views")
        .select(
          "id, user_id, stem_type, custom_stem, statement, description, category, pinned, position, visibility, created_at, updated_at"
        )
        .eq("user_id", uid)
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
      if (mapped.length === 0) {
        router.push("/onboarding");
        return;
      }
      setLoading(false);
    },
    [router]
  );

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

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, bio, avatar_url, theme_background, theme_card, theme_accent, theme_text, theme_font, social_instagram, social_twitter, social_youtube, social_spotify, social_website, hide_display_name, hide_username, hide_bio"
        )
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        console.error("Dashboard: error loading profile", profileError, profileData);

        // Fallback: synthesize a minimal profile from auth metadata so the
        // dashboard can still render even if the profiles row is missing.
        type UserMetadata = {
          username?: string;
          display_name?: string;
        } | null;

        const userMeta = user.user_metadata as UserMetadata;

        const fallbackProfile: Profile = {
          id: user.id,
          username:
            userMeta?.username ??
            (user.email ? user.email.split("@")[0] : "user"),
          display_name: userMeta?.display_name ?? null,
          bio: null,
          avatar_url: null,
          theme_background: "#020617",
          theme_card: "#020617",
          theme_accent: "#4b5563",
          theme_text: "#f9fafb",
          theme_font: "sans",
          social_instagram: null,
          social_twitter: null,
          social_youtube: null,
          social_spotify: null,
          social_website: null,
          hide_display_name: null,
          hide_username: null,
          hide_bio: null,
        };

        setProfile(fallbackProfile);
        await refreshViews(user.id);
        return;
      }

      setProfile(profileData as Profile);
      await refreshViews(user.id);
    };

    load();
  }, [router, refreshViews]);

  const handleEdit = (viewId: string) => {
    router.push(`/app/views/${viewId}/edit`);
  };

  const handleDelete = (viewId: string) => {
    if (!userId) return;
    if (!confirm("Delete this view?")) return;
    (async () => {
      await supabase.from("views").delete().eq("id", viewId);
      await refreshViews(userId);
    })();
  };

  const handleProfileSave = async () => {
    if (!userId || !profile) return;
    setSavingProfile(true);
    setProfileError(null);

    const trimmedName = profileDisplayName.trim();
    const trimmedBio = profileBio.trim();

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
      setProfileError(
        "Social links must include the platform name (Instagram, Twitter/X, YouTube, Spotify).",
      );
      setSavingProfile(false);
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
      .eq("id", userId);

    if (updateError) {
      setProfileError(updateError.message);
      setSavingProfile(false);
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
    setSavingProfile(false);
    setIsProfileOpen(false);
  };

  const handleThemeSave = async () => {
    if (!userId || !profile) return;
    setSavingTheme(true);
    setProfileError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        theme_background: themeBackground?.trim() || null,
        theme_card: themeCard?.trim() || null,
        theme_accent: themeAccent?.trim() || null,
        theme_text: themeText?.trim() || null,
        theme_font: themeFont,
      })
      .eq("id", userId);

    if (updateError) {
      setProfileError(updateError.message);
      setSavingTheme(false);
      return;
    }

    setProfile({
      ...profile,
      theme_background: themeBackground?.trim() || null,
      theme_card: themeCard?.trim() || null,
      theme_accent: themeAccent?.trim() || null,
      theme_text: themeText?.trim() || null,
      theme_font: themeFont,
    });

    setSavingTheme(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const compressImage = (file: File, maxSize = 256): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      reader.onerror = (e) => {
        reject(e);
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        const scale = Math.min(
          1,
          maxSize / (img.width || maxSize),
          maxSize / (img.height || maxSize)
        );

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create image blob"));
            } else {
              resolve(blob);
            }
          },
          "image/jpeg",
          0.55
        );
      };

      img.onerror = (e) => {
        reject(e);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!userId) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please upload an image file.");
      return;
    }

    setUploadingAvatar(true);
    setAvatarError(null);

    try {
      const compressed = await compressImage(file, 256);
      const filePath = `${userId}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressed, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        setAvatarError(uploadError.message);
        setUploadingAvatar(false);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (profileUpdateError) {
        setAvatarError(profileUpdateError.message);
        setUploadingAvatar(false);
        return;
      }

      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl });
      }
    } catch (err) {
      console.error("Dashboard: error uploading avatar", err);
      setAvatarError("Problem uploading image. Please try a smaller file.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const persistOrder = async (ordered: View[]) => {
    if (!userId) return;
    try {
      await Promise.all(
        ordered.map((view, index) =>
          supabase
            .from("views")
            .update({ position: index })
            .eq("id", view.id)
            .eq("user_id", userId)
        )
      );
    } catch (err) {
      console.error("Dashboard: error saving view order", err);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setViews((prev) => {
      const oldIndex = prev.findIndex((v) => v.id === active.id);
      const newIndex = prev.findIndex((v) => v.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const newOrder = arrayMove(prev, oldIndex, newIndex);
      void persistOrder(newOrder);
      return newOrder;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-destructive">{error ?? "Problem loading your dashboard."}</p>
      </div>
    );
  }

  const previewProfile = {
    ...profile,
    display_name: profileDisplayName || null,
    bio: profileBio || null,
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

  const examplePreviewView: View = {
    id: "preview-example-view",
    userId: profile.id,
    stemType: "I believe",
    customStem: undefined,
    statement: "that democracy works better when people share what they actually think.",
    description:
      "This is an example view. Add your own views here to explain what you believe, support, or oppose.",
    category: "Politics",
    sources: [],
    pinned: false,
    position: -1,
    visibility: "public",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const publicViewsForPreview = views.filter((v) => v.visibility === "public");
  const previewViews = [examplePreviewView, ...publicViewsForPreview].slice(0, 3);
  const previewBackground = previewProfile.theme_background ?? "#020617";
  const headerDisplayName =
    profileDisplayName || previewProfile.display_name || previewProfile.username;
  const headerBio = profileBio || previewProfile.bio || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-viewtree mx-auto px-4 py-4 flex items-center justify-between">
          <ViewTreeLogo showText />
          <AccountMenu />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section>
          <h1 className="text-lg font-semibold mb-1">Profile &amp; Theme</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Edit what appears on your public page. Changes are shown in the live preview.
          </p>
          <div className="mb-8 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Collapsible header for profile + theme settings */}
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="text-sm font-semibold">
                    {headerDisplayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{headerDisplayName}</p>
                  <p className="text-xs text-muted-foreground">@{profile.username}</p>
                  {headerBio && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{headerBio}</p>
                  )}
                </div>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <span className="hidden sm:inline text-[11px] text-muted-foreground">
                  {isProfileOpen ? "Hide settings" : "Show settings"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
            {/* Profile settings card */}
            {isProfileOpen && (
              <div className="border-t border-border px-5 pb-6 pt-4 space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 text-left">
                    <p className="text-xs font-medium text-muted-foreground">Profile picture</p>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="avatar-upload"
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Change avatar</span>
                      </label>
                      {uploadingAvatar && (
                        <p className="text-[11px] text-muted-foreground">Uploading avatar…</p>
                      )}
                    </div>
                    {avatarError && (
                      <p className="text-[11px] text-destructive">{avatarError}</p>
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                    />
                  </div>
                </div>

                <div className="max-w-xl text-left space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Display name
                    </label>
                    <Input
                      value={profileDisplayName}
                      onChange={(e) => setProfileDisplayName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Bio <span className="font-normal">(optional, one line)</span>
                    </label>
                    <textarea
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value.slice(0, 100))}
                      placeholder="A short bio..."
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 min-h-[56px] resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1 text-right">
                      {profileBio.length}/100
                    </p>
                  </div>
                  {profileError && (
                    <p className="text-xs text-destructive">{profileError}</p>
                  )}

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

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setProfileDisplayName(profile.display_name ?? "");
                        setProfileBio(profile.bio ?? "");
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
                        setProfileError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      disabled={savingProfile}
                      onClick={handleProfileSave}
                    >
                      {savingProfile ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <div className="pt-4 border-t border-border mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        {/* Views area in a matching themed card */}
        <h2 className="text-base font-semibold mb-2">Views</h2>
        <div
          className="rounded-[40px] border border-border/60 shadow-xl p-5 mb-24 bg-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              asChild
            >
              <Link href="/app/views/new">
                <Plus className="w-4 h-4 mr-1" />
                Create view
              </Link>
            </Button>
            {usedCategories.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs border-border text-muted-foreground hover:bg-muted"
                onClick={() => setShowCategoryFilter((prev) => !prev)}
              >
                {showCategoryFilter ? "Hide filters" : "Filter"}
              </Button>
            )}
          </div>

          {/* Filter row - only shown when Filter button is active */}
          {usedCategories.length > 0 && showCategoryFilter && (
            <div className="mb-2">
              <CategoryFilter
                categories={usedCategories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
          )}

          {/* Views header directly above cards */}
          <h2 className="text-sm font-medium text-white/70 text-center mb-2 mt-1">
            Your views
          </h2>

          {/* Views list with drag-and-drop ordering */}
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={filteredViews.map((v) => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {filteredViews.map((view) => (
                  <SortableViewCard
                    key={view.id}
                    view={view}
                    username={profile.username}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}

                {views.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-white/80 mb-1">No views yet.</p>
                    <p className="text-xs text-white/70">
                      Use the Create view button above to add your first view.
                    </p>
                  </div>
                )}

                {views.length > 0 && filteredViews.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-white/80">No views in this category yet.</p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        </section>
        <section aria-label="Preview of your public ViewTree page">
          <div className="lg:sticky lg:top-24">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Public page preview
                </p>
                <p className="text-sm font-medium text-foreground">
                  viewtr.ee/@{profile.username}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  This is what visitors see when they open your link.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/${profile.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-primary hover:underline"
                >
                  Open live page
                </Link>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-[11px] border-border text-muted-foreground hover:bg-muted"
                  onClick={() => setShowThemeControls((prev) => !prev)}
                >
                  {showThemeControls ? "Hide theme controls" : "Customize theme"}
                </Button>
              </div>
            </div>
            <div className="rounded-3xl border border-border/60 shadow-xl p-4 mb-24 bg-card/80">
              <div
                className="mx-auto max-w-[420px] px-3 py-2 rounded-[32px] overflow-hidden max-h-[260px]"
                style={{ backgroundColor: previewBackground }}
              >
                <div className="scale-50 origin-top">
                  <ProfileCard
                    profile={previewProfile}
                    views={previewViews}
                    showWatermark={true}
                    canCopyViews={false}
                  />
                </div>
              </div>
              {showThemeControls && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Public theme</p>
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
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={savingTheme}
                      onClick={handleThemeSave}
                    >
                      {savingTheme ? "Saving theme..." : "Save theme"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

interface SortableViewCardProps {
  view: View;
  username: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableViewCard({ view, username, onEdit, onDelete }: SortableViewCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: view.id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ViewCard
        view={view}
        username={username}
        showActions={true}
        onEdit={onEdit}
        onDelete={onDelete}
        dragListeners={listeners}
        dragAttributes={attributes}
        showVisibility={true}
      />
    </div>
  );
}
