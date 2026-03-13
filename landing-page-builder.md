# Aesthetic Presets — Cinematic Landing Page Builder

Each preset defines a complete design system: `palette`, `typography`, `identity`, `layoutSignature`, and `cardPattern`. Drop any preset into the builder and get a fully coherent visual language.

---

## Preset A — "Golden Hour" (Revised)
- **Identity:** Precision instrumentation with one warm signal. Stone and slate do the heavy lifting — a single controlled amber surfaces only where it matters most.
- **Palette:** Stone `#f5f4f0` (Background), Slate `#1a1d24` (Text/Dark), Cool Mid `rgba(40,44,52,0.45)` (Body text), Amber `#b87333` (Single accent — used sparingly: one headline word + one key metric only), Rail `#eeece6` (Right column bg)
- **Typography:** Display: "Fraunces" (optical size, weight 300, italic for the single accent word). Body: "DM Sans" (weight 300). Labels/nav: "Albert Sans" (weight 400–500). Data: "JetBrains Mono" (weight 300–400).
- **Layout Signature:** Asymmetric grid — wide content column (flex 1) + narrow data rail (380px fixed). NOT a 50/50 split. Content column holds logo, nav, hero copy, and a bottom metrics bar. Rail holds compact diagnostic rows with status dots and sparklines.
- **Amber Rule:** Amber appears in exactly two places per page — one italic word in the hero headline, and one key metric number. Nowhere else. All other hierarchy uses slate at varying opacities.
- **Hero Pattern:** Kicker label (JetBrains Mono, uppercase, slate 35%). Four-line Fraunces headline: lines 1–2 neutral slate, line 3 amber italic, line 4 slate italic at 45% opacity. DM Sans 300 body (max-width 460px). 6px-radius CTA in full slate.
- **Data Rail:** Stacked diagnostic cards on `#eeece6` background. Each card: title (Mono uppercase) + status dot (ok/warn/alert with pulse on warn/alert) + Fraunces value + DM Sans subtitle + optional 7-bar sparkline. Hover: amber border at 30% opacity.
- **Metrics Bar:** Sits at bottom of content column, separated by 1px slate-8% top border. Three items: Fraunces 38px numbers (primary stat uses amber italic), JetBrains Mono uppercase labels at slate 30%. Items divided by 1px slate-8% vertical rules.
- **Signature Details:** 6px border-radius on cards and CTAs only. No radius on background panels. Noise overlay at 2% opacity. Single 1px slate-10% vertical rule between main and rail columns.

---

## Preset B — "Forest Atlas" (Revised)
- **Identity:** A clinical platform that respects the intelligence of its users. Left side: editorial calm. Right side: functional software micro-UIs that actually work — not marketing cards.
- **Palette:** Parchment `#f3f0e9` (Background), Deep Ink `#1e2a1e` (Text/Dark), Sage `#4a7c6f` (Accent — live indicators, active states, positive values only), White `#ffffff` (Card surfaces), Border `rgba(30,42,30,0.08)`
- **Typography:** Display: "Newsreader" (weight 300, italic for accent line). Body: "DM Sans" (weight 300). Labels: "Albert Sans" (weight 400–500). Data/mono: "JetBrains Mono" (weight 300–400).
- **Layout Signature:** Even 50/50 grid. Left: editorial hero copy, CTA row, trust bar. Right: three stacked functional micro-UI cards — each a different interaction pattern, not a static info block.
- **Hero Pattern:** Pulsing sage dot label (JetBrains Mono uppercase). Two-line Newsreader headline (neutral) + one italic sage emphasis line. DM Sans 300 body. Two-button CTA: slate fill pill + ghost outline pill. Trust bar: three Albert Sans monospace items separated by 1px ink-12% vertical rules.
- **Card System — three required patterns:**
  1. **Live Waveform Card:** Animated SVG polyline using `stroke-dashoffset` draw animation (4s loop, values: `"900;0;0;900"`). Header shows "Live" badge with pulsing sage dot. Footer: Newsreader 28px value + JetBrains Mono unit label + sage delta percentage.
  2. **Spectrum Meter Card:** 8px-tall gradient track (sage green → yellow → orange-red). White circle marker (14×14px, 2px ink border) absolutely positioned at patient's current percentile. Three JetBrains Mono range labels below. Reading: Newsreader number + Mono unit + sage status pill (rounded-100px, sage 8% bg).
  3. **Interactive Checklist Card:** Clickable rows — JavaScript toggles `.done` class. Done: sage filled 18px checkbox with ✓, strikethrough text at ink 35% opacity, timestamp. Pending: outlined checkbox, full-opacity text, em-dash. Hover: `padding-left: 4px` indent. Header shows progress counter ("3/5") in JetBrains Mono.
- **Card Hover:** `translateY(-2px)` + `border-color: rgba(74,124,111,0.3)`. No shadow.
- **Signature Details:** 2px border-radius on cards (nearly sharp). Noise at 1.8% opacity. Sage used ONLY for live indicators, positive deltas, completed states, and one italic headline word — never decorative fill.

---

## Preset C — "Warm Archive" (Structured Clinical)
- **Identity:** A beautifully printed hospital annual report from 1978 — but running on 2025 infrastructure. Espresso sidebar, linen body, serious serif.
- **Palette:** Espresso `#2E1F14` (Sidebar/Dark), Terracotta `#A07050` (Accent), Linen `#F7F0E8` (Background), Brass `#C8A882` (Highlight/Active), White `#ffffff` (Card surfaces)
- **Typography:** Display: "Lora" (weight 400, italic for pull quotes and accent lines). Body: "DM Sans" (weight 300). Labels: "Albert Sans" (uppercase, tracked). Monospace: "JetBrains Mono" (status/data).
- **Layout Signature:** Fixed 200px espresso sidebar + fluid main content area. Sidebar: logo (Lora serif), vertical nav (Albert Sans uppercase), system status dot at bottom. Main: eyebrow label + Lora headline + two-column body (copy + quote left, stat cards right).
- **Hero Pattern:** Albert Sans uppercase terracotta eyebrow. Lora 400 headline + italic terracotta accent line. Two-column below: left has DM Sans body + Lora italic pull-quote with 2px brass left border + cite in Albert Sans uppercase. Right has three stat cards.
- **Card System:** Standard white (stat label + Lora 30px value + terracotta trend), featured espresso (brass label + brass value + DM Sans subtitle), appointment card (Lora smaller value + terracotta secondary info). All cards: 18px border-radius, 1px `#e4ddd2` border.
- **Signature Details:** Pulsing green status dot in sidebar footer. Pull-quote cite in Albert Sans uppercase terracotta. Espresso sidebar with brass active/hover state on nav items. 18px border-radius everywhere.

---

## Preset D — "Dusk Protocol" (Dark Warm Premium)
- **Identity:** A trusted, premium health platform you'd open at night. Dark navy-slate with warm peach — the rare dark theme that doesn't feel cold.
- **Palette:** Deep Slate `#181622` (Background), Peach `#D4906A` (Accent), Ghost White `#F0ECE4` (Text), Void `#6A6080` (Muted text), Card Surface `rgba(240,236,228,0.04)`
- **Typography:** Display: "Spectral" (weight 300, italic for emphasis). Body: "DM Sans" (weight 300–400). Labels: "Albert Sans" (uppercase, tracked).
- **Layout Signature:** Two-column hero — editorial copy left, three stacked data cards right. Warm radial gradient orbs (peach and void purple) at 7–12% opacity in background. CSS scanline overlay (repeating-linear-gradient).
- **Hero Pattern:** Peach eyebrow label with 24px 1px peach rule before it. Spectral headline (neutral) + italic peach word + muted italic Spectral subline in void color. DM Sans 300 body. Two-button CTA: peach linear-gradient fill with glow box-shadow + ghost outline button.
- **Card System:** `rgba(white,0.04)` bg + `rgba(white,0.08)` border + 20px border-radius. Title: Albert Sans Mono uppercase void color. Icon: 28×28px rounded-8px box at `rgba(peach,0.12)`. Value: Spectral 28px ghost white. Sub-label: Albert Sans 11px peach. Featured card: `rgba(peach,0.08)` bg + `rgba(peach,0.2)` border.
- **Card Hover:** `translateX(4px)` + `border-color: rgba(peach,0.4)`.
- **Signature Details:** Scanlines: `repeating-linear-gradient(0deg, transparent 2px, rgba(peach,0.02) 4px)`. Warm noise at 3% opacity. CTA glow: `box-shadow: 0 4px 24px rgba(212,144,106,0.3)`. Status dot: white at 40% opacity (not green).

---

## Preset E — "Clinical White" (Stark Institutional)
- **Identity:** The interior of a very expensive private hospital. No decoration, pure confidence. Authority through negative space and typographic weight alone. No secondary accent color exists.
- **Palette:** White `#FFFFFF` (Background), Deep Navy `#0A1628` (The only color), Steel `#F0F2F5` (Alternate surface sections), Steel Mid `#D8DDE4` (Borders)
- **Opacity System (replaces accent colors entirely):**
  - `navy` (100%) — headlines, CTA buttons, primary data values
  - `rgba(10,22,40,0.80)` — CTA hover state
  - `rgba(10,22,40,0.50)` — body copy, italic softened phrases, secondary panel values
  - `rgba(10,22,40,0.30)` — kicker labels, panel headers, monospace labels
  - `rgba(10,22,40,0.12)` — borders, rule lines, stat dividers
  - `rgba(10,22,40,0.06)` — hover fill background on rows and cards
- **Typography:** Display: "Libre Baskerville" (weight 400, italic only for one softened phrase per section at 50% navy opacity). Body: "Figtree" (weight 300–500). Labels/data: "JetBrains Mono" (weight 300–400, uppercase, tracked).
- **NO border-radius anywhere.** All containers, buttons, inputs, cards — sharp corners. This is the single most defining rule of this preset. Never break it.
- **Layout Signature:** Two-column hero (copy left + data panel right), divided by 1px navy-12% vertical rule. Below hero: full-width three-column audience strip (navy-12% top border + internal vertical rules). Impact section: two-column (copy + 2×2 number grid). Manifesto: two-column (quote left + statement right). CTA: two-column (headline left + form right).
- **Hero Pattern:** JetBrains Mono kicker (navy 50%, preceded by 24px navy-30% rule). Libre Baskerville headline — 2–3 neutral lines + one italic line at navy 50%. Stat rule (horizontal strip, navy-12% top+bottom borders, three items). Figtree 300 body. Sharp navy CTA button + sharp ghost outline button.
- **Data Panel:** White background. JetBrains Mono header at navy 30%. Rows: `padding: 20px 0`, `border-bottom: 1px solid navy-06%`. Label: Mono 11px navy 50%. Value: Libre Baskerville 20px navy 100%. Hover: navy-06% background fills the row (no other change). Tags: sharp navy-filled (primary) or sharp outlined (muted).
- **Number Grid (Impact section):** 2×2 grid with 1px navy-12% gaps. Each cell: `#F0F2F5` background. Libre Baskerville 54px navy number. JetBrains Mono 10px uppercase label at navy 30%. Hover: white background.
- **Signature Details:** Noise at 1.6% opacity. Footer: navy background. Status dot: white at 40% opacity. No green, no color accent of any kind anywhere on the page.

---

## Preset F — "Warm Command" (Editorial Authority)
- **Identity:** A senior consultant's office meets a Bloomberg terminal. For audiences who distrust "tech-y" aesthetics. Data-forward, editorial gravity, zero coldness.
- **Palette:** Sand `#F2EDE4` (Background), Bordeaux `#7A1F2E` (Accent), Deep Walnut `#1C1209` (Text/Dark), Brass `#B8935A` (Data numbers/secondary accent)
- **Typography:** Display: "Source Serif 4" (weight 300–400, italic for drama). Body: "Figtree" (weight 300–400). Labels: "Albert Sans" (uppercase, tracked). Data: "JetBrains Mono".
- **Layout Signature:** Narrow centered layout (max-width 820px, margin auto). Top nav + 1px brass-35% rule separator below nav. Hero fully centered: all elements on one vertical axis. No left/right columns. Data row spans full max-width below CTA.
- **Hero Pattern:** Albert Sans eyebrow in brass (uppercase, 0.22em tracking). Source Serif 4 weight 300 neutral headline line. Source Serif 4 italic bordeaux accent line. 80px×1px centered brass rule (`rgba(184,147,90,0.5)`). Figtree 300 body (line-height 1.85, max-width 520px, centered). Pill CTA row (bordeaux fill + ghost outline, `border-radius: 100px`). Data row below.
- **Data Row:** Full max-width, `border: 1px solid rgba(184,147,90,0.25)`, no border-radius. Three equal cells with 1px brass-25% vertical dividers. JetBrains Mono 32px brass numbers. Albert Sans 11px uppercase labels at `#9a8a7a`. Hover: `rgba(122,31,46,0.04)` fill.
- **Bordeaux Rule:** Bordeaux appears in exactly one element per visual section — never stacked. Priority order: italic headline word > CTA fill > data highlight. If bordeaux appears in the headline, the CTA uses walnut fill instead.
- **Signature Details:** Warm noise at 2.5% opacity. Brass horizontal rules as section architecture (not CSS borders on containers — standalone `<div>` rule elements). Card/container borders: `1px solid rgba(122,31,46,0.12)`. `border-radius: 100px` on pill CTAs only — zero radius on all other containers. Nav separated from hero by standalone brass rule div, not a box border.

---

## Fixed Rules (Apply to ALL Presets)

### Noise Texture
Every page gets a global CSS noise overlay: `body::before` with `position: fixed; inset: 0; pointer-events: none; z-index: 1000`. Uses inline SVG `<feTurbulence>` with `baseFrequency: 0.75–0.85`, `numOctaves: 4`, `stitchTiles: stitch`. Opacity: `0.016–0.05` (lighter on white backgrounds, heavier on dark).

### Micro-Interactions
- **Buttons:** `translateY(-1px)` to `translateY(-2px)` on hover. Easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`. Duration: `0.25s`.
- **Vertical cards:** `translateY(-2px)` on hover.
- **Horizontal rail cards:** `translateX(4px)` on hover.
- **Table/panel rows:** `navy-06%` or equivalent background fill. No movement, no shadow.
- **Never use `scale()` on hover** — feels playful, not institutional.

### Animation System
- **Page load:** `fadeUp` — `opacity: 0→1`, `translateY: 20–28px → 0`. Duration `0.6–0.65s`. Stagger: `0.07s` increments.
- **Scroll-triggered:** `IntersectionObserver` at `threshold: 0.1`, `rootMargin: '0px 0px -32px 0px'`. Toggle `.visible` class which triggers the CSS transition.
- **SVG waveforms:** `stroke-dashoffset` animation. Total path length calculated, then `values: "{length};0;0;{length}"`, `dur: 3–4s`, `repeatCount: indefinite`.
- **Rotating elements:** `animateTransform type="rotate"`, full 360° per 3–6s.
- **Scanning lines:** `animate attributeName="y1"`, linear oscillation across the element height.
- **Status pulses:** `@keyframes` opacity `1 → 0.3 → 1`, duration `2–3s`. Never `scale()`.

### Typography Scale
| Role | Size range | Weight | Font role |
|---|---|---|---|
| Hero headline | 60–96px | 300–400 | Display serif |
| Section title | 36–56px | 300–400 | Display serif |
| Body copy | 14–16px | 300 | Sans |
| Kicker/label | 10–11px | 400 | Mono or Sans uppercase |
| Large stat | 28–54px | 300–400 | Serif or Mono |
| Card value | 20–30px | 300–400 | Serif |
| Micro label | 9–10px | 300–400 | Mono uppercase |

### Section Label System
Every major section opens with a kicker: 10–11px, uppercase, 0.15–0.22em letter-spacing, accent color, preceded by a short horizontal rule (`width: 20–28px, height: 1px`) or a colored dot. Recommended format: `"CATEGORY"` or `"01 — SECTION NAME"`.

### Status Indicator (Footer)
All footers include: small pulsing dot + JetBrains Mono label. Light preset footers (A, B, C, F): green dot `#2EBA8A`. Dark preset footers (D, E): white dot at 40% opacity. Pulse via `@keyframes` opacity oscillation, never `scale()`.

### Responsive (≤ 900px)
- Two-column hero grids → single column
- Sidebars (Preset C) → hidden; content full-width
- Data rails (Preset A) → hidden; content expands
- Nav links hidden; logo + single CTA button only
- Section padding: `80px 24px` (from `120px 56px–64px`)
- All font sizes use `clamp()` — no manual mobile overrides needed