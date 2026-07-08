# NiHao V3.16 — تفعيل المعلم الذكي بـ Cohere (دليل الإعداد)

المعلم الذكي صار **هجين**: يجاوب محلياً أولاً (مجاني، فوري)، وإذا ما لقى جواب
ينادي **Cohere** عبر Supabase Edge Function آمنة. المفتاح **لا يظهر أبداً** في
الواجهة. بدون إعداد Cohere، الموقع يشتغل عادي (المعلم المحلي فقط) — لا شي ينكسر.

## خطوات التفعيل (مرة واحدة)

### 1) احصل على مفتاح Cohere مدفوع
- سجّل في cohere.com → Dashboard → API Keys
- ⚠️ مفتاح **Production** (مو Trial — الـTrial ممنوع للاستخدام التجاري)
- Command R7B رخيص جداً (~$0.04 لكل مليون token)

### 2) شغّل الـ migration في Supabase
- افتح Supabase → SQL Editor
- شغّل: `supabase/migrations/20260620_ai_teacher_usage.sql`
- (ينشئ جدول حدّ الاستخدام اليومي + RPCs)

### 3) انشر الـ Edge Function
```bash
# محلياً (يحتاج supabase CLI):
supabase functions deploy ai-teacher-cohere --project-ref <your-ref>
```
أو من Supabase Dashboard → Edge Functions → انسخ محتوى
`supabase/functions/ai-teacher-cohere/index.ts`

### 4) أضف المفتاح كسر (Secret) في Supabase
- Supabase → Edge Functions → Secrets (أو Settings → Edge Functions)
- أضف: `COHERE_API_KEY` = مفتاحك
- (SUPABASE_URL و SUPABASE_ANON_KEY يُضافان تلقائياً)

### 5) انشر الموقع (الكود)
انشر حزمة V3.16 بطريقتك المعتادة. خلاص.

## كيف يشتغل
1. الطالب يسأل → المعلم المحلي (deterministic) يحاول أولاً
2. لقى جواب قوي؟ → يعرضه فوراً (مجاناً، بدون Cohere)
3. ما لقى؟ → يعرض "أفكّر…" وينادي Cohere عبر Edge Function
4. Cohere يجاوب بالعربي بمستوى HSK1-3، ويعرض الجواب
5. لو Cohere فشل أو انتهى الحد اليومي → يرجع للروابط الاحتياطية

## الحماية (مهم)
- 🔒 **المفتاح**: في Supabase secrets فقط، الواجهة تنادي Edge Function (تتحقق من JWT)
- 💰 **حد يومي**: 15 نداء/طالب/يوم (عدّله في `DAILY_LIMIT` بالـ Edge Function)
- 🔑 **تسجيل دخول مطلوب**: غير المسجّلين يشوفون الروابط الاحتياطية فقط
- 🛡️ **fail-soft**: أي خطأ → المعلم المحلي يشتغل، لا شي ينكسر

## التكلفة المتوقعة
معظم الأسئلة (معاني، خطط، كلمات) يجاوبها المحلي **مجاناً**. Cohere يشتغل فقط
للأسئلة الصعبة. مع حد 15/طالب/يوم وموديل R7B الرخيص، التكلفة ضئيلة جداً.

## تعطيل مؤقت
لو ما ضفت `COHERE_API_KEY`، الـ Edge Function ترجع خطأ لطيف، والواجهة تعرض
الروابط الاحتياطية. يعني الموقع آمن حتى قبل ما تكمل الإعداد.
