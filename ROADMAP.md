# NiHao Roadmap Notes

## Future: AI Content Studio (V2.4+ — NOT implemented yet)

The AI Content Studio is a future admin-only capability. It is intentionally
NOT built in V2.3. When implemented, it MUST follow these rules:

- **No API keys in the frontend.** All AI calls go through a backend layer —
  a Supabase Edge Function or a small Express service on the existing VPS
  (same pattern as Paddoo). The browser never sees a provider key.
- **Draft → review → approve workflow.** AI output is written once to an
  `ai_drafts` table with status `draft`. An admin reviews it for Chinese/Pinyin
  accuracy and pedagogy, then promotes it to `approved`/`published`. Generated
  content is never shown to learners before human review.
- **Generate once, reuse forever.** Admin-generated lessons/articles/images are
  stored and reused for all students — never regenerated per student.
- **Paddoo integration for images/video.** NiHao admin creates a row in a
  `content_requests` table → a Paddoo n8n workflow builds the prompt →
  Nano Banana / GPT Image generates the asset → output is saved to Supabase
  Storage or Cloudinary → the request row is updated → the admin reviews and
  attaches it to the lesson/story/blog. Apply the Recipe-Brief-Lock pattern to
  keep a lesson's vocabulary consistent across all generated assets.
- **Mandatory human review** for: Chinese accuracy, Pinyin, AR/EN translation,
  quiz answer keys, beginner-appropriateness, certificates, and any SEO article
  before publishing.

## Cost discipline (target architecture)
- ~80% local/free features (current state through V2.3).
- ~15% AI text only when explicitly clicked.
- ~5% speech/pronunciation API only for important tests (premium).
