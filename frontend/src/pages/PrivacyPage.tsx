import { Link } from "react-router-dom";
import { ArrowLeft, Database, LockKeyhole, ShieldCheck, Bot } from "lucide-react";

const items = [
  {
    icon: Database,
    title: "Information involved",
    text: "Depending on the features you use, this may include account details, files you upload, prompts, generated content, technical logs, usage information, and support messages.",
  },
  {
    icon: Bot,
    title: "Why it is processed",
    text: "Information may be processed to provide document upload, analysis, summarization, search, AI responses, account functions, service maintenance, security, and legal compliance.",
  },
  {
    icon: LockKeyhole,
    title: "Service providers and security",
    text: "The platform may rely on hosting, storage, email, infrastructure, and AI providers. Relevant information may be processed by them to deliver requested features. No online service can guarantee absolute security.",
  },
  {
    icon: ShieldCheck,
    title: "Your responsibility and choices",
    text: "Upload only information you are authorized to share. Avoid passwords, API keys, private keys, and unnecessary sensitive information. Keep your own copies of important documents.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="app-shell min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft size={16} /> Back to sign in
        </Link>

        <header className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-10">
          <p className="text-sm font-semibold text-primary">YOUR DATA, EXPLAINED</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            A plain-language overview of privacy considerations when using AI Document Assistant.
            Please avoid uploading sensitive information unless you are comfortable with the
            service's actual processing arrangements.
          </p>
          <p className="mt-5 text-xs text-muted-foreground">Last reviewed: October 23, 2026</p>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={19} />
              </div>
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-bold">Important details to confirm</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            The exact AI providers and subprocessors, storage locations, retention periods,
            deletion behavior, international transfers, cookie use, and available privacy rights
            depend on the live service configuration and applicable law. This overview does not
            invent promises about those details. The operator should publish verified information
            and a monitored privacy contact before relying on this page as a complete legal policy.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Deleting a file from the interface may not immediately remove every backup or log.
            Do not treat the service as an archive for irreplaceable documents; keep secure copies.
          </p>
        </section>

        <footer className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          <p>
            For the rules governing use of the service, see the{" "}
            <Link to="/terms" className="font-semibold text-primary underline underline-offset-4">
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
