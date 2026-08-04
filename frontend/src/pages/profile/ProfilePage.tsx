import { useState } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Camera,
  Save,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

export default function ProfilePage() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    try {
      setLoading(true);

      // TODO:
      // await updateProfile({
      //   name,
      //   email,
      // });

      alert("Profile updated successfully.");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            My Profile
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your personal information and account settings.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
                  <User
                    size={60}
                    className="text-primary"
                  />
                </div>

                <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow">
                  <Camera size={16} />
                </button>
              </div>

              <button className="mt-4 rounded-lg border border-border px-4 py-2 transition hover:bg-accent">
                Change Photo
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <User size={16} />
                  Full Name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Mail size={16} />
                  Email
                </label>

                <input
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted p-4">
                  <div className="flex items-center gap-2">
                    <Shield
                      size={18}
                      className="text-primary"
                    />

                    <span className="font-medium">
                      Account Type
                    </span>
                  </div>

                  <p className="mt-2 text-muted-foreground">
                    Standard User
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted p-4">
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={18}
                      className="text-primary"
                    />

                    <span className="font-medium">
                      Member Since
                    </span>
                  </div>

                  <p className="mt-2 text-muted-foreground">
                    July 2026
                  </p>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                <Save size={18} />

                {loading
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Future Features */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">
              Password
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Change your account password.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">
              API Usage
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              View AI usage, token consumption and limits.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">
              Preferences
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Configure theme, notifications and AI settings.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
