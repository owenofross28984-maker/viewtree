"use client";

import Link from "next/link";
import Image from "next/image";
import ViewTreeIcon from "../../../icon.png";

interface ViewTreeLogoProps {
  showText?: boolean;
  size?: number;
  className?: string;
}

export function ViewTreeLogo({ showText = false, size = 28, className = "" }: ViewTreeLogoProps) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2"
      aria-label="Go to ViewTree home"
    >
      <Image
        src={ViewTreeIcon}
        alt="ViewTree logo"
        width={size}
        height={size}
        className={`shrink-0 ${className}`.trim()}
        priority
      />
      {showText && (
        <span className="text-[28px] font-bold text-primary leading-none">
          ViewTree
        </span>
      )}
    </Link>
  );
}
