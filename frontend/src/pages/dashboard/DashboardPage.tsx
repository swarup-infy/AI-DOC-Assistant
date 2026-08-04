import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  HardDrive,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name?.split(" ")[0] ?? "User";

  const stats = [
    {
      title: "Documents",
      value: 0,
      icon: FileText,
      color:
        "from-blue-500/15 to-cyan-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "AI Chats",
      value: 0,
      icon: MessageSquare,
      color:
        "from-violet-500/15 to-fuchsia-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      title: "Searches",
      value: 0,
      icon: Search,
      color:
        "from-amber-500/15 to-orange-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Storage",
      value: "0 MB",
      icon: HardDrive,
      color:
        "from-emerald-500/15 to-green-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  const quickActions = [
    {
      title: "Upload Document",
      subtitle: "Add PDFs, DOCX & more",
      icon: Upload,
      onClick: () => navigate("/documents"),
      color:
        "from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Semantic Search",
      subtitle: "Find information instantly",
      icon: Search,
      onClick: () => navigate("/search"),
      color:
        "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "AI Chat",
      subtitle: "Talk with your documents",
      icon: Sparkles,
      onClick: () => navigate("/chat"),
      color:
        "from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10">

        {/* ================= HERO ================= */}

        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background shadow-xl">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_40%)]" />

          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-10 p-10 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-3xl">

              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                AI Document Assistant
              </span>

              <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">

                {getGreeting()}, {firstName} 👋

              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">

                Manage documents, perform semantic search,
                generate AI summaries and chat with your
                knowledge base from one modern workspace.

              </p>

              <div className="mt-8 flex flex-wrap gap-4">

                <button
                  onClick={() => navigate("/documents")}
                  className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/25"
                >
                  <Upload size={18} />
                  Upload Document

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                <button
                  onClick={() => navigate("/chat")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-6 py-3 font-medium backdrop-blur-md transition-all duration-300 hover:bg-accent hover:-translate-y-1"
                >
                  <Sparkles size={18} />

                  Open AI Chat
                </button>

              </div>

            </div>

            <div className="hidden lg:flex">

              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl dark:bg-white/5">

                <div className="space-y-5">

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Workspace
                    </p>

                    <h2 className="mt-2 font-display text-3xl font-bold">
                      Ready
                    </h2>

                  </div>

                  <div className="h-px bg-border" />

                  <div className="grid grid-cols-2 gap-5">

                    <div>

                      <p className="text-sm text-muted-foreground">
                        Status
                      </p>

                      <p className="mt-2 font-semibold text-emerald-500">
                        Online
                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-muted-foreground">
                        AI Engine
                      </p>

                      <p className="mt-2 font-semibold">
                        Ready
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>
              {/* ================= Statistics ================= */}

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map(({ title, value, icon: Icon, color }) => (

            <div
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              {/* Gradient Background */}

              <div
                className={`absolute inset-0 bg-gradient-to-br ${color} opacity-60`}
              />

              <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" />

              <div className="relative z-10 flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-muted-foreground">
                    {title}
                  </p>

                  <h2 className="mt-4 text-4xl font-bold text-foreground">
                    {value}
                  </h2>

                </div>

                <div
                  className={`rounded-2xl bg-gradient-to-br p-4 ${color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                >
                  <Icon size={24} />
                </div>

              </div>

              <div className="relative z-10 mt-6 h-1 overflow-hidden rounded-full bg-border">

                <div
                  className={`h-full w-1/3 rounded-full bg-gradient-to-r ${color}`}
                />

              </div>

            </div>

          ))}

        </section>

        {/* ================= Main Grid ================= */}

        <section className="grid gap-6 xl:grid-cols-3">

          {/* Recent Documents */}

          <div className="xl:col-span-2 rounded-3xl border border-border/60 bg-card/70 p-8 shadow-lg backdrop-blur-xl">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-display text-3xl font-bold text-foreground">
                  Recent Documents
                </h2>

                <p className="mt-2 text-muted-foreground">
                  Your recently uploaded files will appear here.
                </p>

              </div>

              <button
                onClick={() => navigate("/documents")}
                className="hidden rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-accent md:flex"
              >
                View All
              </button>

            </div>
                    {/* Premium Empty State */}

            <div className="mt-8 flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-gradient-to-br from-background via-background to-primary/5 px-8 py-14 text-center">

              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">

                <FileText
                  size={42}
                  className="text-primary"
                />

              </div>

              <h3 className="mt-8 font-display text-3xl font-bold text-foreground">
                Your library is empty
              </h3>

              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
                Upload your first PDF, Word, Excel or text document to
                unlock semantic search, AI summaries, document chat,
                intelligent retrieval and knowledge management.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">

                <button
                  onClick={() => navigate("/documents")}
                  className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20"
                >
                  <Upload size={18} />

                  Upload First Document

                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                <button
                  onClick={() => navigate("/search")}
                  className="rounded-2xl border border-border bg-card px-6 py-3 font-medium transition-all duration-300 hover:bg-accent hover:-translate-y-1"
                >
                  Learn More
                </button>

              </div>

              <div className="mt-12 grid w-full max-w-3xl gap-4 md:grid-cols-3">

                <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">

                  <Upload
                    size={22}
                    className="mx-auto text-primary"
                  />

                  <h4 className="mt-4 font-semibold text-foreground">
                    Upload
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Import PDFs, DOCX, Excel, Markdown and text files.
                  </p>

                </div>

                <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">

                  <Search
                    size={22}
                    className="mx-auto text-amber-500"
                  />

                  <h4 className="mt-4 font-semibold text-foreground">
                    Search
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Find answers instantly using semantic AI search.
                  </p>

                </div>

                <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">

                  <Sparkles
                    size={22}
                    className="mx-auto text-violet-500"
                  />

                  <h4 className="mt-4 font-semibold text-foreground">
                    Chat
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Ask questions and receive contextual AI responses.
                  </p>

                </div>

              </div>

            </div>

          </div>
                    {/* ================= Quick Actions ================= */}

          <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-lg backdrop-blur-xl">

            <h2 className="font-display text-3xl font-bold text-foreground">
              Quick Actions
            </h2>

            <p className="mt-2 text-muted-foreground">
              Jump straight into the most common AI workflows.
            </p>

            <div className="mt-8 space-y-4">

              {quickActions.map(
                ({ title, subtitle, icon: Icon, onClick, color }) => (

                  <button
                    key={title}
                    onClick={onClick}
                    className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-border/60 bg-background/50 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                  >

                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                    />

                    <div className="absolute inset-0 bg-background/90" />

                    <div
                      className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color}`}
                    >
                      <Icon size={22} />
                    </div>

                    <div className="relative z-10 min-w-0 flex-1">

                      <h3 className="font-semibold text-foreground">
                        {title}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {subtitle}
                      </p>

                    </div>

                    <ArrowRight
                      size={18}
                      className="relative z-10 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
                    />

                  </button>

                )
              )}

            </div>

            <div className="mt-8 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 to-transparent p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                  <Sparkles
                    size={22}
                    className="text-primary"
                  />
                </div>

                <div>

                  <h3 className="font-display text-xl font-bold text-foreground">
                    AI Assistant
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Upload documents and start asking questions. Your AI
                    assistant can summarize files, answer queries, and help
                    you discover information faster.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </DashboardLayout>
  );
}