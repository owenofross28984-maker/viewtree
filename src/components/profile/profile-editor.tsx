"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileCard } from "./profile-card";
import { View } from "@/types";
import { PublicProfile } from "./profile-card";
import { Camera, Instagram, Twitter, Youtube, Globe, Music2 } from "lucide-react";

type ProfileEditorProps = {
  profile: PublicProfile;
  views: View[];
  draft: {
    displayName: string;
    bio: string;
    themeBackground: string;
    themeCard: string;
    themeAccent: string;
    themeText: string;
    themeFont: string;
    socialInstagram: string;
    socialTwitter: string;
    socialYoutube: string;
    socialSpotify: string;
    socialWebsite: string;
    hideDisplayName: boolean;
    hideUsername: boolean;
    hideBio: boolean;
  };
  onSave: () => void;
  onCancel: () => void;
  onDraftChange: (updates: Partial<ProfileEditorProps['draft']>) => void;
  onAvatarChange: (file: File) => void;
  uploadingAvatar: boolean;
  saving: boolean;
};

export function ProfileEditor({
  profile,
  views,
  draft,
  onSave,
  onCancel,
  onDraftChange,
  onAvatarChange,
  uploadingAvatar,
  saving,
}: ProfileEditorProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Editor Form */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <p className="text-muted-foreground">
              Customize how your profile appears to others
            </p>
          </div>

          <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-2 border-foreground/10">
                    <AvatarImage
                      src={
                        profile.avatar_url ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`
                      }
                      alt={profile.username}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-foreground"></div>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploadingAvatar}
                  />
                  <Label
                    htmlFor="avatar"
                    className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium cursor-pointer hover:bg-accent"
                  >
                    <Camera className="h-4 w-4" />
                    {uploadingAvatar ? 'Uploading...' : 'Change'}
                  </Label>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hide-display-name"
                    checked={draft.hideDisplayName}
                    onCheckedChange={(checked: boolean) =>
                      onDraftChange({ hideDisplayName: checked })
                    }
                  />
                  <Label htmlFor="hide-display-name" className="text-sm font-normal">
                    Hide
                  </Label>
                </div>
              </div>
              <Input
                id="displayName"
                value={draft.displayName}
                onChange={(e) => onDraftChange({ displayName: e.target.value })}
                placeholder="Your name"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio">Bio</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hide-bio"
                    checked={draft.hideBio}
                    onCheckedChange={(checked: boolean) =>
                      onDraftChange({ hideBio: checked })
                    }
                  />
                  <Label htmlFor="hide-bio" className="text-sm font-normal">
                    Hide
                  </Label>
                </div>
              </div>
              <textarea
                id="bio"
                value={draft.bio}
                onChange={(e) => onDraftChange({ bio: e.target.value })}
                placeholder="Tell others about yourself..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </div>

            {/* Theme Colors */}
            <div className="space-y-4">
              <h3 className="font-medium">Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="themeBackground">Background</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="themeBackground"
                      value={draft.themeBackground}
                      onChange={(e) =>
                        onDraftChange({ themeBackground: e.target.value })
                      }
                      className="h-10 w-10 rounded border"
                    />
                    <Input
                      value={draft.themeBackground}
                      onChange={(e) =>
                        onDraftChange({ themeBackground: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="themeCard">Card</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="themeCard"
                      value={draft.themeCard}
                      onChange={(e) =>
                        onDraftChange({ themeCard: e.target.value })
                      }
                      className="h-10 w-10 rounded border"
                    />
                    <Input
                      value={draft.themeCard}
                      onChange={(e) =>
                        onDraftChange({ themeCard: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="themeAccent">Accent</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="themeAccent"
                      value={draft.themeAccent}
                      onChange={(e) =>
                        onDraftChange({ themeAccent: e.target.value })
                      }
                      className="h-10 w-10 rounded border"
                    />
                    <Input
                      value={draft.themeAccent}
                      onChange={(e) =>
                        onDraftChange({ themeAccent: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="themeText">Text</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="themeText"
                      value={draft.themeText}
                      onChange={(e) =>
                        onDraftChange({ themeText: e.target.value })
                      }
                      className="h-10 w-10 rounded border"
                    />
                    <Input
                      value={draft.themeText}
                      onChange={(e) =>
                        onDraftChange({ themeText: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="font-medium">Social Links</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={draft.socialInstagram}
                    onChange={(e) =>
                      onDraftChange({ socialInstagram: e.target.value })
                    }
                    placeholder="Instagram username"
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Twitter className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={draft.socialTwitter}
                    onChange={(e) =>
                      onDraftChange({ socialTwitter: e.target.value })
                    }
                    placeholder="Twitter username"
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={draft.socialYoutube}
                    onChange={(e) =>
                      onDraftChange({ socialYoutube: e.target.value })
                    }
                    placeholder="YouTube channel ID or username"
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Music2 className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={draft.socialSpotify}
                    onChange={(e) =>
                      onDraftChange({ socialSpotify: e.target.value })
                    }
                    placeholder="Spotify profile ID"
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={draft.socialWebsite}
                    onChange={(e) =>
                      onDraftChange({ socialWebsite: e.target.value })
                    }
                    placeholder="Website URL"
                    type="url"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-4 h-fit">
          <div className="mb-2 text-sm font-medium text-muted-foreground">
            Live Preview
          </div>
          <div className="rounded-lg border p-4">
            <ProfileCard
              profile={{
                ...profile,
                display_name: draft.hideDisplayName ? null : draft.displayName || profile.display_name,
                bio: draft.hideBio ? null : draft.bio || profile.bio,
                theme_background: draft.themeBackground,
                theme_card: draft.themeCard,
                theme_accent: draft.themeAccent,
                theme_text: draft.themeText,
                theme_font: draft.themeFont,
                social_instagram: draft.socialInstagram || null,
                social_twitter: draft.socialTwitter || null,
                social_youtube: draft.socialYoutube || null,
                social_spotify: draft.socialSpotify || null,
                social_website: draft.socialWebsite || null,
                hide_display_name: draft.hideDisplayName,
                hide_username: draft.hideUsername,
                hide_bio: draft.hideBio,
              }}
              views={views}
              showWatermark={false}
              canCopyViews={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
