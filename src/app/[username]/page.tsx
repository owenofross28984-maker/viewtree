"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { View } from "@/types";
import { supabase } from "@/lib/supabase";
import { ProfileCard, type PublicProfile } from "@/components/profile/profile-card";

type Profile = PublicProfile;

const RESERVED_USERNAMES = new Set([
  "app",
  "login",
  "signup",
  "onboarding",
  "settings",
  "privacy",
  "terms",
  "api",
  "support",
  "admin",
  "www",
]);

export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [views, setViews] = useState<View[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const normalizedUsername = params.username.toLowerCase();
  const isReservedUsername = RESERVED_USERNAMES.has(normalizedUsername);

  useEffect(() => {
    // Load current auth user so we can determine if this is their own profile
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    })();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (isReservedUsername) {
        setError("Profile not found.");
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, bio, avatar_url, theme_background, theme_card, theme_accent, theme_text, theme_font, social_instagram, social_twitter, social_youtube, social_spotify, social_website, hide_display_name, hide_username, hide_bio"
        )
        .eq("username", params.username)
        .single();

      if (profileError || !profileData) {
        setError("Profile not found.");
        setLoading(false);
        return;
      }

      setProfile(profileData as Profile);

      const { data: rawViews, error: viewsError } = await supabase
        .from("views")
        .select(
          "id, user_id, stem_type, custom_stem, statement, description, category, pinned, position, visibility, created_at, updated_at"
        )
        .eq("user_id", profileData.id)
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

    fetchData();
  }, [params.username, isReservedUsername]);

  // MVP: everything is free and always watermarked
  const showWatermark = true;

  const handleCopyView = async (viewId: string) => {
    // If not logged in, send to signup
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/signup");
      return;
    }

    const source = views.find((v) => v.id === viewId);
    if (!source) return;

    // Compute next position for this user's views
    const { data: myViews, error: posError } = await supabase
      .from("views")
      .select("position")
      .eq("user_id", user.id)
      .order("position", { ascending: true, nullsFirst: false })
      .limit(1);

    let nextPosition = 0;
    if (!posError && myViews && myViews.length > 0) {
      const pos = (myViews[0] as { position: number | null }).position;
      if (typeof pos === "number") {
        nextPosition = pos - 1;
      }
    }

    const { error: insertError } = await supabase.from("views").insert({
      user_id: user.id,
      stem_type: source.stemType,
      custom_stem: source.stemType === "custom" ? source.customStem ?? null : null,
      statement: source.statement,
      description: source.description ?? null,
      category: source.category,
      visibility: "public",
      pinned: false,
      position: nextPosition,
    });

    if (insertError) {
      console.error("Public profile: error copying view", insertError);
      return;
    }

    // Optional: tiny UX feedback; in a full app we'd use a toast
    alert("Added to your views");
  };

  const isOwnProfile = currentUserId && profile && currentUserId === profile.id;

  const handleShareProfile = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // user cancelled share or share failed; fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert("Profile link copied to clipboard");
    } catch {
      alert(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-destructive">{error ?? "Profile not found."}</p>
      </div>
    );
  }

  const themeBackground = profile.theme_background ?? "#020617";

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{ backgroundColor: themeBackground }}
    >
      <div className="max-w-[540px] mx-auto">
        <ProfileCard
          profile={profile}
          views={views}
          showWatermark={showWatermark}
          canCopyViews={!isOwnProfile}
          onCopyView={handleCopyView}
          onShare={handleShareProfile}
        />
      </div>
    </div>
  );
}
