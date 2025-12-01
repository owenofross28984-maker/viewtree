// Exactly 6 stem options per spec
export type StemType =
  | "I believe"
  | "I support"
  | "I oppose"
  | "I'm uncertain about"
  | "custom";

// Exactly 11 categories per spec
export type Category =
  | "Politics"
  | "Religion"
  | "Economics"
  | "Social Issues"
  | "Technology"
  | "Environment"
  | "Philosophy"
  | "Science"
  | "Health"
  | "Education"
  | "Other";

// Only public/private per spec
export type Visibility = "public" | "private";

export type SourceType = "url" | "file";

// Social media links
export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  profilePictureUrl?: string;
  socialLinks?: SocialLinks;
  createdAt: Date;
  updatedAt: Date;
}

// Renamed from Belief to View per spec
export interface View {
  id: string;
  userId: string;
  stemType: StemType;
  customStem?: string; // Only used when stemType is "custom"
  statement: string; // Main statement (e.g., "science is cool")
  description?: string; // Optional longer explanation
  category: Category;
  sources?: Source[];
  pinned: boolean; // Legacy pin flag (no longer used for ordering)
  position?: number; // Explicit order index for drag-and-drop
  visibility: Visibility;
  createdAt: Date; // Internal only, never shown to users
  updatedAt: Date; // Internal only, never shown to users
  user?: User;
}

// Simplified source model
export interface Source {
  id: string;
  viewId: string;
  type: SourceType;
  url?: string;
  title?: string;
  favicon?: string;
  fileUrl?: string;
  fileName?: string;
}

// Legacy type alias for backward compatibility during migration
export type Belief = View;
export type Evidence = Source;

export const CATEGORIES: Category[] = [
  "Politics",
  "Religion",
  "Economics",
  "Social Issues",
  "Technology",
  "Environment",
  "Philosophy",
  "Science",
  "Health",
  "Education",
  "Other",
];

// Exactly 6 stems per spec
export const STEM_TYPES: { value: StemType; label: string; example: string }[] = [
  {
    value: "I believe",
    label: "I believe...",
    example: "that climate change requires urgent action",
  },
  {
    value: "I support",
    label: "I support...",
    example: "ranked-choice voting",
  },
  {
    value: "I oppose",
    label: "I oppose...",
    example: "mass surveillance programs",
  },
  {
    value: "I'm uncertain about",
    label: "I'm uncertain about...",
    example: "the long-term effects of AI",
  },
  {
    value: "custom",
    label: "Custom (blank)",
    example: "Write your own statement",
  },
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Politics: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Religion: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Economics: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  "Social Issues": "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  Technology: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Environment: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Philosophy: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  Science: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Health: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  Education: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  Other: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

// Character limits for MVP
export const STATEMENT_CHAR_LIMIT = 200;
export const DESCRIPTION_CHAR_LIMIT = 1000;
export const CUSTOM_STEM_CHAR_LIMIT = 12;
