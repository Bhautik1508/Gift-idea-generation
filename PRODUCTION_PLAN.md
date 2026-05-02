# GiftSense — Production & Monetization Roadmap

> Phased plan to take GiftSense from a working MVP to a revenue-generating, production-grade product.
> Goal: affiliate revenue, brand partnerships, and a defensible niche in India's gifting market.
> Authored: 2026-04-27.

## Locked decisions (2026-04-27)
1. **Hosting:** stay on Vercel. Phase 0 must therefore eliminate all filesystem writes — Vercel's FS is read-only / ephemeral for serverless functions.
2. **Auth:** NextAuth.js (Auth.js v5). Free tier, self-hosted sessions in Postgres.
3. **Build order:** real product data **before** affiliate links. We're shipping quality before revenue — once cards show real images + prices, the affiliate-link layer becomes a one-line swap on already-real URLs.
4. **Geography:** India-only. Deprioritize Phase 5.4 (i18n) until later. Don't add region-routing complexity in Phases 0–4.
5. **Brand:** keep "GiftSense". No rebrand before SEO investment. Domain & metadata stay as-is.

---

## Executive Summary — what's working, what's missing

### What's already strong
- **AI core is sophisticated.** Prompt engineering (`lib/prompts/`), signal expansion, gift taxonomy seeds, and a post-processing pipeline (`lib/postProcess.ts`) for re-ranking, dedup, budget enforcement, and signal attribution.
- **Multi-model fallback** with quota/timeout handling in [app/api/recommend/route.ts](app/api/recommend/route.ts).
- **WhatsApp chat signal extraction** is a real differentiator — few competitors do this.
- **Solid UX foundation**: progress bar, confidence badges, compare bar, share links, "not quite" rejection flow with regeneration.
- **Test coverage** exists across pages, lib, and APIs (~25 test files).
- **India-context awareness** baked into prompts (₹, festivals, regional norms).
- **Light-weight analytics** wrapper over Vercel Analytics with typed events.

### Critical gaps blocking monetization & production
1. **Zero affiliate revenue capture.** The "Find this" CTA in [components/ProductCard.tsx:207](components/ProductCard.tsx#L207) goes to a raw Google Search — no Amazon Associates tag, no Flipkart Affiliate, no commission.
2. **No real product catalog.** Recommendations are LLM-generated names with no link to actual buyable SKUs. Users have to search and may not find anything that matches the description.
3. **Persistence is fragile.** Feedback is written to `data/feedback.json` on the local filesystem ([app/api/feedback/route.ts:8](app/api/feedback/route.ts#L8)) — this **silently breaks on Vercel** (read-only / ephemeral FS). Profiles live only in `localStorage`, so users lose them if they switch device or clear cache.
4. **In-memory rate limiter** ([lib/apiUtils.ts:4](lib/apiUtils.ts#L4)) doesn't share state across serverless instances — easily bypassed at scale.
5. **Unprotected admin route.** [app/admin/page.tsx](app/admin/page.tsx) is publicly accessible — anyone can read all user feedback.
6. **No accounts.** No way to remarket, send emails, build retention, or run a loyalty/referral program — all core monetization levers.
7. **No legal pages.** No Privacy Policy, Terms of Service, affiliate disclosure, or cookie banner — required for AdSense, affiliate programs, and Indian DPDP Act 2023 compliance.
8. **SEO is barely started.** One landing page, weak occasion pages, no programmatic SEO, no blog, no schema markup beyond the homepage `WebApplication` JSON-LD.
9. **No image previews** on cards. Plain-text recommendations look thin compared to Pinterest, Amazon, etc.
10. **No regional pricing/currency** support — locked to ₹ / India only.

---

## Phase 0 — Stabilize for production *(1 week, highest priority)*

**Goal:** Ship without silent breakage. No new features.

### 0.1 Fix filesystem persistence (BLOCKER on Vercel — confirmed hosting choice)
- Replace `fs.writeFileSync` in [app/api/feedback/route.ts](app/api/feedback/route.ts) with a real datastore.
- **Use Neon Postgres** (free tier, serverless, Vercel-native integration via the Neon Vercel marketplace partnership).
- Schema to create up front (used across phases):
  - `feedback` — landing, note, timestamp, session_id
  - `events` — for server-side analytics events (Phase 1.4)
  - `recommendations_cache` — keyed by `(occasion, relationship, budget_band, signal_hash)` (Phase 5.2)
  - `product_lookups` — keyed by `search_keywords` → `{ image_url, price, product_url, asin, fetched_at }` (Phase 1.2)
  - `users`, `profiles`, `gift_history`, `reminders` — created in Phase 2
- Use `@neondatabase/serverless` driver — works in Edge runtime if we move there later.
- Migrate `localStorage` profiles to be optionally synced to DB once auth lands (Phase 2).

### 0.2 Replace in-memory rate limiter
- Use **Upstash Redis** (serverless, free tier). Rewrite `rateLimit()` in [lib/apiUtils.ts](lib/apiUtils.ts) to use sliding-window counters in Redis.
- Apply per-IP **and** per-session limits to `/api/recommend`, `/api/parse-chat`, `/api/regenerate-card`, `/api/feedback`.

### 0.3 Protect /admin
- Add basic auth via middleware OR replace with Clerk/NextAuth + role check.
- Move the route to `/admin/feedback` and add a 401 page.
- Add HTTP basic auth as a stop-gap *today* via env vars (`ADMIN_USER`, `ADMIN_PASS`).

### 0.4 Hardening checklist
- Add `Content-Security-Policy`, `Strict-Transport-Security`, `Permissions-Policy` to [next.config.ts](next.config.ts).
- Enforce request size on `/api/parse-chat` (current MAX is on `/recommend` only).
- Sanitize chat-paste input before sending to Gemini (PII redaction option for users).
- Add a `robots.txt` and `sitemap.ts` (Next.js 16 supports `app/sitemap.ts`).
- Wire **Sentry** (or BetterStack) for error tracking — currently `console.error` only.

### 0.5 Legal & compliance
- Write **Privacy Policy** (must mention: Gemini API processes user-pasted data, what's stored, retention).
- Write **Terms of Service**.
- **Affiliate Disclosure** page — required by Amazon Associates and FTC-equivalent norms.
- **Cookie consent banner** — Indian DPDP Act 2023 + EU traffic. Use a lightweight library or build a simple one.
- Add `Contact us` email + page (required for AdSense and most affiliate programs).

**Exit criteria:** Vercel deploy with no silent FS writes, Redis-backed rate limit, /admin gated, legal pages live, error monitoring active.

---

## Phase 1 — Quality first, then revenue *(2–3 weeks)*

**Locked sequence: real product data ships before affiliate links.** Rationale: when affiliate links go live in 1.3, they will already point to ASINs we know exist + match the recommendation. No risk of high-CTR clicks landing on broken/empty Amazon search pages.

### 1.1 Product enrichment pipeline (do this FIRST)
For every recommendation in a session, do a **server-side product lookup** to fetch real image, price, product URL, and merchant.

- **Provider choice:** start with **Rainforest API** (Amazon-only, ~$0.002–0.005/call, returns title/image/price/rating/ASIN). Alternatives: SerpApi, Oxylabs, RapidAPI Amazon endpoints. Avoid official Amazon PA-API — gated behind Associates approval AND requires a baseline of sales to stay active.
- **Caching is non-negotiable.** Hash `search_keywords` → store in `product_lookups` table (Phase 0.1) with a 7-day TTL. Cache hit rate should be >70% within a month. Keep daily cost <₹500 even at scale.
- **Lookup strategy:**
  - Phase 1.1a: enrich top 3 cards only (synchronous, blocks result page slightly).
  - Phase 1.1b: enrich the rest in parallel via streaming — show enriched cards as they arrive, fall back to text-only after 4s.
- **Fallback:** if API fails or returns nothing, render the card exactly as today (no degradation).
- **Quality filter:** if returned price diverges from LLM `price_range` by >50%, mark as low-confidence or drop the lookup result and stay text-only — protects users from misleading prices.
- **UI changes** in [components/ProductCard.tsx](components/ProductCard.tsx):
  - Add product image (use `next/image`).
  - Show real price next to LLM `price_range`.
  - Show merchant logo (Amazon/Flipkart/Myntra).
  - Show rating if available.

This single change converts the experience from "AI suggests vague gift" to "AI shows you a real, in-stock product with image & price."

### 1.2 Affiliate link generator
Now that recommendations resolve to real ASINs/URLs, layer revenue on top.

Create [lib/affiliate.ts](lib/affiliate.ts) with `buildAffiliateLink(productUrl, merchant)`.

Provider strategy:
1. **Amazon Associates India** — apply at affiliate-program.amazon.in. Once enriched data has an ASIN, build: `https://www.amazon.in/dp/{ASIN}?tag={ASSOC_TAG}`. Direct ASIN links convert 3–5× better than search URLs. **Note:** Amazon Associates India requires 3 qualifying sales within 180 days to stay active. Phase 3 SEO traffic should comfortably clear this.
2. **Cuelinks** — single integration, monetizes any outbound link across ~80% of Indian retailers (Flipkart, Myntra, Nykaa, BigBasket, Ajio, Tata CLiQ, MakeMyTrip, etc.). Use as the default fallback for any non-Amazon merchant returned by enrichment. One cheque, one dashboard.
3. **Experience platforms** — BookMyShow Activities, Cleartrip Experiences, Fitternity, Cult.fit — typically routed via Cuelinks.

### 1.3 Replace the "Find this" button
Currently [components/ProductCard.tsx:207-215](components/ProductCard.tsx#L207-L215) → Google Search.

New behavior:
- Primary: deep link to the enriched product URL (from 1.1) wrapped through `buildAffiliateLink`.
- For Experience category with no enrichment hit: deep link to BookMyShow/Cleartrip search via Cuelinks.
- Secondary "Search elsewhere" small link → existing Google Search (fallback when enrichment misses).
- Track `card_find_click` with `merchant`, `affiliate_program`, `had_enrichment` (boolean).

### 1.4 Click-through analytics
- New event: `affiliate_click` with `merchant`, `category`, `price_range`, `confidence`, `signal_source`, `had_enrichment`.
- Server-side click logger writes to `events` table (Phase 0.1) so we can attribute revenue per session.
- New event: `affiliate_conversion` — wire postbacks in Phase 3 (`/api/affiliate/postback`).

### 1.5 Affiliate disclosure UI
- Small `i` icon next to "Find this" → tooltip: "We may earn a commission if you buy via this link, at no extra cost to you."
- Footer link to the disclosure page from Phase 0.5.

**Revenue projection:** With direct ASIN links (3–5× better than search), ~5% CTR on 8 cards/session, 3% Amazon commission on a ₹2,500 gift, each session is worth ~₹4–6 once factoring conversion. At 1k sessions/day with 2% conversion, that's ~₹65k–100k/month at modest traffic.

---

## Phase 2 — Accounts, retention, and the data flywheel *(3 weeks)*

**Goal:** Convert anonymous users into addressable users. Build the asset.

### 2.1 Auth — NextAuth.js (Auth.js v5)
- Use `next-auth` v5 with the **Neon Postgres adapter** (`@auth/pg-adapter` or Drizzle adapter on top of the Phase 0.1 connection).
- Providers: Email (magic link via Resend in Phase 2.2) + Google OAuth. Skip credentials provider — passwords are not worth the support burden at this stage.
- Session strategy: database sessions (not JWT) — needed so Phase 2.3 reminder cron can look users up by `user_id`.
- Migrate `localStorage` profiles in [lib/profiles.ts](lib/profiles.ts) into a Postgres `profiles` table tied to `user_id`. Provide a one-time "import your saved people" prompt for returning users — read existing localStorage on first sign-in, POST to `/api/profiles/import`, then clear local copy.
- Add `middleware.ts` to protect `/admin`, `/api/admin/*`, and the future `/account` routes.

### 2.2 Email infrastructure
- **Resend** (developer-friendly) or **Loops.so** (lifecycle automation built-in).
- Double opt-in for marketing.
- Lifecycle emails:
  - Welcome (educate on the WhatsApp chat feature — most users miss it).
  - Gift reminder ("Diwali is in 6 weeks. Here are gift ideas for the 3 people you saved.")
  - Re-engagement after 30 days idle.

### 2.3 Reminders / "Gift calendar"
- Let users add birthdays/anniversaries per saved profile. Cron job (Vercel Cron) sends gift reminder emails 14/7/2 days before.
- This is a *retention killer-feature* — most gift sites are one-shot. Recurring reminders turn this into a habit.

### 2.4 Result page upgrades for revenue
- "Email me these ideas" button → captures email, sends a beautifully formatted email with affiliate links → **email opens & clicks earn commission too**.
- "Save to wishlist" → builds a database of intent we can target.

### 2.5 Referral loop
- "Share this list with the giftee" — already have share URLs; add: "Get 10% off via Cuelinks" or similar. Tracks referrer via UTM.

**Exit criteria:** Auth live, ≥30% of result-page users save a profile or email, automated reminder emails firing.

---

## Phase 3 — SEO, content & top-of-funnel *(ongoing, start in week 4)*

**Goal:** Free organic traffic. This is where the business compounds.

### 3.1 Programmatic SEO pages
Already have stubs at `/birthday`, `/diwali`. Expand massively:

- `/gifts-for/[relationship]` — "Gift ideas for parents", "Gift ideas for husband", × 9 relationships
- `/gifts-for/[relationship]/[occasion]` — "Anniversary gifts for husband" × 9 × 8 = 72 pages
- `/gifts-under/[budget]` — "Gifts under ₹1500", "Gifts under ₹3000" × 5
- `/[occasion]-gift-ideas` — "Diwali gift ideas", "Raksha Bandhan gift ideas"
- `/gifts-for-[interest]-lovers` — "Gifts for cricket fans", "Gifts for foodies" × 20
- City pages: `/gift-experiences-mumbai`, `/gift-experiences-bangalore` — high-intent, low competition

For each, generate a **server-rendered list of 12 example recommendations** (cached, deterministic prompt) + a CTA into the questionnaire flow. Each page has unique content (>1000 words), schema markup (`ItemList` + `Product`), proper meta tags. **All product links are affiliate links.**

### 3.2 Blog / editorial
- `/blog` — Next.js MDX. Topics:
  - "How to choose a Diwali gift for your boss" (high search volume)
  - "Birthday gift ideas for your wife who has everything"
  - "Best experiential gifts in Mumbai 2026"
- One post per week. Each article naturally embeds 5–10 affiliate links + CTAs to the AI tool.

### 3.3 Schema markup everywhere
- `Product` schema on each recommendation card (Phase 1.3 product data feeds this).
- `FAQPage` on landing.
- `BreadcrumbList` on category pages.
- `Article` on blog posts.

### 3.4 Backlinks & PR
- Submit to ProductHunt (Phase 1 feature-complete first).
- "AI gifting" angle for tech press: YourStory, Inc42, Analytics India Mag.
- Reddit: r/india, r/IndianFashion, r/IndianGaming — share genuine value, not spam.

### 3.5 Performance
- Move LLM calls behind Vercel Edge for lower TTFB on streaming.
- Use Next.js streaming (`<Suspense>`) on the result page so users see territories while recommendations stream in.
- Image optimization with `next/image` once Phase 1.3 ships product images.
- Lighthouse > 95 on landing.

**Exit criteria:** ≥10k monthly organic visits within 3 months of Phase 3 launch.

---

## Phase 4 — Brand partnerships & sponsored gifts *(month 4+)*

**Goal:** Direct deals beyond affiliate networks. Higher margin.

### 4.1 Sponsored placement infrastructure
- Add `is_sponsored` flag to recommendations. Sponsored cards rendered with a clear "Sponsored" pill (FTC compliance).
- Build a simple **brand portal** at `/brands` where DTC brands can:
  - Apply to be featured.
  - View impression/click stats on their products.
  - Pay per click or flat monthly.
- Target: DTC brands without big ad budgets — Boat, Mokobara, Bombay Shaving Co, The Whole Truth, Wakefit, etc.

### 4.2 Curated drops
- Editorial pages: "GiftSense × Bombay Shaving Co — Father's Day Edit". Full-bleed, high-design, affiliate-only or flat-fee.
- Run as quarterly campaigns around festivals.

### 4.3 Corporate gifting B2B
- Companies in India spend ₹3,000–10,000 per employee on Diwali corporate gifting. Massive market.
- New flow: `/corporate` — bulk gifting for HR teams. AI picks 1–3 options that work across diverse personalities, you handle procurement via affiliate partners.
- Even a 5–10% commission on a ₹5L corporate order = serious revenue.

### 4.4 Premium tier (optional)
- "GiftSense Pro" — ₹199/month or ₹999/year:
  - Unlimited saved profiles (free tier capped at 5).
  - Advanced WhatsApp chat analysis (multi-year, multiple chats merged).
  - Concierge mode — human + AI hybrid for high-stakes gifts (wedding, anniversary).
  - Priority gift sourcing.

---

## Phase 5 — Defensibility & scale *(month 6+)*

### 5.1 Proprietary data moat
- Train a re-ranker on logged `affiliate_conversion` data: which AI-suggested gifts actually get bought? Feed back into prompt + post-processing weights.
- This is the asset competitors can't copy.

### 5.2 LLM cost control
- Cache `(occasion, relationship, budget, top-3-signals)` → recommendations for 24h. ~30% of free traffic likely hits cacheable buckets.
- Move WhatsApp parsing to a smaller model (Gemini Flash Lite or local distilled model) — it's structured extraction, doesn't need the strongest model.
- Track $ spent per session; alert if it exceeds revenue per session.

### 5.3 Mobile app
- Wrap with Capacitor or build a thin React Native shell. Not urgent, but reminder push notifications for occasions are 5× more effective on mobile vs email.

### 5.4 Internationalization *(deprioritized — India-only for now)*
- **Locked to India for the first year.** Skip during Phases 0–4.
- Revisit only after India revenue is meaningful (>₹3L/month) and you have bandwidth for support across regions.
- When/if revisited: currency switching (USD, AED, GBP for Indian diaspora), affiliate routing per region (Amazon US/UK), localized prompts.

---

## Cross-cutting concerns

### Security & abuse prevention (revisit each phase)
- Gemini API cost abuse: cap per-IP and per-session daily spend.
- Add CAPTCHA (hCaptcha — free) on the questionnaire submit if abuse detected.
- Validate and sanitize all user-provided strings before LLM calls — prompt injection is real (see chat-paste flow especially).
- Audit log for admin actions.

### Observability
- Sentry for errors.
- Vercel Analytics → augment with PostHog for funnels, cohorts, session replay.
- Custom dashboard: sessions → recommendations → affiliate clicks → estimated revenue.

### Data & privacy
- Right-to-delete (DPDP Act 2023, GDPR-aligned).
- Auto-delete chat-paste data after recommendation generation unless user opts in to save.
- Document data retention in Privacy Policy.

### Quality bar for recommendations
- Currently the LLM can hallucinate prices and unavailable products. Phase 1.3 product enrichment is the long-term fix, but in parallel:
  - Add a "report bad recommendation" link → feeds into a moderation queue.
  - Track the rate of "Not quite" rejections per product type → prune systematically bad outputs from the seed taxonomy.

---

## Suggested order of attack (next 90 days)

Reflects locked decisions: Vercel + Neon, NextAuth, **product data before affiliate links**, India-only.

| Week | Focus |
|---|---|
| 1 | Phase 0.1 (Neon Postgres), 0.2 (Upstash Redis), 0.3 (admin auth via NextAuth basic gate), 0.5 (legal pages) |
| 2 | Phase 0.4 (security headers, Sentry, sitemap, robots), apply for Amazon Associates + Cuelinks (long lead time) |
| 3 | Phase 1.1a (Rainforest API integration, top-3 enrichment, caching) |
| 4 | Phase 1.1b (streaming enrichment for remaining cards, image/price/rating UI) |
| 5 | Phase 1.2 + 1.3 (affiliate link generator, "Find this" rewrite — direct ASIN links) |
| 6 | Phase 1.4 (server-side click analytics), Phase 1.5 (disclosure UI) |
| 7 | Phase 2.1 (NextAuth.js + Neon adapter, Email + Google providers) |
| 8 | Phase 2.2 (Resend), Phase 2.3 (reminders + Vercel Cron) |
| 9 | Phase 2.4 (email-me-ideas), Phase 2.5 (referral UTM) |
| 10 | Phase 3.1 (programmatic SEO — first 50 pages live, India-targeted) |
| 11 | Phase 3.2 (blog launch with 8 seed posts), Phase 3.3 (schema markup) |
| 12 | Phase 4.1 (brand portal MVP), reach out to 10 DTC brands |

By **end of week 12**: legal-compliant, monetized with real-product affiliate links, NextAuth accounts live, reminder emails firing, 50+ SEO pages indexed, brand portal pitch ready.

---

## Open questions — resolved (2026-04-27)

All five resolved at the top of this doc. Recap:
1. ~~Hosting~~ → Vercel.
2. ~~Auth~~ → NextAuth.js v5 + Neon adapter.
3. ~~Affiliate vs catalog ordering~~ → Catalog (real product data) ships first, affiliate links layered on top.
4. ~~Geography~~ → India only; Phase 5.4 deprioritized.
5. ~~Brand~~ → Keep GiftSense.

## New questions surfaced by the locked decisions

These are smaller follow-ups worth flagging before Phase 1 starts:

1. **Rainforest API budget cap.** What's the monthly ceiling for product enrichment spend before we throttle? Suggest ₹2,000/month hard cap initially.
2. **Amazon Associates approval timing.** Apply in week 1. If approval takes 4+ weeks (common), Phase 1.2 should fall back to Cuelinks-only Amazon links until approval lands.
3. **Email-from address for Resend.** Need a domain (e.g. `hello@giftsense.in` or similar) — confirms whether you own a custom domain or are still on `giftsense.vercel.app`.
4. **First 10 DTC brand targets** for Phase 4 outreach — worth listing now so the Phase 4 portal is built around real partner needs.
