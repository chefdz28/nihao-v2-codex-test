# NiHao V3.5 — SEO Indexing & Search Console Checklist

This is a practical checklist to get NiHao's pages indexed and improving in
Google Search. (HTTPS is NOT part of this scope — it's working fine on other
devices.)

---

## 1. Sitemap (done in this release)
- public/sitemap.xml now lists **701 URLs**, including all public HSK tools:
  /hsk-tests, /hsk1-simulation, /hsk2-simulation, /hsk3-simulation,
  /flashcards/hsk3, /worksheets/hsk3, /writing-practice, plus 18 SEO articles
  and 586 dictionary word pages.
- Private routes are NOT in the sitemap: /admin, /dashboard, /profile,
  /dialogues-practice.

**In Search Console:** Sitemaps → submit `https://cnihao.com/sitemap.xml` (or
confirm it's already submitted and shows "Success").

## 2. Structured data (done)
- HSK test pages now emit Quiz JSON-LD; the /hsk-tests hub emits Course JSON-LD;
  each has BreadcrumbList. Dictionary words already emit DefinedTerm; SEO
  articles emit Article + FAQ + Breadcrumb.

**In Search Console:** after deploy, use the **URL Inspection → Test Live URL →
View tested page → More info** to confirm structured data is detected. Also run a
few URLs through the Rich Results Test (search.google.com/test/rich-results).

## 3. Request indexing for the new/important pages
Use **URL Inspection** in Search Console and click **Request Indexing** for:
- https://cnihao.com/hsk-tests
- https://cnihao.com/hsk1-simulation
- https://cnihao.com/hsk2-simulation
- https://cnihao.com/hsk3-simulation
- https://cnihao.com/flashcards/hsk3
- https://cnihao.com/blog/hsk2-mock-test
- https://cnihao.com/blog/hsk1-mock-test
- https://cnihao.com/blog/free-chinese-flashcards
- https://cnihao.com/blog/hsk3-words-arabic
- https://cnihao.com/dictionary

(Request a handful per day; Google rate-limits manual requests.)

## 4. Check Coverage / Pages report
In **Indexing → Pages**, watch for:
- "Crawled - currently not indexed" → usually thin/duplicate or low-priority;
  improve internal links (done) and content depth, then re-request.
- "Discovered - currently not indexed" → Google knows the URL but hasn't crawled;
  internal links + sitemap help; be patient.
- "Excluded by 'noindex'" → should be ZERO for public pages. We do NOT noindex
  any public test page.

## 5. Internal linking (done)
- A new HskToolsNav block cross-links every HSK tool (tests ↔ flashcards ↔
  worksheet ↔ writing ↔ dictionary), shown on the sim result screens and the HSK
  tool pages. SEO articles link to the matching tools, and tools link back via
  the nav. This spreads crawl equity and helps discovery.

## 6. Titles & descriptions
- Seo.tsx has AR/EN title + description for the HSK tool routes (set in V3.3–3.4
  and confirmed this release). Keep titles unique and descriptive; avoid
  duplicate titles across pages.

## 7. robots.txt / llms.txt
- Unchanged and correct: they allow crawling of public content and point to the
  sitemap. Do not block /blog, /dictionary, /hsk-* or the tools.

## 8. After deploy — verify
- [ ] sitemap.xml loads and shows 701 URLs
- [ ] GA4 Realtime shows traffic; "Test your website" detects the tag (V3.4.1 fix)
- [ ] Rich Results Test passes for a quiz page and an article
- [ ] No public page is accidentally noindex
- [ ] Search Console Coverage trend goes up over the following 2–4 weeks

## 9. Ongoing
- Publish 1–2 original HSK/Chinese articles per week (the SEO system makes this
  easy) targeting real Arabic search queries.
- Keep internal links fresh: every new tool/article should link to and be linked
  from related pages.
- Monitor Search Console **Performance** for queries gaining impressions, then
  strengthen those pages.

> Note: indexing is not instant. New pages typically take days to a few weeks to
> appear, and rankings build over months. The structural work here (sitemap,
> structured data, internal links, titles) is what makes that possible.
