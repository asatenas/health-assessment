# Implementation Plan & Tasks

## Tasks

- [x] Explore project structure and understand existing middleware/routing
- [x] Read revised `gemini.md` spec
- [x] Write implementation plan
- [x] Get user approval on plan
- [x] Update `middleware.ts` — variant cookie assignment for unauthenticated users at `/`
- [x] Create `app/(landing)/` route group with layout
- [x] Set up Vercel Analytics custom event tracking utilities
- [x] Add Unsplash image domain to `next.config.ts`
- [x] Create landing page component with Golden Hour design system
- [x] Implement Navbar, Hero, Features, Footer sections
- [x] Wire up early access email signup form
- [x] Add CSS noise overlay + micro-interactions + animations
- [x] Create landing page component with Dusk Protocol design system
- [x] Implement all sections with dark warm premium aesthetic
- [x] Create landing page component with Clinical White design system
- [x] Implement all sections with stark institutional aesthetic
- [x] Visual testing in browser for all 3 variants
- [x] Verify middleware cookie-based routing works
- [x] Verify analytics events fire correctly
- [x] Responsive testing (mobile)

---

## Implementation Details

### Infrastructure — Middleware & Routing

#### [MODIFY] `middleware.ts`
- Add logic at the top: if path is `/` and user is **not** authenticated, set a `landing-variant` cookie (value `A`, `D`, or `E`, randomly 33/33/34%) if not already present, then `NextResponse.next()`
- Cookie persists so returning users see the same variant

#### [NEW] `app/(landing)/layout.tsx`
- Minimal layout — no auth sidebar/header. Loads Google Fonts for all 3 presets via `next/font/google`
- Includes noise overlay CSS

#### [NEW] `app/(landing)/page.tsx`
- Reads `landing-variant` cookie, renders the matching variant component
- If user is authenticated, redirects to `/dashboard`

#### [MODIFY] `app/(chat)/page.tsx`
- Remove the `/` handling from this route group (it's moved to `(landing)`)

#### [MODIFY] `next.config.ts`
- Add `images.unsplash.com` to `remotePatterns` for Unsplash hero images

---

### Analytics — Event Tracking

#### [NEW] `lib/landing/analytics.ts`
- Utility functions wrapping `@vercel/analytics` `track()`:
  - `trackPageView(variant)` — fires on mount with variant label
  - `trackScroll(variant, depth)` — fires at 25%, 50%, 75%, 100% scroll thresholds
  - `trackCTAClick(variant, ctaId)` — fires on CTA interactions
  - `trackTimeOnPage(variant, seconds)` — fires at intervals (15s, 30s, 60s, 120s, 300s)
  - `trackSignup(variant)` — fires on successful email submission

#### [NEW] `components/landing/analytics-tracker.tsx`
- Client component that auto-tracks scroll depth, time-on-page on mount. Shared across all variants.

---

### Email Signup Backend

#### [NEW] `lib/db/schema-landing.ts` / `lib/db/schema.ts`
- Drizzle schema for `EarlyAccessSignups` table: `id`, `email`, `variant`, `createdAt`

#### [NEW] `app/(landing)/api/signup/route.ts`
- POST handler: validates email, inserts into DB, returns success/error JSON

---

### Preset A — "Golden Hour" Landing Page

#### [NEW] `components/landing/golden-hour/`

Component tree:
- `golden-hour-page.tsx` — Main page component, assembles all sections
- `navbar.tsx` — Pill-shaped floating nav: logo "Asatenas" + nav links + "Acesso Antecipado" CTA
- `hero.tsx` — Asymmetric grid (content + data rail). Fraunces headline with amber italic accent word. Kicker, body copy, slate CTA
- `features.tsx` — Three value prop sections: (1) Surgery workflow, (2) AI triage, (3) Team collaboration
- `data-rail.tsx` — Stacked diagnostic cards with sparklines and status dots
- `metrics-bar.tsx` — Bottom metrics strip with Fraunces stat numbers
- `footer.tsx` — Dark footer with pulsing green status dot
- `signup-form.tsx` — Email input + submit button (shared across presets, styled per preset)

**Fonts:** Fraunces, DM Sans, Albert Sans, JetBrains Mono
**Colors:** Stone `#f5f4f0`, Slate `#1a1d24`, Amber `#b87333`, Rail `#eeece6`
**Layout:** Asymmetric wide content + 380px data rail

---

### Preset D — "Dusk Protocol" Landing Page

#### [NEW] `components/landing/dusk-protocol/`

Same component structure adapted for dark warm premium:
- `dusk-protocol-page.tsx`, `navbar.tsx`, `hero.tsx`, `features.tsx`, `cards.tsx`, `footer.tsx`

**Fonts:** Spectral, DM Sans, Albert Sans, JetBrains Mono
**Colors:** Deep Slate `#181622`, Peach `#D4906A`, Ghost White `#F0ECE4`, Void `#6A6080`
**Layout:** Two-column hero + data cards right. Radial gradient orbs + scanline overlay.

---

### Preset E — "Clinical White" Landing Page

#### [NEW] `components/landing/clinical-white/`

Same component structure adapted for stark institutional:
- `clinical-white-page.tsx`, `navbar.tsx`, `hero.tsx`, `features.tsx`, `data-panel.tsx`, `number-grid.tsx`, `footer.tsx`

**Fonts:** Libre Baskerville, Figtree, JetBrains Mono
**Colors:** White `#FFFFFF`, Deep Navy `#0A1628`, Steel `#F0F2F5`, Steel Mid `#D8DDE4`
**Layout:** Two-column hero + data panel. **Zero border-radius** everywhere. Navy opacity system for all hierarchy.

---

### Content (Brazilian Portuguese)

**Brand:** Asatenas
**Headline variations by preset:**
- A (Golden Hour): "Recupere milhões. Reduza *cancelamentos*." (amber italic on "cancelamentos")
- D (Dusk Protocol): "O futuro da gestão *cirúrgica*." (peach italic on "cirúrgica")
- E (Clinical White): "Eficiência cirúrgica sem *compromisso*." (italic at 50% navy)

**Value Props (adapted for each card system):**
1. Fluxo cirúrgico completo — Gerencie todo o processo, da admissão ao pós-operatório
2. Triagem inteligente com IA — Identifique pacientes que precisam de cuidados especiais antes da cirurgia
3. Colaboração em tempo real — Conecte sua equipe cirúrgica em uma plataforma unificada

**CTA:** "Garantir Acesso Antecipado"
