"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selected: "all" | Category;
  onSelect: (value: "all" | Category) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const unique = Array.from(new Set(categories));
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(maxScroll - scrollLeft > 2);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;

    // Convert vertical wheel into horizontal scroll while hovering the filter bar
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      container.scrollLeft += event.deltaY;
      event.preventDefault();
      updateScrollState();
    }
  };

  const handleScroll = () => {
    updateScrollState();
  };

  useEffect(() => {
    updateScrollState();
  }, [unique.length]);

  if (unique.length === 0) return null;

  return (
    <div className="relative flex items-center gap-2">
      {/* Left arrow */}
      <button
        type="button"
        onClick={() => {
          const container = scrollRef.current;
          if (!container) return;
          container.scrollBy({ left: -160, behavior: "smooth" });
          setTimeout(updateScrollState, 200);
        }}
        disabled={!canScrollLeft}
        className="h-7 w-7 inline-flex items-center justify-center rounded-full border text-muted-foreground disabled:opacity-30 disabled:cursor-default"
        aria-label="Scroll categories left"
      >
        <ChevronLeft className="w-3 h-3" />
      </button>

      {/* Scrollable pills */}
      <div
        ref={scrollRef}
        className="category-scroll overflow-x-auto -mx-1 px-1 pb-1 flex-1"
        onWheel={handleWheel}
        onScroll={handleScroll}
      >
        <div className="flex flex-nowrap gap-2">
          <button
            type="button"
            onClick={() => onSelect("all")}
            className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap ${
              selected === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border"
            }`}
          >
            All views
          </button>
          {unique.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap ${
                selected === category
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Right arrow */}
      <button
        type="button"
        onClick={() => {
          const container = scrollRef.current;
          if (!container) return;
          container.scrollBy({ left: 160, behavior: "smooth" });
          setTimeout(updateScrollState, 200);
        }}
        disabled={!canScrollRight}
        className="h-7 w-7 inline-flex items-center justify-center rounded-full border text-muted-foreground disabled:opacity-30 disabled:cursor-default"
        aria-label="Scroll categories right"
      >
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
