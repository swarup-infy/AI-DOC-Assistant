import { Link } from "react-router-dom";
export default function LegalFooter() {
 return <footer className="border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6"><nav aria-label="Legal information" className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-3">
 <Link className="underline underline-offset-4 hover:text-foreground" to="/privacy">Privacy</Link><Link className="underline underline-offset-4 hover:text-foreground" to="/terms">Terms</Link><Link className="underline underline-offset-4 hover:text-foreground" to="/cookies">Cookies</Link><Link className="underline underline-offset-4 hover:text-foreground" to="/refunds">Refunds</Link><Link className="underline underline-offset-4 hover:text-foreground" to="/data-deletion">Data deletion</Link><span className="sm:ml-auto">AI Document Assistant</span>
 </nav></footer>;
}