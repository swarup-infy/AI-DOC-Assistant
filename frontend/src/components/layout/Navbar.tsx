import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-8">
      <h1 className="text-2xl font-bold text-blue-600">
        AI Document Assistant
      </h1>

      <div className="flex items-center gap-6">
        <User size={22} />

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}