import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  Search,
  HardDrive,
  Upload,
  Sparkles,
  ArrowRight,
  Plus,
} from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name?.split(" ")[0] ?? "User";

  // These values will come from your backend later.
  const stats = [
    {
      title: "Documents",
      value: 0,
      icon: FileText,
      accent: "text-blue-600 bg-blue-500/10",
    },
    {
      title: "AI Chats",
      value: 0,
      icon: MessageSquare,
      accent: "text-violet-600 bg-violet-500/10",
    },
    {
      title: "Searches",
      value: 0,
      icon: Search,
      accent: "text-amber-600 bg-amber-500/10",
    },
    {
      title: "Storage",
      value: "0 MB",
      icon: HardDrive,
      accent: "text-emerald-600 bg-emerald-500/10",
    },
  ];

  const quickActions = [
    {
      label: "Upload Document",
      description: "Upload a new file to your library",
      icon: Upload,
      accent: "text-blue-600 bg-blue-500/10",
      action: () => navigate("/documents"),
    },
    {
      label: "Semantic Search",
      description: "Search your documents using AI",
      icon: Search,
      accent: "text-amber-600 bg-amber-500/10",
      action: () => navigate("/search"),
    },
    {
      label: "Ask AI",
      description: "Chat with your uploaded documents",
      icon: Sparkles,
      accent: "text-violet-600 bg-violet-500/10",
      action: () => navigate("/chat"),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Hero */}
        <section className="rounded-[32px] border border-border bg-card p-10 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Dashboard
              </p>

              <h1
                className="text-5xl font-light leading-tight text-foreground lg:text-6xl"
                style={{
                  fontFamily:
                    '"Cormorant Garamond","Playfair Display",serif',
                }}
              >
                {getGreeting()}, {firstName} 👋
              </h1>

              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Welcome back! Upload documents, perform semantic search,
                generate AI summaries, and chat with your knowledge base —
                all in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/documents")}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
              >
                <Upload size={18} />
                Upload Document
              </button>

              <button
                onClick={() => navigate("/chat")}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:bg-accent"
              >
                <Sparkles size={18} />
                Open AI Chat
              </button>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ title, value, icon: Icon, accent }) => (
            <div
              key={title}
              className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {title}
                  </p>

                  <h2 className="mt-3 text-4xl font-bold text-foreground">
                    {value}
                  </h2>
                </div>

                <div
                  className={`rounded-2xl p-4 transition-transform duration-300 group-hover:scale-110 ${accent}`}
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Main Content */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Recent Documents */}
          <div className="rounded-3xl border border-border bg-card p-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2
                className="text-3xl font-light text-foreground"
                style={{
                  fontFamily:
                    '"Cormorant Garamond","Playfair Display",serif',
                }}
              >
                Recent Documents
              </h2>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
              <div className="rounded-full bg-primary/10 p-5">
                <FileText
                  size={36}
                  className="text-primary"
                />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-foreground">
                No documents uploaded yet
              </h3>

              <p className="mt-3 max-w-md text-muted-foreground leading-7">
                Upload your first PDF, DOCX, Excel, or text document to unlock
                AI-powered search, document summaries, semantic retrieval, and
                intelligent conversations.
              </p>

              <button
                onClick={() => navigate("/documents")}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
              >
                <Plus size={18} />
                Upload Your First Document
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-3xl border border-border bg-card p-8">
            <h2
              className="text-3xl font-light text-foreground"
              style={{
                fontFamily:
                  '"Cormorant Garamond","Playfair Display",serif',
              }}
            >
              Quick Actions
            </h2>

            <div className="mt-8 space-y-4">
              {quickActions.map(
                ({
                  label,
                  description,
                  icon: Icon,
                  accent,
                  action,
                }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-border p-5 text-left transition-all duration-300 hover:border-primary/30 hover:bg-accent"
                  >
                    <div className={`rounded-xl p-3 ${accent}`}>
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        {label}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                      </p>
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                    />
                  </button>
                )
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}