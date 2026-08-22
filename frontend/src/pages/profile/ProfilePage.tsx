import { useEffect, useState } from "react";
import { Calendar, Camera, CheckCircle2, Mail, Save, Shield, User } from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  async function handleSave() {
    if (!user || !name.trim()) return;
    try {
      setSaving(true);
      setSaved(false);
      updateUser({ ...user, name: name.trim() });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const initials = (user?.name ?? "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10 fade-in">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <User size={14} /> Account
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Profile</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">Manage your workspace identity and account information.</p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <article className="surface rounded-2xl p-6 text-center">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-2xl font-semibold text-primary-foreground shadow-lg shadow-primary/20">
              {initials || "U"}
              <button type="button" aria-label="Change profile photo" className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-card bg-card text-muted-foreground shadow-sm transition hover:text-foreground">
                <Camera size={16} />
              </button>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">{user?.name || "User"}</h3>
            <p className="mt-1 break-all text-sm text-muted-foreground">{user?.email || "—"}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
              <CheckCircle2 size={14} /> Active account
            </div>
          </article>

          <article className="surface rounded-2xl p-5 sm:p-7">
            <div className="border-b border-border pb-5">
              <h3 className="text-base font-semibold text-foreground">Personal information</h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Keep the details associated with your workspace up to date.</p>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="profile-name" className="mb-2 block text-sm font-semibold text-foreground">Full name</label>
                <div className="relative">
                  <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input id="profile-name" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} className="h-12 w-full rounded-xl border border-border bg-background/60 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
                </div>
              </div>

              <div>
                <label htmlFor="profile-email" className="mb-2 block text-sm font-semibold text-foreground">Email address</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input id="profile-email" value={user?.email ?? ""} readOnly className="h-12 w-full rounded-xl border border-border bg-muted/40 pl-11 pr-4 text-sm text-muted-foreground outline-none" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Email changes are managed by account security settings.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard icon={Shield} title="Account type" value="Standard user" />
                <InfoCard icon={Calendar} title="Member since" value="Your account" />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button type="button" onClick={() => void handleSave()} disabled={saving || !name.trim()} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                  <Save size={17} />
                  {saving ? "Saving..." : "Save changes"}
                </button>
                {saved && <span className="inline-flex items-center gap-2 text-sm font-medium text-success"><CheckCircle2 size={16} />Saved</span>}
              </div>
            </div>
          </article>
        </section>
      </div>
    </DashboardLayout>
  );
}

function InfoCard({ icon: Icon, title, value }: { icon: typeof Shield; title: string; value: string }) {
  return <div className="rounded-xl border border-border bg-muted/30 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Icon size={15} className="text-primary" />{title}</div><p className="mt-2 text-sm font-medium text-foreground">{value}</p></div>;
}
