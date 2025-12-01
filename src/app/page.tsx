"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ViewTreeLogo } from "@/components/layout/logo";
import { AccountMenu } from "@/components/layout/account-menu";

const heroPreviewImages = [
  { src: "/images/profile-preview-1.png", alt: "Example ViewTree profile 1" },
  { src: "/images/profile-preview-2.png", alt: "Example ViewTree profile 2" },
  { src: "/images/profile-preview-3.png", alt: "Example ViewTree profile 3" },
];

// 3-step flow
const steps = [
  {
    number: "1",
    title: "Choose your @name",
    description: "Sign up in 10 seconds with email or Google.",
  },
  {
    number: "2",
    title: "Add your views",
    description: "Write what you believe, support, or oppose.",
  },
  {
    number: "3",
    title: "Share one link",
    description: "Put viewtr.ee/@you in your bio. Done.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - 100vh on mobile */}
      <section className="min-h-screen flex flex-col px-4">
        {/* Top bar: wordmark + account menu */}
        <div className="pt-6 flex items-center justify-between max-w-viewtree mx-auto w-full">
          <ViewTreeLogo showText />
          <AccountMenu />
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

          {/* Ultra-modern trio of profile image previews */}
          <div className="mt-10 w-full max-w-5xl mx-auto">
            <div className="relative flex flex-col items-center">
              <div className="pointer-events-none select-none grid gap-6 md:grid-cols-3 w-full max-w-5xl">
                {heroPreviewImages.map((img) => (
                  <div
                    key={img.src}
                    className="rounded-[32px] border border-border/60 shadow-xl overflow-hidden bg-card/80"
                  >
                    <div className="px-3 pt-4 pb-5">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={480}
                        height={720}
                        className="w-full h-auto rounded-[24px] object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How it works - light green background */}
      <section className="py-16 px-4 bg-accent">
        <div className="max-w-viewtree mx-auto">
          <h2 className="text-2xl font-bold mb-8">How it works</h2>
          
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-card border border-border rounded-2xl p-5 h-full flex"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
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
