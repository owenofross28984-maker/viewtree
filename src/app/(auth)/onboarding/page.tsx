"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Globe,
  Lock,
  AtSign,
  Camera,
} from "lucide-react";
import { ViewTreeLogo } from "@/components/layout/logo";
import { ProfileCard, type PublicProfile } from "@/components/profile/profile-card";
import {
  CATEGORIES,
  STEM_TYPES,
  STATEMENT_CHAR_LIMIT,
  DESCRIPTION_CHAR_LIMIT,
  CUSTOM_STEM_CHAR_LIMIT,
  type Category,
  type StemType,
  type Visibility,
  type View,
} from "@/types";
import { supabase } from "@/lib/supabase";

const steps = [
  { id: 1, title: "Welcome" },
  { id: 2, title: "Profile & Theme" },
  { id: 3, title: "Category" },
  { id: 4, title: "Stem" },
  { id: 5, title: "Complete view" },
  { id: 6, title: "Visibility" },
  { id: 7, title: "Complete" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [beliefData, setBeliefData] = useState({
    category: "" as Category | "",
    stemType: "" as StemType | "",
    customStem: "",
    statement: "",
    description: "",
    visibility: "public" as Visibility,
  });
  const [error, setError] = useState<string | null>(null);
  const [profileDraft, setProfileDraft] = useState({
    username: "",
    displayName: "",
    bio: "",
    themeBackground: "#020617",
    themeCard: "#020617",
    themeAccent: "#4b5563",
    themeText: "#f9fafb",
    themeFont: "sans" as const,
    socialInstagram: "",
    socialTwitter: "",
    socialYoutube: "",
    socialSpotify: "",
    socialWebsite: "",
  });
  const [skipProfileSetup, setSkipProfileSetup] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserAndAvatar = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profileRow && typeof profileRow.avatar_url === "string") {
        setAvatarUrl(profileRow.avatar_url);
      }
    };

    void loadUserAndAvatar();
  }, [router]);

  useEffect(() => {
    const value = profileDraft.username;

    if (!value || value.length < 3) {
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
        .eq("username", value)
        .maybeSingle();

      if (availabilityError) {
        console.error("Onboarding: error checking username availability", availabilityError);
        setUsernameAvailable(null);
      } else {
        setUsernameAvailable(!data);
      }
      setCheckingUsername(false);
    }, 400);

    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, [profileDraft.username]);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You need to be logged in to finish onboarding.");
        console.error("Onboarding: getUser failed or no user", userError);
        setIsLoading(false);
        return;
      }

      // Persist profile choices (username always, theme + display/bio only if not skipped)
      const username = profileDraft.username.trim();
      const displayName = profileDraft.displayName.trim();
      const bio = profileDraft.bio.trim();

      const profileUpdatePayload: Record<string, string | null | typeof profileDraft.themeFont> = {
        username: username || null,
      };

      if (!skipProfileSetup) {
        profileUpdatePayload.display_name = displayName || null;
        profileUpdatePayload.bio = bio || null;
        profileUpdatePayload.theme_background = profileDraft.themeBackground?.trim() || null;
        profileUpdatePayload.theme_card = profileDraft.themeCard?.trim() || null;
        profileUpdatePayload.theme_accent = profileDraft.themeAccent?.trim() || null;
        profileUpdatePayload.theme_text = profileDraft.themeText?.trim() || null;
        profileUpdatePayload.theme_font = profileDraft.themeFont;

        const socialInstagram = profileDraft.socialInstagram.trim();
        const socialTwitter = profileDraft.socialTwitter.trim();
        const socialYoutube = profileDraft.socialYoutube.trim();
        const socialSpotify = profileDraft.socialSpotify.trim();
        const socialWebsite = profileDraft.socialWebsite.trim();

        const lowerInstagram = socialInstagram.toLowerCase();
        const lowerTwitter = socialTwitter.toLowerCase();
        const lowerYoutube = socialYoutube.toLowerCase();
        const lowerSpotify = socialSpotify.toLowerCase();

        if (
          (socialInstagram && !lowerInstagram.includes("instagram")) ||
          (socialTwitter &&
            !(
              lowerTwitter.includes("twitter") ||
              lowerTwitter.includes("x.com")
            )) ||
          (socialYoutube && !lowerYoutube.includes("youtube")) ||
          (socialSpotify && !lowerSpotify.includes("spotify"))
        ) {
          setError(
            "Social links must include the platform name (Instagram, Twitter/X, YouTube, Spotify).",
          );
          setIsLoading(false);
          return;
        }

        profileUpdatePayload.social_instagram = socialInstagram || null;
        profileUpdatePayload.social_twitter = socialTwitter || null;
        profileUpdatePayload.social_youtube = socialYoutube || null;
        profileUpdatePayload.social_spotify = socialSpotify || null;
        profileUpdatePayload.social_website = socialWebsite || null;
      }

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update(profileUpdatePayload)
        .eq("id", user.id);

      if (profileUpdateError) {
        setError(profileUpdateError.message);
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
        stem_type: beliefData.stemType,
        custom_stem:
          beliefData.stemType === "custom" ? beliefData.customStem : null,
        statement: beliefData.statement,
        description: beliefData.description || null,
        category: beliefData.category,
        pinned: false,
        position: nextPosition,
        visibility: beliefData.visibility,
      };

      const { error: insertError } = await supabase.from("views").insert(payload);

      if (insertError) {
        setError(insertError.message);
        console.error("Onboarding: inserting view failed", insertError);
        setIsLoading(false);
        return;
      }

      router.push("/app");
    } catch (e) {
      console.error("Onboarding: unexpected error while publishing view", e);
      setError("Unexpected error while publishing your view.");
      setIsLoading(false);
    }
  };

  const getStem = () => {
    if (beliefData.stemType === "custom") {
      return beliefData.customStem;
    }
    return beliefData.stemType;
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

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

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

      setAvatarUrl(publicUrl);
    } catch (e) {
      console.error("Onboarding: error uploading avatar", e);
      setAvatarError("Problem uploading image. Please try a smaller file.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Static example view used in onboarding preview so users can see card layout
  const examplePreviewView: View = {
    id: "onboarding-preview-example",
    userId: "preview-user",
    stemType: "I believe",
    customStem: undefined,
    statement:
      "that democracy works better when people share what they actually think.",
    description:
      "This is an example view. Add your own views to explain what you believe, support, or oppose.",
    category: "Politics",
    sources: [],
    pinned: false,
    position: -1,
    visibility: "public",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const previewViews: View[] = [examplePreviewView];

  const onboardingPreviewProfile: PublicProfile = {
    id: "preview-user",
    username: profileDraft.username || "yourname",
    display_name: profileDraft.displayName || "Your name",
    bio:
      profileDraft.bio ||
      "A short line about you so visitors know who you are.",
    avatar_url: avatarUrl,
    theme_background: profileDraft.themeBackground,
    theme_card: profileDraft.themeCard,
    theme_accent: profileDraft.themeAccent,
    theme_text: profileDraft.themeText,
    theme_font: profileDraft.themeFont,
    social_instagram: profileDraft.socialInstagram || null,
    social_twitter: profileDraft.socialTwitter || null,
    social_youtube: profileDraft.socialYoutube || null,
    social_spotify: profileDraft.socialSpotify || null,
    social_website: profileDraft.socialWebsite || null,
    hide_display_name: false,
    hide_username: false,
    hide_bio: false,
  };

  const previewBackground =
    onboardingPreviewProfile.theme_background ?? "#020617";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-viewtree mx-auto px-4 py-4 flex items-center justify-between">
          <ViewTreeLogo showText />
          
          {/* Progress */}
          <div className="flex items-center gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  step.id <= currentStep
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <h1 className="text-4xl font-bold mb-4">Welcome to ViewTree</h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
                  Let&apos;s create your first view.
                </p>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                  onClick={nextStep}
                >
                  Create My First View
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Profile & Theme (optional) */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-2 text-center">Set up your public page</h2>
                <p className="text-muted-foreground mb-8 text-center max-w-xl mx-auto">
                  Choose your @username, then add an optional display name, short bio, and colors for your page.
                  You can skip the styling and we&apos;ll use the default dark theme.
                </p>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
                  <Card className="mb-4 lg:mb-0">
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <Label htmlFor="username" className="text-sm font-medium mb-1 block">
                          Username
                        </Label>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="username"
                            placeholder="yourname"
                            className="pl-10 pr-10"
                            value={profileDraft.username}
                            onChange={(e) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                              }))
                            }
                            minLength={3}
                            maxLength={20}
                            required
                          />
                          {checkingUsername && profileDraft.username.length >= 3 && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <span className="inline-block w-3 h-3 border-2 border-muted-foreground/40 border-t-muted-foreground rounded-full animate-spin" />
                            </div>
                          )}
                          {!checkingUsername && usernameAvailable !== null && profileDraft.username.length >= 3 && (
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
                          Your public link will be viewtr.ee/@{profileDraft.username || "username"}
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="displayName" className="text-sm font-medium mb-1 block">
                          Display name <span className="font-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          id="displayName"
                          placeholder="Your name"
                          value={profileDraft.displayName}
                          onChange={(e) =>
                            setProfileDraft((prev) => ({ ...prev, displayName: e.target.value }))
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="profileBio" className="text-sm font-medium mb-1 block">
                          Bio <span className="font-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                          id="profileBio"
                          placeholder="A short line about you..."
                          value={profileDraft.bio}
                          onChange={(e) =>
                            setProfileDraft((prev) => ({ ...prev, bio: e.target.value.slice(0, 100) }))
                          }
                          className="min-h-[60px] resize-none"
                          maxLength={100}
                        />
                      </div>

                      <div className="pt-2 border-t border-border space-y-3">
                        <p className="text-sm font-medium">Social links (optional)</p>
                        <p className="text-xs text-muted-foreground">
                          If you add a link, mention the platform name in the URL (for example, instagram.com, twitter.com, youtube.com, spotify.com).
                        </p>
                        <div className="space-y-2">
                          <Input
                            placeholder="Instagram link"
                            value={profileDraft.socialInstagram}
                            onChange={(e) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                socialInstagram: e.target.value,
                              }))
                            }
                            className="text-sm"
                          />
                          <Input
                            placeholder="Twitter/X link"
                            value={profileDraft.socialTwitter}
                            onChange={(e) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                socialTwitter: e.target.value,
                              }))
                            }
                            className="text-sm"
                          />
                          <Input
                            placeholder="YouTube link"
                            value={profileDraft.socialYoutube}
                            onChange={(e) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                socialYoutube: e.target.value,
                              }))
                            }
                            className="text-sm"
                          />
                          <Input
                            placeholder="Spotify link"
                            value={profileDraft.socialSpotify}
                            onChange={(e) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                socialSpotify: e.target.value,
                              }))
                            }
                            className="text-sm"
                          />
                          <Input
                            placeholder="Website URL"
                            value={profileDraft.socialWebsite}
                            onChange={(e) =>
                              setProfileDraft((prev) => ({
                                ...prev,
                                socialWebsite: e.target.value,
                              }))
                            }
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 border border-border">
                            <AvatarImage src={avatarUrl ?? undefined} />
                            <AvatarFallback className="text-sm font-semibold">
                              {(profileDraft.displayName || profileDraft.username || "Y")
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                              Profile picture (optional)
                            </p>
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor="onboarding-avatar-upload"
                                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                              >
                                <Camera className="w-3 h-3" />
                                <span>Upload image</span>
                              </label>
                              {uploadingAvatar && (
                                <p className="text-[11px] text-muted-foreground">
                                  Uploading avatar…
                                </p>
                              )}
                            </div>
                            {avatarError && (
                              <p className="text-[11px] text-destructive">{avatarError}</p>
                            )}
                            <input
                              id="onboarding-avatar-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                              disabled={uploadingAvatar}
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Theme (optional)</p>
                          <p className="text-xs text-muted-foreground">
                            Pick colors for your public page. If you skip, we&apos;ll keep the default dark theme.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-medium mb-1 block">Background</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={profileDraft.themeBackground}
                                onChange={(e) =>
                                  setProfileDraft((prev) => ({
                                    ...prev,
                                    themeBackground: e.target.value,
                                  }))
                                }
                                className="flex-1"
                              />
                              <input
                                type="color"
                                value={profileDraft.themeBackground}
                                onChange={(e) =>
                                  setProfileDraft((prev) => ({
                                    ...prev,
                                    themeBackground: e.target.value,
                                  }))
                                }
                                className="h-9 w-9 rounded-md border border-border bg-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium mb-1 block">Card</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={profileDraft.themeCard}
                                onChange={(e) =>
                                  setProfileDraft((prev) => ({ ...prev, themeCard: e.target.value }))
                                }
                                className="flex-1"
                              />
                              <input
                                type="color"
                                value={profileDraft.themeCard}
                                onChange={(e) =>
                                  setProfileDraft((prev) => ({ ...prev, themeCard: e.target.value }))
                                }
                                className="h-9 w-9 rounded-md border border-border bg-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium mb-1 block">Accent</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={profileDraft.themeAccent}
                                onChange={(e) =>
                                  setProfileDraft((prev) => ({ ...prev, themeAccent: e.target.value }))
                                }
                                className="flex-1"
                              />
                              <input
                                type="color"
                                value={profileDraft.themeAccent}
                                onChange={(e) =>
                                  setProfileDraft((prev) => ({ ...prev, themeAccent: e.target.value }))
                                }
                                className="h-9 w-9 rounded-md border border-border bg-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium mb-1 block">Text</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={profileDraft.themeText}
                                onChange={(e) =>
                                  setProfileDraft((prev) => ({ ...prev, themeText: e.target.value }))
                                }
                                className="flex-1"
                              />
                              <input
                                type="color"
                                value={profileDraft.themeText}
                                onChange={(e) =>
                                  setProfileDraft((prev) => ({ ...prev, themeText: e.target.value }))
                                }
                                className="h-9 w-9 rounded-md border border-border bg-transparent"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-medium mb-1 block">Font</Label>
                          <select
                            value={profileDraft.themeFont}
                            onChange={(e) =>
                              setProfileDraft((prev) => ({ ...prev, themeFont: e.target.value as typeof prev.themeFont }))
                            }
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                          >
                            <option value="sans">Sans (default)</option>
                            <option value="serif">Serif</option>
                            <option value="mono">Mono</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Live preview, styled similarly to the /app public page preview but without actions */}
                  <div className="hidden md:block">
                    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase mb-1">
                      Public page preview
                    </p>
                    <p className="text-sm font-medium text-foreground mb-2">
                      viewtr.ee/@{onboardingPreviewProfile.username}
                    </p>
                    <p className="text-[11px] text-muted-foreground mb-2">
                      This is how your page will start to look.
                    </p>
                    <div className="rounded-3xl border border-border/60 shadow-xl p-4 bg-card/80">
                      <div
                        className="mx-auto max-w-[420px] px-3 py-2 rounded-[32px] overflow-hidden max-h-[260px]"
                        style={{ backgroundColor: previewBackground }}
                      >
                        <div className="scale-50 origin-top">
                          <ProfileCard
                            profile={onboardingPreviewProfile}
                            views={previewViews}
                            showWatermark={true}
                            canCopyViews={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        !profileDraft.username ||
                        checkingUsername ||
                        usernameAvailable === false
                      }
                      onClick={() => {
                        setSkipProfileSetup(true);
                        nextStep();
                      }}
                    >
                      Skip for now
                    </Button>
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      disabled={
                        !profileDraft.username ||
                        checkingUsername ||
                        usernameAvailable === false
                      }
                      onClick={() => {
                        setSkipProfileSetup(false);
                        nextStep();
                      }}
                    >
                      Continue
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Category */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-2 text-center">Choose a category</h2>
                <p className="text-muted-foreground mb-8 text-center">
                  Categories are just for you to organize your views. They aren&apos;t shown on your public page.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {CATEGORIES.map((category) => (
                    <Card
                      key={category}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        beliefData.category === category
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setBeliefData({ ...beliefData, category })}
                    >
                      <CardContent className="p-4 text-center">
                        <span className="font-medium">{category}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={nextStep}
                    disabled={!beliefData.category}
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Stem */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-2 text-center">How would you phrase it?</h2>
                <p className="text-muted-foreground mb-8 text-center">
                  Choose a sentence starter for your view
                </p>
                
                <div className="space-y-3 mb-8">
                  {STEM_TYPES.map((stem) => (
                    <Card
                      key={stem.value}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        beliefData.stemType === stem.value
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setBeliefData({ ...beliefData, stemType: stem.value })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{stem.label}</p>
                            <p className="text-sm text-muted-foreground">
                              e.g., &quot;{stem.example}&quot;
                            </p>
                          </div>
                          {beliefData.stemType === stem.value && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {beliefData.stemType === "custom" && (
                  <div className="mb-8">
                    <Label htmlFor="customStem">Your custom stem</Label>
                    <Input
                      id="customStem"
                      placeholder="Enter your custom sentence starter..."
                      value={beliefData.customStem}
                      onChange={(e) =>
                        setBeliefData({
                          ...beliefData,
                          customStem: e.target.value.slice(0, CUSTOM_STEM_CHAR_LIMIT),
                        })
                      }
                      maxLength={CUSTOM_STEM_CHAR_LIMIT}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {beliefData.customStem.length}/{CUSTOM_STEM_CHAR_LIMIT}
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={nextStep}
                    disabled={!beliefData.stemType || (beliefData.stemType === "custom" && !beliefData.customStem)}
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Complete your view (statement + description) */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-2 text-center">Complete your view</h2>
                <p className="text-muted-foreground mb-8 text-center">
                  Finish the sentence, then add an optional description so it&apos;s clear how your view will read.
                </p>

                <Card className="mb-8">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <p className="text-lg text-muted-foreground mb-2">{getStem()}</p>
                      <Textarea
                        placeholder="science is cool"
                        value={beliefData.statement}
                        onChange={(e) =>
                          setBeliefData({
                            ...beliefData,
                            statement: e.target.value.slice(0, STATEMENT_CHAR_LIMIT),
                          })
                        }
                        className="text-xl font-semibold border-0 p-0 focus-visible:ring-0 resize-none min-h-[100px]"
                        maxLength={STATEMENT_CHAR_LIMIT}
                      />
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <Badge variant="outline">
                          {beliefData.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {beliefData.statement.length}/{STATEMENT_CHAR_LIMIT}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Description (optional)</Label>
                      <Textarea
                        placeholder="I think science education should be more accessible because..."
                        value={beliefData.description}
                        onChange={(e) =>
                          setBeliefData({
                            ...beliefData,
                            description: e.target.value.slice(0, DESCRIPTION_CHAR_LIMIT),
                          })
                        }
                        className="min-h-[150px] resize-none"
                        maxLength={DESCRIPTION_CHAR_LIMIT}
                      />
                      <p className="text-xs text-muted-foreground mt-2 text-right">
                        {beliefData.description.length}/{DESCRIPTION_CHAR_LIMIT}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={nextStep}
                    disabled={!beliefData.statement.trim()}
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 6: Visibility */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-2 text-center">Who can see this view?</h2>
                <p className="text-muted-foreground mb-8 text-center">
                  Choose the visibility for your view
                </p>
                
                <div className="space-y-3 mb-8">
                  {[
                    {
                      value: "public" as Visibility,
                      icon: Globe,
                      title: "Public",
                      description: "Anyone can view this on your profile",
                    },
                    {
                      value: "private" as Visibility,
                      icon: Lock,
                      title: "Private",
                      description: "Only you can see this view",
                    },
                  ].map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        beliefData.visibility === option.value
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() =>
                        setBeliefData({ ...beliefData, visibility: option.value })
                      }
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <option.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{option.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                        {beliefData.visibility === option.value && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90" onClick={nextStep}>
                    Review View
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 7: Complete */}
            {currentStep === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-2 text-center">Review your view</h2>
                <p className="text-muted-foreground mb-8 text-center">
                  Here&apos;s how your view will appear
                </p>
                
                <Card className="mb-8 overflow-hidden border-border rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">
                        {beliefData.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        {beliefData.visibility === "public" && <Globe className="w-4 h-4" />}
                        {beliefData.visibility === "private" && <Lock className="w-4 h-4" />}
                        <span className="capitalize">{beliefData.visibility}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-1">{getStem()}</p>
                    <p className="text-xl font-semibold mb-4 break-words whitespace-pre-wrap">
                      {beliefData.statement}
                    </p>
                    {beliefData.description.trim() && (
                      <div className="mb-4 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                          {beliefData.description}
                        </p>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Created just now
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    size="lg"
                    onClick={handleComplete}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Publishing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Publish View
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>

                {error && (
                  <p className="mt-4 text-sm text-destructive text-center">{error}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
