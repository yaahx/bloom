"use client";

import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface CategorySelectorProps {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
  onCreateCategory: (newCategory: string) => void;
}

export default function CategorySelector({
  categories,
  value,
  onChange,
  onCreateCategory,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 20);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const filteredCategories = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return categories;
    return categories.filter((c) => c.toLowerCase().includes(trimmed));
  }, [categories, query]);

  const trimmedQuery = query.trim();
  const exactMatchExists = useMemo(
    () =>
      categories.some(
        (c) => c.toLowerCase() === trimmedQuery.toLowerCase()
      ),
    [categories, trimmedQuery]
  );

  const handleSelect = (cat: string) => {
    onChange(cat);
    setIsOpen(false);
    setQuery("");
  };

  const handleCreate = () => {
    if (!trimmedQuery || exactMatchExists) return;
    onCreateCategory(trimmedQuery);
    onChange(trimmedQuery);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Minimal trigger sitting naturally in the layout */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between py-2.5 px-0 border-b border-border text-sm text-left bg-transparent hover:border-foreground/40 focus:outline-none focus:border-primary transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={value ? "text-foreground font-medium" : "text-muted-foreground"}>
          {value || "Select category"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Clean flat dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-background border border-border rounded-xl overflow-hidden">
          {/* Search / Create Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/70">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (trimmedQuery && !exactMatchExists) {
                    handleCreate();
                  } else if (filteredCategories.length === 1) {
                    handleSelect(filteredCategories[0]);
                  }
                } else if (e.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              placeholder="Search or create category..."
              className="w-full text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto py-1" role="listbox">
            {filteredCategories.map((cat) => {
              const isSelected = cat === value;
              return (
                <button
                  key={cat}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  <span>{cat}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}

            {filteredCategories.length === 0 && !trimmedQuery && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No categories found
              </p>
            )}

            {/* Inline Create Category Option */}
            {trimmedQuery && !exactMatchExists && (
              <button
                type="button"
                onClick={handleCreate}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-primary font-medium hover:bg-primary/10 transition-colors border-t border-border/60"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>Create &ldquo;{trimmedQuery}&rdquo;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
