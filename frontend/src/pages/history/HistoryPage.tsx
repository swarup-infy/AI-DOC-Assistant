import { useEffect, useState } from "react";
import {
  Clock3,
  MessageSquare,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

interface HistoryItem {
  id: number;
  question: string;
  answer: string;
  mode: string;
  created_at: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const keyword = search.toLowerCase();

    setFilteredHistory(
      history.filter(
        (item) =>
          item.question.toLowerCase().includes(keyword) ||
          item.answer.toLowerCase().includes(keyword)
      )
    );
  }, [search, history]);

  async function loadHistory() {
    try {
      setLoading(true);

      // TODO:
      // const response = await getChatHistory();
      // setHistory(response);
      // setFilteredHistory(response);

      setHistory([]);
      setFilteredHistory([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      // TODO:
      // await deleteHistory(id);

      setHistory((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chat History
          </h1>

          <p className="mt-2 text-muted-foreground">
            View and manage your previous AI conversations.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history..."
              className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                className="animate-spin text-primary"
                size={30}
              />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
              <div className="rounded-full bg-primary/10 p-5">
                <Clock3
                  size={36}
                  className="text-primary"
                />
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No History Found
              </h2>

              <p className="mt-2 max-w-md text-muted-foreground">
                Your previous AI conversations will appear
                here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="space-y-4 p-6 transition hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <MessageSquare
                          size={18}
                          className="text-primary"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground">
                          {item.question}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            item.created_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      className="rounded-lg border border-red-500 px-3 py-2 text-red-500 transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="rounded-xl bg-muted p-4">
                    <p className="line-clamp-4 whitespace-pre-wrap text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>

                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {item.mode}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
