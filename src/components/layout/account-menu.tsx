"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type MinimalProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export function AccountMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MinimalProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      setProfile(
        (profileData as MinimalProfile) ?? {
          username: user.email ? user.email.split("@")[0] : null,
          display_name: user.user_metadata?.full_name ?? null,
          avatar_url: null,
        }
      );
      setLoading(false);
    };

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsOpen(false);
    router.push("/");
  };

  if (loading || !user || !profile) {
    return null;
  }

  const displayName =
    profile.display_name || profile.username || (user.email ?? "Account");

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative inline-flex items-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 rounded-full pl-1 pr-3 flex items-center gap-2 border-border/80 bg-card/80"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Avatar className="w-7 h-7 border border-border/80">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName} />
          <AvatarFallback className="text-xs font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="max-w-[120px] truncate text-xs font-medium text-foreground/80">
          {displayName}
        </span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-lg py-2 text-sm z-50">
          <div className="px-3 pb-2 border-b border-border/80 mb-1">
            <p className="font-medium truncate">{displayName}</p>
            {user.email && (
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
          <Link
            href="/app"
            className="block px-3 py-1.5 text-xs hover:bg-muted text-foreground"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/settings"
            className="block px-3 py-1.5 text-xs hover:bg-muted text-foreground"
            onClick={() => setIsOpen(false)}
          >
            Account settings
          </Link>
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
