import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FileText, Loader2, Search, AlertCircle } from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";

interface SearchResult {
  text: string;
  document_id: number | null;
  document_name: string | null;
  page: number | null;
  chunk_index: number | null;
  distance: number | null;
}

interface SearchResponse {
  status: string;
  query: string;
  total_results: number;
  results: SearchResult[];
}

export default function SearchPage() {
  const location = useLocation();
  const initialQuery = (location.state as { query?: string } | null)?.query ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const nextQuery = (location.state as { query?: string } | null)?.query ?? "";
    if (nextQuery.trim()) {
      setQuery(nextQuery);
      setSearched(false);
      setResults([]);
      setError("");
    }
  }, [location.key, location.state]);

  async function handleSearch() {
    const searchText = query.trim();
    if (!searchText || loading) return;

    setLoading(true);
    setSearched(true);
    setError("");
    setResults([]);

    try {
      const { data } = await api.post<SearchResponse>("/search/", {
        query: searchText,
        top_k: 8,
      });
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (requestError) {
      console.error("Semantic search failed:", requestError);
      setError("Search could not be completed. Check that your API and document index are available, then try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10 fade-in">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Document retrieval</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Semantic Search</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Find passages by meaning across the documents in your account.
          </p>
        </section>

        <section className="surface rounded-xl p-4 sm:p-5">
          <form onSubmit={(event) => { event.preventDefault(); void handleSearch(); }} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask about your documents..."
                aria-label="Semantic search query"
                className="h-12 w-full rounded-lg border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <button type="submit" disabled={loading || !query.trim()} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45">
              {loading ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
              {loading ? "Searching" : "Search"}
            </button>
          </form>
          <p className="mt-3 px-1 text-[11px] text-muted-foreground">Search uses your account's indexed document chunks. Results depend on successful document processing.</p>
        </section>

        <section className="surface overflow-hidden rounded-xl">
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <h3 className="text-base font-semibold text-foreground">Search results</h3>
            <p className="mt-1 text-xs text-muted-foreground">{searched && !loading && !error ? `${results.length} passages returned` : "Matching passages will appear here."}</p>
          </div>

          {loading ? (
            <div className="space-y-3 p-5" aria-label="Loading search results" aria-busy="true">
              {[1, 2, 3].map((item) => <div key={item} className="animate-pulse border-b border-border py-4 last:border-0"><div className="h-3 w-1/3 rounded bg-muted" /><div className="mt-3 h-3 w-full rounded bg-muted" /><div className="mt-2 h-3 w-4/5 rounded bg-muted" /></div>)}
            </div>
          ) : error ? (
            <div className="px-6 py-14 text-center">
              <AlertCircle size={24} className="mx-auto text-destructive" />
              <h4 className="mt-4 text-base font-semibold text-foreground">Search unavailable</h4>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{error}</p>
              <button type="button" onClick={() => void handleSearch()} className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">Try again</button>
            </div>
          ) : results.length === 0 ? (
            <div className="px-6 py-16 text-center sm:py-20">
              <FileText size={25} className="mx-auto text-muted-foreground" />
              <h4 className="mt-5 text-base font-semibold text-foreground">{searched ? "No matching passages" : "Search your documents"}</h4>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {searched ? "Try another wording or upload and process more documents." : "Enter a question above to retrieve relevant passages from your files."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {results.map((result, index) => (
                <article key={`${result.document_id ?? "doc"}-${result.chunk_index ?? index}-${index}`} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText size={17} className="text-muted-foreground" />
                    <h4 className="font-semibold text-foreground">{result.document_name || `Document ${result.document_id ?? ""}`}</h4>
                    {result.page !== null && <span className="rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">Page {result.page}</span>}
                    {result.chunk_index !== null && <span className="text-xs text-muted-foreground">Passage {result.chunk_index + 1}</span>}
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{result.text}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
