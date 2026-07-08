# NiHao V3.16 — تفعيل تدريب النطق بـ Groq (دليل الإعداد)

ميزة جديدة: الطالب ينطق جملة صينية، والذكاء الاصطناعي (Groq Whisper) يسمعه
ويقيّم نطقه فوراً. المفتاح **لا يظهر أبداً** في الواجهة (محمي في Edge Function).
بدون إعداد، الموقع يشتغل عادي — المكوّن يعرض رسالة "غير مفعّلة".

## ليش Groq؟
- Whisper **مفتوح المصدر**، يشغّله Groq على أجهزته (ما تحتاج GPU)
- **طبقة مجانية**: 2000 طلب صوتي/يوم بلا بطاقة ائتمان
- يدعم الصيني ممتاز · أسرع مزوّد · أرخص لو كبرت ($0.04/ساعة)

## خطوات التفعيل (مرة واحدة)

### 1) احصل على مفتاح Groq (مجاني)
- سجّل في console.groq.com (بإيميل أو Google، بلا بطاقة)
- API Keys → Create API Key → انسخه

### 2) شغّل الـ migration في Supabase
- SQL Editor → شغّل: `supabase/migrations/20260620_pronunciation_usage.sql`
- (جدول حد الاستخدام اليومي + RPCs)

### 3) انشر الـ Edge Function
```bash
supabase functions deploy pronunciation-check --project-ref <your-ref>
```
أو من Dashboard → Edge Functions → انسخ محتوى
`supabase/functions/pronunciation-check/index.ts`

### 4) أضف المفتاح كسر في Supabase
- Edge Functions → Secrets → أضف:
  `GROQ_API_KEY` = مفتاحك

### 5) انشر الموقع
انشر حزمة V3.16 عادي. خلاص — روح `/pronunciation` وجرّب.

## كيف يشتغل
1. الطالب يشوف جملة صينية (你好) + بينين + معنى عربي
2. يضغط "استمع للنطق الصحيح" (TTS الموجود)
3. يضغط "سجّل نطقك" → يقرأ الجملة → "إيقاف"
4. الصوت → Edge Function → Groq Whisper → نص صيني
5. نقارن (deterministic) ونعطي: ممتاز ✅ / قريب 👍 / حاول ثانية 🔁 + نسبة دقّة

## الحماية
- 🔒 المفتاح في Supabase secrets فقط
- 💰 حد يومي 30 محاولة/طالب (عدّله في `DAILY_LIMIT`)
- 🔑 تسجيل دخول مطلوب
- 🛡️ fail-soft: أي خطأ → رسالة لطيفة، لا شي ينكسر
- 📦 حد حجم الصوت 3MB

## الجمل
12 جملة HSK1 جاهزة في `src/lib/pronunciation.ts` (HSK1_SENTENCES).
تقدر تضيف/تعدّل بسهولة (hanzi + pinyin + arabic).

## التكلفة
الطبقة المجانية (2000/يوم) تكفي البداية تماماً. لو كبرت: $0.04/ساعة صوت —
أي ~$0.0001 للمحاولة الواحدة (جزء من سنت).
