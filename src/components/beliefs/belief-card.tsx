"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2, ChevronDown, GripVertical, Lock } from "lucide-react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { View } from "@/types";

// ViewTree View Card - Per spec:
// White card, 1px #E5E7EB border, 16px radius, 20px padding
// Top: category name (14px #666) + tiny pastel icon
// Middle: stem in #888 15px
// Bottom: statement Inter Bold 20px #111, max 240 chars free / 2000 Pro
// Hover lift only
// Tiny emerald download icon bottom-right

interface ViewCardProps {
  view: View;
  username?: string;
  onClick?: () => void;
  index?: number;
  onEdit?: (viewId: string) => void;
  onDelete?: (viewId: string) => void;
  onCopy?: (viewId: string) => void;
  showActions?: boolean; // Show three-dot menu for dashboard (edit/delete)
  showCopyAction?: boolean; // Show three-dot menu with copy action on public profiles
  showCategory?: boolean; // Show category icon + label in header
  showVisibility?: boolean; // Show a private visibility indicator for owner-facing views
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
}

export function ViewCard({
  view,
  onClick,
  onEdit,
  onDelete,
  onCopy,
  showActions = false,
  showCopyAction = false,
  showCategory = true,
  showVisibility = false,
  dragListeners,
  dragAttributes,
}: ViewCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasDescription = Boolean(view.description && view.description.trim());

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const getStem = () => {
    if (view.stemType === "custom") {
      return view.customStem || "";
    }
    return view.stemType;
  };

  const handleMenuAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
    setMenuOpen(false);
  };

  const handleCardClick = () => {
    // If there's a description, toggle expansion
    if (hasDescription) {
      setExpanded(!expanded);
    }
    // Also call the onClick handler if provided
    onClick?.();
  };

  return (
    <div
      className="bg-card border border-border rounded-2xl p-5 cursor-pointer relative"
      onClick={handleCardClick}
    >
      {/* Category + Actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {dragListeners && dragAttributes && (
            <button
              type="button"
              {...dragListeners}
              {...dragAttributes}
              onClick={(e) => e.preventDefault()}
              className="mr-1 inline-flex items-center justify-center text-muted-foreground cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <GripVertical className="w-3 h-3" />
            </button>
          )}
          {showCategory && (
            <span className="text-sm text-muted-foreground">{view.category}</span>
          )}
        </div>

        {/* Three-dot menu: owner (edit/delete) or viewer (copy) */}
        {(showActions || showCopyAction) && (
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-background border border-border rounded-xl shadow-lg py-1 overflow-hidden">
                {showCopyAction && (
                  <button
                    onClick={handleMenuAction(() => onCopy?.(view.id))}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                  >
                    Add to my page
                  </button>
                )}
                {showActions && (
                  <>
                    {showCopyAction && <div className="h-px bg-border my-1" />}
                    <button
                      onClick={handleMenuAction(() => onEdit?.(view.id))}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={handleMenuAction(() => onDelete?.(view.id))}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visibility indicator (owner-facing only) */}
      {showVisibility && view.visibility === "private" && (
        <div className="flex justify-end mb-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            <Lock className="w-3 h-3" />
            Private
          </span>
        </div>
      )}

      {/* Stem - #888 15px */}
      {getStem() && (
        <p className="text-[15px] text-[#888] mb-1">{getStem()}</p>
      )}

      {/* Statement - Inter Bold 20px #111 */}
      <p className="text-xl font-bold text-foreground leading-snug mb-4 break-words whitespace-pre-wrap">
        {view.statement}
      </p>

      {/* Description - shown when expanded, with smooth layout + spring "bubble" animation */}
      {hasDescription && expanded && (
        <div className="mb-4 pt-3 border-t border-border">
          <p className="text-base text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
            {view.description}
          </p>
        </div>
      )}

      {/* Bottom actions: Read more indicator + Download icon */}
      <div className="flex justify-between items-center">
        {hasDescription && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {expanded ? "Show less" : "Read more"}
            <ChevronDown className={`w-4 h-4 ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
    </div>
  );
}

// Backward compatible alias
export function BeliefCard(props: ViewCardProps & { belief?: View }) {
  const view = props.view || props.belief;
  if (!view) return null;
  return <ViewCard {...props} view={view} />;
}
