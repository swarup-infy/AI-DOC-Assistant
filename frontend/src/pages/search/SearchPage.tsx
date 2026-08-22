import { useState } from "react";
import { FileText, Loader2, Search, Sparkles } from "lucide-react";

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
  const [searched, setSearched] = useState(false);
  const [results] = useState<SearchResult[]>([]);

  async function handleSearch() {
    if (!query.trim() || loading) return;
    setLoading(true);
    setSearched(true);
    try {
      // Connect semanticSearch(query) here when the search endpoint is exposed.
      await new Promise((resolve) => setTimeout(resolve, 350));
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10 fade-in">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <Sparkles size={14} /> AI retrieval
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Semantic Search</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Search the meaning of your documents instead of relying only on exact keywords.
          </p>
        </section>

        <section className="surface rounded-2xl p-4 sm:p-5">
          <form onSubmit={(event) => { event.preventDefault(); void handleSearch(); }} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask about your documents..."
                aria-label="Semantic search query"
                className="h-12 w-full rounded-xl border border-border bg-background/60 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <button type="submit" disabled={loading || !query.trim()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45">
              {loading ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
              {loading ? "Searching" : "Search"}
            </button>
          </form>
          <p className="mt-3 px-1 text-[11px] text-muted-foreground">Tip: use a natural question such as “Where is the project budget discussed?”</p>
        </section>

        <section className="surface overflow-hidden rounded-2xl">
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <h3 className="text-base font-semibold text-foreground">Search results</h3>
            <p className="mt-1 text-xs text-muted-foreground">Relevant passages from your indexed documents.</p>
          </div>

          {results.length === 0 ? (
            <div className="px-6 py-16 text-center sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {searched ? <Search size={25} /> : <Sparkles size={25} />}
              </div>
              <h4 className="mt-5 text-base font-semibold text-foreground">{searched ? "No matching results" : "Search your knowledge base"}</h4>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {searched ? "Try a broader question or upload more documents to expand your knowledge base." : "Enter a question above to find semantically related passages across your uploaded files."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {results.map((result) => (
                <article key={result.id} className="p-5 transition hover:bg-muted/30 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText size={17} className="text-primary" />
                    <h4 className="font-semibold text-foreground">{result.document}</h4>
                    <span className="rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">Page {result.page}</span>
                    <span className="ml-auto text-xs font-medium text-primary">{(result.score * 100).toFixed(1)}% match</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{result.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
