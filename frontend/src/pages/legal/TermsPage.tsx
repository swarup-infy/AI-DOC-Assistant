import { Link } from "react-router-dom";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Card from "../../components/ui/Card";
import Logo from "../../components/ui/Logo";

const sections = [
  { title: "1. Using the service", body: "AI Document Assistant helps you upload, organize, search, summarize, and ask questions about documents. You are responsible for ensuring you have the right to upload the content you submit." },
  { title: "2. Your documents and data", body: "Only upload documents you are authorized to use. Do not submit unlawful content, confidential information belonging to others without permission, or sensitive personal data unless you have an appropriate legal basis and understand the risks." },
  { title: "3. AI-generated results", body: "AI-generated summaries and answers can be incomplete or incorrect. Review important information against the original source before relying on it for legal, financial, medical, academic, or business decisions." },
  { title: "4. Account security", body: "Keep your login credentials private and notify the service operator if you suspect unauthorized access. You are responsible for activity performed through your account, subject to applicable law." },
  { title: "5. Acceptable use", body: "Do not attempt to bypass authentication, access another user's documents, interfere with service availability, upload malware, or use the service in violation of applicable law." },
  { title: "6. Availability and changes", body: "The service may change, become temporarily unavailable, or be discontinued. No specific availability, retention period, or AI output accuracy is guaranteed by this page." },
  { title: "7. Contact and legal review", body: "This page is a starter notice for the application and is not legal advice. Before public commercial use, the service operator should replace it with terms reviewed for the actual business, jurisdiction, data retention, and subprocessors." },
];

export default function TermsPage() {
  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-7 flex items-center justify-between gap-4">
          <Link to="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"><ArrowLeft size={16} /> Back to registration</Link>
          <Logo size={38} />
        </div>
        <Card className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[#DA7B93]/12 p-3 text-[#DA7B93]"><FileText size={24} /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#DA7B93]">Legal</p>
              <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Terms of Service</h1>
              <p className="mt-2 text-sm text-muted-foreground">Plain-language service terms for AI Document Assistant.</p>
            </div>
          </div>
          <div className="my-7 flex gap-3 rounded-2xl border border-[#376E6F]/30 bg-[#376E6F]/10 p-4 text-sm leading-6 text-muted-foreground">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#6fa6a2]" size={20} />
            <p>Please read these terms before creating an account. They describe responsible use of the application and the limits of AI-generated content.</p>
          </div>
          <div className="space-y-7">
            {sections.map((section) => <section key={section.title}><h2 className="font-semibold text-foreground">{section.title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{section.body}</p></section>)}
          </div>
          <div className="mt-9 flex flex-wrap gap-3 border-t border-border pt-6">
            <Link to="/register" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Return to sign up</Link>
            <Link to="/privacy" className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold transition hover:bg-muted">Privacy notice</Link>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
}
