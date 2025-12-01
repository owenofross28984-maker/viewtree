"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ViewTreeLogo } from "@/components/layout/logo";
import { AccountMenu } from "@/components/layout/account-menu";

// 3-step flow
const steps = [
  {
    number: "1",
    title: "Create your page",
    description: "Sign up in seconds and claim a short viewtr.ee/@username link.",
  },
  {
    number: "2",
    title: "Add a few views",
    description: "Write what you believe, support, or oppose  just a sentence at a time.",
  },
  {
    number: "3",
    title: "Share one link",
    description: "Drop your page in bios, profiles, and messages instead of long threads.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - 100vh on mobile */}
      <section className="min-h-screen flex flex-col px-4">
        {/* Top bar: centered logo with account menu on the right */}
        <div className="pt-6 max-w-viewtree mx-auto w-full flex items-center justify-center relative">
          <ViewTreeLogo showText />
          <div className="absolute right-0">
            <AccountMenu />
          </div>
        </div>

        {/* Hero content - centered */}
        <div className="flex-1 flex flex-col justify-center items-center text-center max-w-viewtree mx-auto w-full">
          <h1 className="text-hero-mobile md:text-hero font-bold tracking-tight mb-4">
            Your views in one link.
          </h1>
          <p className="text-xl font-medium text-secondary-foreground mb-8 max-w-xl">
            One page that always matches what you actually think, support, and oppose.
          </p>

          <div className="flex flex-col gap-3 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              asChild
            >
              <Link href="/signup">
                Get started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href="/login">
                Already have one? Sign in
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section 3: How it works - light green background */}
      <section className="py-16 px-4 bg-accent">
        <div className="max-w-viewtree mx-auto">
          <h2 className="text-3xl font-bold mb-3">How it works</h2>
          <p className="text-muted-foreground mb-10 max-w-xl">
            A tiny flow designed for people who think in sentences, not threads.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-card border border-border/60 rounded-2xl p-5 h-full flex"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer - single line per spec */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-viewtree mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Made by one person who got tired of Twitter threads.
          </p>
          <div className="flex gap-4 text-sm justify-start sm:justify-end">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
