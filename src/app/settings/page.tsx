"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    void load();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteConfirm !== "DELETE") {
      setDeleteError("You must type DELETE to confirm.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      setDeleteError("Unable to verify your session. Please sign in again.");
      setDeleting(false);
      return;
    }

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        let message = "Failed to delete account. Please try again.";
        try {
          const body = await res.json();
          if (body?.error) {
            message = body.error as string;
          }
        } catch {}
        setDeleteError(message);
        setDeleting(false);
        return;
      }

      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setDeleteError("Unexpected error deleting account.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading account information...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const providers = (user.identities ?? []).map((id) => id.provider).join(", ");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Account settings</CardTitle>
            <CardDescription>
              Manage how you sign in to ViewTree and where your account lives.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <p className="mt-1">{user.email ?? "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Signed in with</p>
              <p className="mt-1">{providers || "Email and password"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">User ID</p>
              <p className="mt-1 break-all text-xs text-muted-foreground">{user.id}</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/app")}
              >
                Open dashboard
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleSignOut}
              >
                Sign out everywhere
              </Button>
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                Danger zone
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                This will permanently delete your profile, views, and account. This action cannot be undone.
              </p>
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Type <span className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">DELETE</span> to confirm.
                </p>
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="text-xs"
                />
              </div>
              {deleteError && (
                <p className="mt-2 text-xs text-red-500">{deleteError}</p>
              )}
              <Button
                type="button"
                className="mt-3 w-full text-xs bg-red-500 hover:bg-red-600 text-white"
                disabled={deleteConfirm !== "DELETE" || deleting}
                onClick={handleDeleteAccount}
              >
                {deleting ? "Deleting account..." : "Delete my account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
