import { Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
export default function DataRequestPage() {
 return <main className="app-shell min-h-screen bg-background px-4 py-8 text-foreground"><article className="mx-auto mt-8 max-w-3xl rounded-3xl border border-border bg-card p-6 sm:p-10">
 <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} aria-hidden="true"/>Back to sign in</Link>
 <div className="mt-8 flex items-center gap-3"><Trash2 size={24} aria-hidden="true"/><h1 className="text-3xl font-bold">Data deletion requests</h1></div>
 <p className="mt-5 text-sm leading-7 text-muted-foreground">You may request access, correction, or deletion of personal information associated with your account, subject to applicable law and legitimate retention requirements.</p>
 <p className="mt-4 text-sm leading-7 text-muted-foreground">The current application does not provide a verified self-service account deletion endpoint or a configured privacy-request inbox. To avoid sending your personal data to an unverified address, this page does not invent a contact email or claim a request has been submitted. The operator must publish and monitor a privacy contact and implement identity verification, deletion across primary storage and vector indexes, retention exceptions, and request tracking before this feature can be considered operational.</p>
 <footer className="mt-8 border-t border-border pt-5 text-sm"><Link className="font-semibold text-primary underline" to="/privacy">Privacy Policy</Link></footer>
 </article></main>;
}