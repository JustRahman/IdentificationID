# Identification ID - design system (phase 1)

Goal: calm, official, premium. Companies House / GS1 trust with Stripe / Attio polish.
Import from `@/components/ui` (barrel) or the single file. Layout: `@/components/layout/{SiteHeader,SiteFooter,Logo}`.

## Palette (tokens in `src/app/globals.css`)

| Use | Class |
|-|-|
| Main text | `text-slate-900` (= `text-foreground`) |
| Secondary text | `text-slate-600`, labels / meta `text-slate-500`, placeholders `text-slate-400` |
| Grey second clause in headlines | `text-slate-400` |
| Page background | `bg-white`; alternate sections `bg-surface` (slate-50) with `border-y border-slate-200` |
| Hairlines | `border-slate-200` (stronger: `border-slate-300`) |
| Brand blue (CTAs, links, focus, eyebrows) | `bg-accent`, `hover:bg-accent-hover`, `text-accent`, soft `bg-blue-50` |
| Navy (ONE dark band per page max) | `bg-navy` |
| Status | green = verified / active only (`Badge tone="verified"`), amber = pending / sample only (`tone="pending"`), red = errors only (`tone="error"`) |

Never: orange / yellow / multicolor cards, gradients behind text, emoji, em dashes (use " - ").

## Type
- Font: Geist (sans) + Geist Mono. Headings `font-semibold tracking-tight`, `text-balance`.
- H1 page: `text-4xl sm:text-5xl` (homepage hero goes to ~3.6rem). H2 section: use `SectionHeader` (1.75rem mobile / 4xl desktop).
- Body: `text-base`/`text-sm`, `leading-relaxed`.
- IDs (MID / IID): ALWAYS `font-mono tabular-nums font-semibold` + copy button -> use `IdChip`. Add `data-no-i18n` to any raw ID text so the machine translator skips it.

## Spacing & surfaces
- Container: `mx-auto max-w-6xl px-5 sm:px-6` (or `<Container>`; `size="narrow"` = max-w-3xl for text pages).
- Section rhythm: `py-20 sm:py-24` (or `<Section tone="white|surface">`). Section header bottom margin is built in (`mb-10 sm:mb-12`).
- Cards: `rounded-2xl border border-slate-200 bg-white`, padding `p-6` (`p-7/p-9` for hero cards). Shadow ONLY on the one primary card of a view (`<Card elevated>`).
- Grid gaps: `gap-4` for card grids, `gap-6`-`gap-10` for column layouts.
- Small radius for controls: `rounded-lg` (buttons, inputs, chips), pills `rounded-full`.

## Components

```tsx
import { Button, ButtonLink, ArrowRight, Badge, IdChip, CopyButton, FactList, FactBox, Tabs,
  SearchBar, Card, Container, Section, EmptyState, PhotoPlaceholder, ProductImage,
  SectionHeader, DisclaimerBar } from "@/components/ui";
```

**Button / ButtonLink** - variants `primary` (one per view), `secondary` (outline), `ghost`, `dark`, `inverse` (on navy); sizes `sm | md | lg`.
```tsx
<ButtonLink href="/register" size="lg">Register free <ArrowRight /></ButtonLink>
<ButtonLink href="/lookup" variant="secondary">Search ID</ButtonLink>
<Button type="submit" disabled={saving}>Save</Button>
```
`buttonClasses(variant, size)` gives the class string if you need it on another element.

**Badge** - tones `neutral | info | verified | pending | error`, `dot`, `icon="check" | "shield"`, `size="xs" | "sm"`.
```tsx
<Badge tone="verified" icon="check">Registered manufacturer - since Nov 2026</Badge>
<Badge tone="pending" dot>Sample page</Badge>
```
For the plain "Registered Manufacturer" level use `tone="neutral" icon="check"`; green only for verified / active.

**IdChip** - official ID display with copy.
```tsx
<IdChip label="Manufacturer ID" id="MID-K3NA-G66C" size="lg" />
<IdChip label="Identification ID" id={p.identification_id} href={`/p/${p.identification_id}`} size="sm" />
<IdChip id="MID-K3NA-G66C" variant="plain" />          // Companies House inline style
<IdChip id="IID-XXXX-XXXX" copy={false} />             // format example only
```

**FactList / FactBox** - label/value rows with hairlines; empty values render grey "Not provided" (do not hide fields).
```tsx
<FactList items={[{ label: "Model", value: p.model, mono: true }, { label: "Country of origin", value: country }]} />
<FactList layout="grid" items={specs} />               // wide spec tables (label column 180px)
<FactBox title="Registry record" sticky items={[...]} footer={<img src={qr} alt="QR code" />} />
```

**Tabs** - controlled, count pills, arrow keys. Panels: `role="tabpanel" id={`${idPrefix}panel-${id}`} aria-labelledby={`${idPrefix}-${id}`}`.
```tsx
<Tabs items={[{ id: "overview", label: "Overview" }, { id: "products", label: "Products", count: 3 }]} value={tab} onChange={setTab} />
<Tabs variant="segmented" ... />                         // compact switcher
```

**SearchBar** - Product / Company / ID modes. Routing: `IID-...` -> `/p/<id>`, `MID-...` -> `/manufacturer/<id>`, text -> `/search?q=`. Pass only REAL registry IDs as `examples`.
```tsx
<SearchBar size="lg" examples={["IID-GGX3-794V"]} exampleHint="IDs look like IID-XXXX-XXXX" />
<SearchBar size="md" showModes={false} />
```
`searchHref(query)` exposes the same routing for custom forms.

**Card** - `<Card>`, `<Card elevated>` (one per view), `<Card interactive>` (link cards), `padding="none|sm|md|lg"`.

**SectionHeader** - eyebrow (blue), title + grey `muted` clause, description, optional right-side `action`, `align="center"`, `as="h1"` for page titles.
```tsx
<SectionHeader eyebrow="Products" title="Registered products." muted="Published by ACME Corp." action={<ButtonLink ...>} />
```

**EmptyState / PhotoPlaceholder / ProductImage**
```tsx
<EmptyState icon="box" title="No products yet" description="This manufacturer has not published products." compact />
<ProductImage src={img?.url} alt={name} className="w-full h-full object-cover" />  // falls back to "No photo yet" on missing/broken URL
```
Icons: `box | search | photo | building | document`.

**DisclaimerBar** - grey neutral note. Default text: "Information is published by the manufacturer. Identification ID confirms registration only." Pass legal texts (e.g. `PRODUCT_DISCLAIMER`, `VERIFICATION_DISCLAIMER` from `@/lib/constants`) verbatim as children.
```tsx
<DisclaimerBar />
<DisclaimerBar action={<button ...>Report this profile</button>}>{PRODUCT_DISCLAIMER}</DisclaimerBar>
```

## Layout
- `(public)/layout.tsx` renders `SiteHeader` + `main` + `SiteFooter`; public pages should NOT render their own nav/footer. Page content sets its own container/padding.
- `SiteHeader`: sticky, Search / For manufacturers / Pricing / FAQ, language switcher, Log in, outline "Search ID" (/lookup), solid "Register free" or "Dashboard" when logged in. Mobile menu below `lg`.
- `SiteFooter`: 4 link columns, legal entity line, "Something wrong on this page? Report it" (mailto support with the page URL; product/company pages also keep their own report form from `PublicPageNotice`).

## Rules for builders
- Real data only. No invented counts, logos, testimonials. Hide or use `EmptyState` when data is thin.
- Keep every route, query param, form field, API call, SEO metadata / JSON-LD / canonical, i18n (DOM translator: use `data-no-i18n` on codes) and legal texts. Restyle only.
- Focus rings come from globals (`:focus-visible` blue outline); do not remove outlines.
- Check at 1440x900 and 390x844; run `npx tsc --noEmit -p . && npx eslint <files>`.
