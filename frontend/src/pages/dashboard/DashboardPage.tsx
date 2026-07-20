import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  const cards = [
    {
      title: "Documents",
      value: "0",
      color: "bg-blue-500",
    },
    {
      title: "AI Chats",
      value: "0",
      color: "bg-green-500",
    },
    {
      title: "Searches",
      value: "0",
      color: "bg-purple-500",
    },
    {
      title: "Storage Used",
      value: "0 MB",
      color: "bg-orange-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">
            Welcome, {user?.username} 👋
          </h1>

          <p className="text-gray-500 mt-2">
            AI Document Assistant Dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div
                className={`w-12 h-12 rounded-lg ${card.color}`}
              />

              <h2 className="text-gray-500 mt-4">
                {card.title}
              </h2>

              <h1 className="text-3xl font-bold mt-2">
                {card.value}
              </h1>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}