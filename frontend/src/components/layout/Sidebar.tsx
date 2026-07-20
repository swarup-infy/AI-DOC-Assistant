import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Search,
  History,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menus = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Documents",
    icon: FileText,
    path: "/documents",
  },
  {
    name: "AI Chat",
    icon: MessageSquare,
    path: "/chat",
  },
  {
    name: "Search",
    icon: Search,
    path: "/search",
  },
  {
    name: "History",
    icon: History,
    path: "/history",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">
      <h2 className="text-xl font-bold mb-8">
        Navigation
      </h2>

      <nav className="space-y-3">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive
                  ? "bg-blue-600"
                  : "hover:bg-slate-700"
              }`
            }
          >
            <menu.icon size={20} />
            {menu.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}