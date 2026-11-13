import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
const CONSENT_KEY = "aidoc_cookie_consent_v1";
export default function CookieConsent() {
 const [visible,setVisible]=useState(false);
 useEffect(()=>{try{setVisible(localStorage.getItem(CONSENT_KEY)===null);}catch{setVisible(false);}},[]);
 const saveChoice=useCallback((choice:"necessary"|"all")=>{try{localStorage.setItem(CONSENT_KEY,JSON.stringify({choice,updatedAt:new Date().toISOString()}));}finally{setVisible(false);}},[]);
 if(!visible)return null;
 return <aside role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-description" className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-border bg-card p-4 text-foreground shadow-2xl sm:inset-x-6 sm:p-5">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="max-w-xl"><h2 id="cookie-title" className="font-semibold">Your privacy choices</h2><p id="cookie-description" className="mt-1 text-sm leading-6 text-muted-foreground">We use essential browser storage for sign-in and preferences. The current app does not enable optional advertising cookies. Read our <Link className="font-semibold text-primary underline underline-offset-2" to="/cookies">Cookie Policy</Link>.</p></div>
  <div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={()=>saveChoice("necessary")} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2">Necessary only</button><button type="button" onClick={()=>saveChoice("all")} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2">Accept all</button></div></div>
 </aside>;
}