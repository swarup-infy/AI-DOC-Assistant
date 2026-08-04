import type { LucideIcon } from "lucide-react";
import {
  FileText,
  History,
  LayoutDashboard,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const menuItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Documents",
    path: "/documents",
    icon: FileText,
  },
  {
    name: "AI Chat",
    path: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Semantic Search",
    path: "/search",
    icon: Search,
  },
  {
    name: "History",
    path: "/history",
    icon: History,
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full flex-col overflow-y-auto bg-card">
      {/* Brand */}
      <div className="sticky top-0 z-10 flex-shrink-0 border-b border-border/60 bg-card px-8 py-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Sparkles
              size={28}
              className="text-primary"
            />
          </div>

          <div>
            <h1 className="font-display text-4xl font-light leading-none tracking-tight text-foreground">
              AIDoc
            </h1>

            <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
              AI DOCUMENT ASSISTANT
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-5 py-8"
        aria-label="Main Navigation"
      >
        <ul className="space-y-3">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end
                title={name}
                className={({ isActive }) =>
                  `group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`
                }
              >
                <Icon
                  size={22}
                  className="transition-transform duration-300 group-hover:scale-110"
                />

                <span className="text-[15px] font-medium">
                  {name}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-border/60 p-6">
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <Sparkles
                size={18}
                className="text-primary"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                AI Workspace
              </h3>

              <p className="text-xs text-muted-foreground">
                Powered by AI
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Upload documents, perform semantic search, generate summaries,
            and chat with your knowledge base.
          </p>
        </div>
      </footer>
    </aside>
  );
}