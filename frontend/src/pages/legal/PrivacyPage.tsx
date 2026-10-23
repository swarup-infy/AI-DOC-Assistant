import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Card from "../../components/ui/Card";
import Logo from "../../components/ui/Logo";

const sections = [
  ["Information processed", "The service may process account details such as name and email, authentication data, uploaded documents, extracted text, questions, answers, and technical logs needed to operate the application."],
  ["Purpose and access", "Information is used to authenticate users, process documents, provide search and AI features, maintain security, and troubleshoot reliability. Do not upload information unless you are authorized to do so."],
  ["Third-party processors", "Depending on the deployed configuration, data may be processed by hosting, database, file-storage, embedding, or AI providers. The operator must document the actual providers and their terms before production use."],
  ["Retention and deletion", "Retention depends on the deployed database, storage configuration, backups, and provider policies. This starter notice does not promise automatic deletion. The operator should publish verified retention and account-deletion procedures."],
  ["Security and your choices", "Use a unique password and keep credentials private. No internet service can promise absolute security. For questions about access, correction, or deletion, contact the service operator using the contact channel published by the operator."],
  ["Notice status", "This is a starter privacy notice, not a legal compliance certification. It must be reviewed and completed with the actual business identity, contact details, applicable jurisdiction, cookie practices, data locations, and subprocessors before launch."],
];

export default function PrivacyPage() {
  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-7 flex items-center justify-between gap-4">
          <Link to="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"><ArrowLeft size={16} /> Back to registration</Link>
          <Logo size={38} />
        </div>
        <Card className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[#376E6F]/15 p-3 text-[#75aaa6]"><ShieldCheck size={24} /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#75aaa6]">Your data</p>
              <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Privacy Notice</h1>
              <p className="mt-2 text-sm text-muted-foreground">How information may be handled by this application.</p>
            </div>
          </div>
          <div className="mt-8 space-y-7">
            {sections.map(([title, body]) => <section key={title}><h2 className="font-semibold text-foreground">{title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p></section>)}
          </div>
          <div className="mt-9 border-t border-border pt-6">
            <Link to="/register" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Return to sign up</Link>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
}
