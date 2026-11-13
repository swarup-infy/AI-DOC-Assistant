import { Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function DataRequestPage() {
  return (
    <main className="app-shell min-h-screen bg-background px-4 py-8 text-foreground">
      <article className="mx-auto mt-8 max-w-3xl rounded-3xl border border-border bg-card p-6 sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4">
          <ArrowLeft size={16} aria-hidden="true" />Back to sign in
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <Trash2 size={24} aria-hidden="true" />
          <h1 className="text-3xl font-bold">Data deletion requests</h1>
        </div>
        <p className="mt-5 text-sm leading-7 text-muted-foreground">
          Signed-in users can permanently delete their account and associated application data from the Profile page. The deletion action requires typing DELETE to confirm.
        </p>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Account deletion removes the user record, related chat history, document records, document vectors, and uploaded document files from primary application storage. A failed vector cleanup prevents the account deletion from being committed. Backup copies and operational logs may remain until their configured retention periods expire.
        </p>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          For data held by hosting, database, AI, or backup providers, the operator must follow the provider's retention and deletion procedures. A separate manual privacy-request channel requires a verified business identity and monitored contact.
        </p>
        <footer className="mt-8 border-t border-border pt-5 text-sm">
          <Link className="font-semibold text-primary underline" to="/privacy">Privacy Policy</Link>
        </footer>
      </article>
    </main>
  );
}
