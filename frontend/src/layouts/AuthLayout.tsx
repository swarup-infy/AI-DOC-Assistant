import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

function SculpturalArtwork() {
  return (
    <div className="auth-art-drift pointer-events-none absolute inset-y-0 right-[-7rem] hidden w-[58%] items-center lg:flex" aria-hidden="true">
      <svg viewBox="0 0 760 700" className="w-full overflow-visible opacity-90" role="presentation">
        <defs>
          <linearGradient id="sculptureOuter" x1="150" y1="130" x2="590" y2="570" gradientUnits="userSpaceOnUse">
            <stop stopColor="#DA7B93" />
            <stop offset=".38" stopColor="#8E6579" />
            <stop offset=".68" stopColor="#376E6F" />
            <stop offset="1" stopColor="#13272D" />
          </linearGradient>
          <linearGradient id="sculptureInner" x1="300" y1="160" x2="520" y2="510" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F0A1B3" />
            <stop offset=".45" stopColor="#E88F80" />
            <stop offset="1" stopColor="#2F4454" />
          </linearGradient>
          <linearGradient id="sculptureShade" x1="250" y1="160" x2="510" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F7B0C1" stopOpacity=".75" />
            <stop offset=".5" stopColor="#2E151B" stopOpacity=".55" />
            <stop offset="1" stopColor="#0B151B" stopOpacity=".95" />
          </linearGradient>
          <filter id="sculptureNoise" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="8" result="grain" />
            <feColorMatrix in="grain" type="saturate" values="0" result="mono" />
            <feComponentTransfer><feFuncA type="table" tableValues="0 .14" /></feComponentTransfer>
            <feBlend in="SourceGraphic" mode="soft-light" />
          </filter>
          <filter id="sculptureShadow" x="-30%" y="-30%" width="160%" height="170%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="18" result="blur" />
            <feOffset dy="24" />
            <feComponentTransfer><feFuncA type="linear" slope=".45" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <ellipse cx="395" cy="594" rx="235" ry="28" fill="#070D12" opacity=".65" />
        <path d="M184 510 L605 510 L651 550 Q653 563 632 569 L167 569 Q143 563 151 550Z" fill="#101A21" stroke="#526575" strokeOpacity=".45" />
        <path d="M166 550 L641 550 L623 570 L185 570Z" fill="#0B141A" opacity=".95" />
        <g filter="url(#sculptureShadow)">
          <path d="M260 180 C211 127 253 78 319 95 C367 107 379 143 420 137 C463 130 484 83 526 106 C567 129 541 177 566 211 C594 249 643 268 615 319 C596 353 567 365 568 402 C569 450 520 485 474 460 C437 441 415 461 378 480 C337 501 287 473 286 431 C284 397 242 389 211 368 C167 338 190 296 219 267 C247 239 286 217 260 180Z" fill="url(#sculptureOuter)" stroke="#DCA0B7" strokeOpacity=".36" strokeWidth="2" />
          <path d="M282 218 C319 176 373 181 405 206 C431 226 445 226 470 197 C491 173 516 177 524 202 C535 236 502 259 477 281 C447 308 431 325 443 349 C455 375 484 392 464 413 C445 435 416 408 391 394 C360 377 336 385 309 369 C281 352 270 322 286 295 C301 271 311 248 282 218Z" fill="#172731" opacity=".95" />
          <path d="M252 179 C292 200 310 226 303 254 C295 284 266 305 282 334 C300 367 346 366 372 390 C400 417 434 430 460 408 C487 384 452 357 450 330 C448 304 483 282 512 254 C541 226 550 196 529 177 C506 155 481 174 459 194 C429 221 408 225 381 204 C350 179 313 159 282 168 C267 172 258 176 252 179Z" fill="url(#sculptureInner)" filter="url(#sculptureNoise)" />
          <path d="M246 182 C285 205 300 228 290 257 C278 292 253 310 272 342 C291 373 338 380 368 405 C398 431 433 440 461 416" fill="none" stroke="#7DC0C3" strokeOpacity=".68" strokeWidth="9" strokeLinecap="round" />
          <path d="M285 170 C326 151 360 175 386 194 C416 215 439 213 469 184 C493 160 513 162 528 178" fill="none" stroke="#F6C2D0" strokeOpacity=".78" strokeWidth="7" strokeLinecap="round" />
          <path d="M210 313 C223 352 258 367 292 378 C323 389 339 420 369 436 C398 451 426 449 450 432" fill="none" stroke="url(#sculptureShade)" strokeWidth="24" strokeLinecap="round" opacity=".9" />
        </g>
        <g fill="#DA7B93" opacity=".8">
          <circle cx="181" cy="204" r="3" /><circle cx="576" cy="145" r="2" /><circle cx="620" cy="392" r="3" />
        </g>
      </svg>
    </div>
  );
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-shell app-shell relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="auth-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[#DA7B93]/10 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-48 right-[-8rem] h-[38rem] w-[38rem] rounded-full bg-[#376E6F]/20 blur-[130px]" aria-hidden="true" />
      <SculpturalArtwork />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="w-full auth-enter">{children}</div>
      </section>
    </main>
  );
}
