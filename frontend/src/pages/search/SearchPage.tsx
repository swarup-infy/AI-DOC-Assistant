import { useState } from "react";
import {
  Search,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

interface SearchResult {
  id: number;
  document: string;
  page: number;
  score: number;
  content: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Backend integration
  const [results] = useState<SearchResult[]>([]);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);

    try {
      // TODO:
      // const response = await semanticSearch(query);
      // setResults(response.results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Semantic Search
          </h1>

          <p className="mt-2 text-muted-foreground">
            Search intelligently across all uploaded documents using AI.
          </p>
        </div>

        {/* Search Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across your documents..."
                className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">
              Search Results
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
              <div className="rounded-full bg-primary/10 p-5">
                <Sparkles
                  size={36}
                  className="text-primary"
                />
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                No Results Yet
              </h3>

              <p className="mt-2 max-w-md text-muted-foreground">
                Enter a question above to search your uploaded
                documents using semantic AI search.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="space-y-3 p-6 transition hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <FileText
                      size={18}
                      className="text-primary"
                    />

                    <h3 className="font-semibold">
                      {result.document}
                    </h3>

                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                      Page {result.page}
                    </span>

                    <span className="ml-auto text-xs text-muted-foreground">
                      {(result.score * 100).toFixed(1)}% Match
                    </span>
                  </div>

                  <p className="leading-7 text-muted-foreground">
                    {result.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
