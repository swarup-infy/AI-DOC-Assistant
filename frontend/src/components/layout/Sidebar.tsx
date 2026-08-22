import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { FileText, History, LayoutDashboard, MessageSquare, Search, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarItem { readonly name: string; readonly path: string; readonly icon: LucideIcon; }

const MENU_ITEMS: ReadonlyArray<SidebarItem> = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", path: "/documents", icon: FileText },
  { name: "AI Chat", path: "/chat", icon: MessageSquare },
  { name: "Semantic Search", path: "/search", icon: Search },
  { name: "History", path: "/history", icon: History },
];

function Sidebar() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-card/90" aria-label="Sidebar">
      <header className="flex-shrink-0 border-b border-border/70 px-5 py-6">
        <NavLink to="/dashboard" className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-accent/60 focus:outline-none focus:ring-2 focus:ring-primary" aria-label="AIDoc dashboard">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Sparkles size={21} strokeWidth={2.2} aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-card" />
          </div>
          <div className="min-w-0"><p className="font-display text-2xl font-semibold tracking-tight text-foreground">AIDoc</p><p className="truncate text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">AI Document Assistant</p></div>
        </NavLink>
      </header>

      <nav className="flex-1 px-3 py-5" aria-label="Primary navigation">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
        <ul className="space-y-1.5">
          {MENU_ITEMS.map(({ name, path, icon: Icon }) => (
            <li key={path}>
              <NavLink to={path} end title={name} className={({ isActive }) => ["group relative flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary", isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"].join(" ")}>
                {({ isActive }) => <><span aria-hidden="true" className={`absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary-foreground/90 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} /><Icon size={19} strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:scale-105" /><span className="truncate text-sm font-medium">{name}</span></>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="flex-shrink-0 border-t border-border/70 p-4">
        <section className="rounded-2xl border border-border bg-muted/45 p-4">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles size={17} /></div><div className="min-w-0"><h2 className="truncate text-xs font-semibold text-foreground">AI Workspace</h2><p className="text-[11px] text-muted-foreground">Powered by Groq</p></div></div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">Upload documents, search your knowledge base, and chat with your AI assistant.</p>
        </section>
      </footer>
    </div>
  );
}

export default memo(Sidebar);
