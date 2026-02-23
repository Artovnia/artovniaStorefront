"use client";

import { Input } from "@/components/atoms";
import { SearchIcon } from "@/icons";
import { useRouter } from "@/i18n/routing";
import { client } from "@/lib/client";
import { useState, useEffect, useRef } from "react";

const ALGOLIA_PRODUCTS_INDEX =
  process.env.NEXT_PUBLIC_ALGOLIA_PRODUCTS_INDEX || "products";
const ALGOLIA_QUERY_SUGGESTIONS_INDEX =
  process.env.NEXT_PUBLIC_ALGOLIA_QUERY_SUGGESTIONS_INDEX || "";
const suggestionsEnabled = true;
const enabled = true;

type SuggestionItem = {
  value: string;
  source: "query_suggestions" | "products";
  categoryLabel?: string;
};

const extractQuerySuggestionCategoryLabel = (
  hit: Record<string, any>
): string | undefined => {
  if (
    typeof hit?.__autocomplete_qsCategory === "string" &&
    hit.__autocomplete_qsCategory.trim()
  ) {
    return hit.__autocomplete_qsCategory.trim();
  }

  const direct = hit["categories.name"];
  if (Array.isArray(direct) && direct.length > 0) {
    return String(direct[0] || "").trim() || undefined;
  }

  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  const nestedCategories = hit?.categories?.name;
  if (Array.isArray(nestedCategories) && nestedCategories.length > 0) {
    return String(nestedCategories[0] || "").trim() || undefined;
  }

  if (typeof nestedCategories === "string" && nestedCategories.trim()) {
    return nestedCategories.trim();
  }

  if (typeof hit?.category === "string" && hit.category.trim()) {
    return hit.category.trim();
  }

  if (Array.isArray(hit?.categories) && hit.categories.length > 0) {
    const firstCategory = hit.categories[0];
    if (typeof firstCategory === "string" && firstCategory.trim()) {
      return firstCategory.trim();
    }

    if (
      typeof firstCategory?.name === "string" &&
      firstCategory.name.trim()
    ) {
      return firstCategory.name.trim();
    }
  }

  const exactMatches = hit?.facets?.exact_matches;
  if (Array.isArray(exactMatches) && exactMatches.length > 0) {
    const firstMatch = exactMatches[0];
    if (
      typeof firstMatch?.value === "string" &&
      firstMatch.value.trim()
    ) {
      return firstMatch.value.trim();
    }
  }

  return undefined;
};

export const NavbarSearch = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query");
    if (query) {
      setSearch(query);
    }
  }, []);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = search.trim();
    setShowSuggestions(false);
    if (query) {
      router.push(`/categories?query=${encodeURIComponent(query)}`);
      return;
    }
    router.push(`/categories`);
  };

  const handleClear = () => {
    setSearch("");
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const selectSuggestion = (query: string) => {
    const normalized = query.trim();
    if (!normalized) return;
    setSearch(normalized);
    setShowSuggestions(false);
    router.push(`/categories?query=${encodeURIComponent(normalized)}`);
  };

  useEffect(() => {
    const query = search.trim();

    if (!suggestionsEnabled) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const requestId = ++requestSequenceRef.current;
      setIsLoadingSuggestions(true);

      try {
        const queries: any[] = [];

        if (ALGOLIA_QUERY_SUGGESTIONS_INDEX) {
          queries.push({
            indexName: ALGOLIA_QUERY_SUGGESTIONS_INDEX,
            params: {
              query,
              hitsPerPage: 5,
              attributesToRetrieve: [
                "query",
                "categories.name",
                "categories",
                "category",
                "__autocomplete_qsCategory",
                "facets",
              ],
            },
          });
        }

        queries.push({
          indexName: ALGOLIA_PRODUCTS_INDEX,
          params: {
            query,
            hitsPerPage: 8,
            attributesToRetrieve: [
              "title",
              "categories.name",
              "categories",
              "category",
            ],
          },
        });

        const response = await client.search(queries);

        if (requestId !== requestSequenceRef.current) return;

        const results = response.results || [];
        const dedup = new Set<string>();
        const merged: SuggestionItem[] = [];

        if (ALGOLIA_QUERY_SUGGESTIONS_INDEX && results.length >= 2) {
          const qsHits = (results[0] as any)?.hits || [];
          for (const hit of qsHits) {
            const value = String(hit?.query || "").trim();
            if (!value) continue;
            const key = value.toLowerCase();
            if (dedup.has(key)) continue;
            dedup.add(key);
            merged.push({
              value,
              source: "query_suggestions",
              categoryLabel:
                extractQuerySuggestionCategoryLabel(hit),
            });
          }
        }

        const productResult = results[results.length - 1] as any;
        const productHits = productResult?.hits || [];
        for (const hit of productHits) {
          const value = String(hit?.title || "").trim();
          if (!value) continue;
          const key = value.toLowerCase();
          if (dedup.has(key)) continue;
          dedup.add(key);
          merged.push({
            value,
            source: "products",
            categoryLabel: extractQuerySuggestionCategoryLabel(hit),
          });
        }

        const final = merged.slice(0, 8);

        setSuggestions(final);
        setShowSuggestions(final.length > 0);
        setActiveSuggestionIndex(-1);
      } catch (error) {
        if (requestId === requestSequenceRef.current) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (requestId === requestSequenceRef.current) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex(
        (prev) => (prev + 1) % suggestions.length
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
      return;
    }

    if (
      event.key === "Enter" &&
      activeSuggestionIndex >= 0 &&
      activeSuggestionIndex < suggestions.length
    ) {
      event.preventDefault();
      selectSuggestion(suggestions[activeSuggestionIndex].value);
      return;
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  return (
    <form
      className="relative flex items-center w-full"
      role="search"
      aria-label="Wyszukiwarka produktów"
      method="POST"
      onSubmit={submitHandler}
    >
      <Input
        icon={<SearchIcon />}
        placeholder="Wyszukaj produkt"
        value={search}
        changeValue={setSearch}
        clearable={true}
        onClear={handleClear}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => setShowSuggestions(false), 120);
        }}
        className="py-2 text-md min-w-[350px] "
      />

      {suggestionsEnabled && showSuggestions && (
        <div className="absolute top-full right-0 z-50 mt-1 w-[min(92vw,36rem)] border border-[#3B3634]/15 bg-primary shadow-lg rounded-lg">
          <ul className="max-h-80 overflow-y-auto py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.value}-${suggestion.source}-${index}`}
              >
                <button
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm font-instrument-sans hover:bg-[#3B3634]/5 ${
                    activeSuggestionIndex === index
                      ? "bg-[#3B3634]/10"
                      : ""
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(suggestion.value);
                  }}
                >
                  <span className="flex w-full items-baseline justify-between gap-3 min-w-0">
                    <span className="truncate pr-2">
                      {suggestion.value}
                    </span>
                    {enabled && suggestion.categoryLabel && (
                      <span className="shrink-0 text-right text-xs sm:text-sm text-[#3B3634]/70">
                        w {suggestion.categoryLabel}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
            {isLoadingSuggestions && (
              <li className="px-4 py-2 text-xs text-[#3B3634]/60">
                Szukam podpowiedzi...
              </li>
            )}
          </ul>
        </div>
      )}

      <input type="submit" className="hidden" aria-label="Szukaj" />
    </form>
  );
};