import { Link } from "react-router-dom";
import { ArrowLeft, ReceiptText } from "lucide-react";
export default function RefundPolicyPage() {
 return <main className="app-shell min-h-screen bg-background px-4 py-8 text-foreground"><article className="mx-auto mt-8 max-w-3xl rounded-3xl border border-border bg-card p-6 sm:p-10">
 <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} aria-hidden="true"/>Back to sign in</Link>
 <div className="mt-8 flex items-center gap-3"><ReceiptText size={24} aria-hidden="true"/><div><h1 className="text-3xl font-bold">Refund Policy</h1><p className="mt-1 text-xs text-muted-foreground">Last updated: November 13, 2026</p></div></div>
 <p className="mt-6 text-sm leading-7 text-muted-foreground">The repository currently does not establish an active paid subscription, checkout flow, or refund-processing system. This interim notice therefore does not invent a refund window, eligibility rule, or processing promise.</p>
 <h2 className="mt-7 font-semibold">Before making a payment</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">Do not pay unless checkout clearly identifies the seller, total price and currency, billing interval, renewal terms, cancellation method, and refund rules. Keep your receipt and the terms shown at purchase.</p>
 <h2 className="mt-7 font-semibold">Statutory rights</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">Nothing here limits refund, cancellation, or consumer rights that apply under mandatory law. Where a payment has been taken, use the support channel shown on the receipt or checkout. A monitored support contact and verified seller identity must be published before paid sales begin.</p>
 <h2 className="mt-7 font-semibold">Operator action required</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">Before enabling payments, replace this interim notice with eligibility, evidence, request, timeline, and payment-method details matching the actual checkout and applicable law.</p>
 <footer className="mt-8 border-t border-border pt-5 text-sm"><Link className="font-semibold text-primary underline" to="/terms">Terms of Service</Link></footer>
 </article></main>;
}