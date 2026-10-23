import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  FileText,
  LockKeyhole,
  ShieldAlert,
  Sparkles,
  Scale,
} from "lucide-react";

const sections = [
  {
    title: "1. Using the platform",
    icon: FileText,
    body: [
      "AI Document Assistant helps you create, summarize, organize, search, and analyze documents. Features may change, and availability can depend on technical limits or third-party services.",
      "By accessing or using the service, you agree to these Terms and our Privacy Policy. If you use the service for an organization, you confirm that you are allowed to accept these Terms for it.",
    ],
  },
  {
    title: "2. Your account",
    icon: LockKeyhole,
    body: [
      "Provide accurate account information and keep your login credentials secure. You are responsible for activity through your account, subject to applicable law and our security obligations. Tell us promptly if you suspect unauthorized access.",
      "Do not impersonate others, abuse trials or usage limits, or work around account restrictions.",
    ],
  },
  {
    title: "3. Uploads and ownership",
    icon: FileText,
    body: [
      "You retain the rights you already have in documents and other content you upload. You must have the rights and permissions needed to submit that content.",
      "You give the platform the limited permission needed to host, process, transform, and return your content to provide the features you request, maintain the service, protect security, and comply with law. Do not upload passwords, API keys, private keys, or sensitive records you are not authorized to share.",
      "Generated content may be similar to content created for other users. Your rights in AI output depend on applicable law and any relevant third-party terms.",
    ],
  },
  {
    title: "4. Use it responsibly",
    icon: ShieldAlert,
    body: [
      "Do not use the platform for fraud, forged records, impersonation, unlawful harassment, intellectual-property infringement, unauthorized access, malware, or attempts to disrupt or compromise the service.",
      "You are responsible for your prompts, uploads, and how you use the results. Follow applicable laws, workplace rules, academic policies, and disclosure requirements.",
    ],
  },
  {
    title: "5. AI can be wrong",
    icon: Bot,
    body: [
      "AI output can be inaccurate, incomplete, outdated, biased, or confidently made up. Check important facts, citations, calculations, quotations, and extracted details against reliable original sources before relying on them.",
      "The service is a productivity tool, not a substitute for professional legal, medical, financial, tax, engineering, or other specialist advice. A polished PDF is still not a professional certification.",
    ],
  },
  {
    title: "6. Privacy and third-party services",
    icon: LockKeyhole,
    body: [
      "The service may rely on hosting, storage, email, infrastructure, and AI providers. Relevant information may be processed to deliver the features you request, as described in the Privacy Policy.",
      "Review our Privacy Policy before uploading sensitive information. No online service can responsibly promise absolute security or uninterrupted availability.",
    ],
  },
  {
    title: "7. Availability, limits, and paid features",
    icon: Sparkles,
    body: [
      "The platform may have file-size, request, storage, or processing limits and may occasionally be unavailable for maintenance, technical issues, or third-party outages. Keep your own copies of important documents.",
      "If paid plans are offered, prices, renewals, cancellations, and refunds are governed by the terms shown at purchase and applicable law. We do not promise business, academic, or employment outcomes from generated documents.",
    ],
  },
  {
    title: "8. Suspension, liability, and changes",
    icon: Scale,
    body: [
      "We may restrict or suspend access when reasonably necessary to address serious violations, security risks, fraud, or legal obligations. We may update these Terms as the service evolves and will provide notice or obtain renewed consent when required.",
      "To the extent permitted by applicable law, the service is provided on an as-available basis and we do not guarantee error-free results. Nothing in these Terms excludes liability or statutory rights that cannot legally be excluded or limited.",
      "These Terms are subject to applicable law and mandatory consumer protections. The final terms should be reviewed for the operator's actual legal structure and jurisdiction before publication.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="app-shell min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-lg text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>

        <header className="mt-8 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Scale size={17} />
            THE FINE PRINT (WITH FEELINGS)
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            The rules of using AI Document Assistant. Written to be understood
            by humans—not just the one person who reads every checkbox.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1.5">
              Last updated: October 23, 2026
            </span>
            <a
              href="https://ai-doc-assistant-nu.vercel.app/privacy"
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 transition hover:border-primary/50 hover:text-foreground"
            >
              Privacy Policy <ArrowUpRight size={13} />
            </a>
          </div>
        </header>

        <section
          aria-labelledby="quick-summary"
          className="mt-6 rounded-3xl border border-primary/25 bg-primary/5 p-6 sm:p-8"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            The 30-second version
          </p>
          <h2 id="quick-summary" className="mt-2 text-2xl font-bold">
            The deal, minus the legal marathon
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "Upload only files you have permission to use.",
              "Keep your password private and your account secure.",
              "AI can make mistakes—verify important information.",
              "Do not use the platform for fraud or harmful activity.",
              "Read the Privacy Policy before sharing sensitive data.",
              "Keep backups of documents you cannot afford to lose.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-6">
                <CheckCircle2 size={17} className="mt-1 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="meme-heading"
          className="mt-6 overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            <Sparkles size={15} />
            Mandatory legal meme
          </div>
          <h2 id="meme-heading" className="mt-3 text-xl font-bold sm:text-2xl">
            You after clicking “I Agree” without reading:
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="rounded-2xl bg-muted/70 p-5">
              <p className="text-3xl font-black leading-tight sm:text-4xl">
                “I accept the terms.”
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                Also me: “Wait… what did I accept?”
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                The AI can summarize your 80-page PDF. It cannot summarize the
                consequences of clicking random buttons for you.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-primary/30 bg-primary/10 sm:h-32 sm:w-32"
            >
              <span className="text-6xl" role="img" aria-label="melting face">
                🫠
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Joke aside: the sections below are the terms that matter. The jokes
            do not override the actual provisions.
          </p>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">The actual terms</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Open a section to read the details. Please read the important
              bits before using the service.
            </p>
          </div>
          <div className="space-y-3">
            {sections.map(({ title, icon: Icon, body }) => (
              <details
                key={title}
                className="group rounded-2xl border border-border bg-card p-5 open:border-primary/30 sm:p-6"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 font-semibold marker:hidden">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={18} />
                  </span>
                  <span className="flex-1">{title}</span>
                  <span className="text-xl text-muted-foreground transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="space-y-3 pl-0 pt-4 text-sm leading-7 text-muted-foreground sm:pl-12">
                  {body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>

        <footer className="mt-8 rounded-3xl border border-border bg-card p-6 text-sm leading-6 text-muted-foreground sm:p-8">
          <h2 className="font-semibold text-foreground">Questions or concerns?</h2>
          <p className="mt-2">
            For information about how data is handled, read the{" "}
            <a href="https://ai-doc-assistant-nu.vercel.app/privacy" className="font-semibold text-primary underline underline-offset-4">
              Privacy Policy
            </a>
            . For support, use the contact channel provided in the application.
          </p>
          <p className="mt-4 text-xs">
            This concise page summarizes common platform rules. Before relying
            on it as a legal agreement, confirm the operator's legal name,
            contact details, actual data practices, and governing jurisdiction.
            Mandatory legal rights remain unaffected.
          </p>
          <p className="mt-5 border-t border-border pt-4 text-xs">
            Make better documents. Check your facts. Back up your files. And
            please stop naming everything{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
              final_final_ACTUAL_final_v8.pdf
            </code>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
