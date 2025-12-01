"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Instagram, Twitter, Youtube, Globe, Music2, Share2 } from "lucide-react";
import { View } from "@/types";
import { ViewCard } from "@/components/beliefs/belief-card";
import { ViewTreeLogo } from "@/components/layout/logo";

export type PublicProfile = {
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

interface ProfileCardProps {
  profile: PublicProfile;
  views: View[];
  showWatermark: boolean;
  canCopyViews: boolean;
  onCopyView?: (id: string) => void;
  onShare?: () => void;
}

export function ProfileCard({
  profile,
  views,
  showWatermark,
  canCopyViews,
  onCopyView,
  onShare,
}: ProfileCardProps) {
  const defaultTheme = {
    background: "#020617",
    card: "#020617",
    accent: "#4b5563", // neutral gray accent
    text: "#f9fafb",
  };

  const theme = {
    background: profile.theme_background ?? defaultTheme.background,
    card: profile.theme_card ?? defaultTheme.card,
    accent: profile.theme_accent ?? defaultTheme.accent,
    text: profile.theme_text ?? defaultTheme.text,
  };

  const fontClass =
    profile.theme_font === "serif"
      ? "font-serif"
      : profile.theme_font === "mono"
      ? "font-mono"
      : "font-sans";

  const socialLinks = [
    { icon: Instagram, url: profile.social_instagram, label: "Instagram" },
    { icon: Twitter, url: profile.social_twitter, label: "Twitter" },
    { icon: Youtube, url: profile.social_youtube, label: "YouTube" },
    { icon: Music2, url: profile.social_spotify, label: "Spotify" },
    { icon: Globe, url: profile.social_website, label: "Website" },
  ].filter((link) => link.url);

  return (
    <div
      className={`relative rounded-[40px] border border-border/60 shadow-xl overflow-hidden ${fontClass}`}
      style={{
        backgroundColor: theme.card,
        color: theme.text ?? undefined,
      }}
    >
      {/* Header chrome: logo + share */}
      <div className="pt-4 pb-2 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-sm">
            <ViewTreeLogo size={18} />
          </div>
        </div>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition hover:opacity-90"
            style={{
              backgroundColor: theme.accent,
              borderColor: theme.accent,
              color: theme.text ?? undefined,
            }}
            aria-label="Share profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile header */}
      <div className="px-8 pb-6 text-center">
        <Avatar
          className="w-28 h-28 mx-auto mb-4 border-4 shadow-lg"
          style={{ borderColor: theme.accent }}
        >
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
            {(profile.display_name || profile.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {!profile.hide_display_name && (
          <h1 className="text-2xl font-bold mb-1">
            {profile.display_name || profile.username}
          </h1>
        )}
        {!profile.hide_username && (
          <p className="text-sm opacity-80 mb-1">@{profile.username}</p>
        )}

        {profile.bio && !profile.hide_bio && (
          <p className="text-base font-medium opacity-90">{profile.bio}</p>
        )}

        {socialLinks.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            {socialLinks.map(({ icon: Icon, url, label }) => (
              <a
                key={label}
                href={url as string}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/20 hover:border-white/60 transition"
                style={{ color: theme.text ?? undefined }}
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Views list inside the card */}
      <div className="px-5 pb-8 space-y-4">
        {views.map((view) => (
          <ViewCard
            key={view.id}
            view={view}
            username={profile.username}
            showActions={false}
            showCopyAction={canCopyViews}
            onCopy={onCopyView}
            showCategory={false}
          />
        ))}

        {views.length === 0 && (
          <div className="text-center py-10 text-sm opacity-80">
            No views yet.
          </div>
        )}
      </div>

      {showWatermark && (
        <div className="px-5 pb-4 text-[10px] text-center opacity-60">
          Made with <span className="font-semibold">ViewTree</span>
        </div>
      )}
    </div>
  );
}
