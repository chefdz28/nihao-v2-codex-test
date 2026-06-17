import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import AiTeacherAgent from '@/components/AiTeacherAgent';
import Seo from '@/components/Seo';
import JsonLd from '@/components/JsonLd';
import HskToolsNav from '@/components/HskToolsNav';
import { learningResourceLd, breadcrumbLd } from '@/lib/structuredData';
import { trackEvent } from '@/lib/analytics';

/** V3.7 /ai-teacher — deterministic "AI Teacher" experience (no paid AI API). */
export default function AiTeacher() {
  useEffect(() => { trackEvent('ai_teacher_open', {}); }, []);

  return (
    <div className="max-w-[640px] mx-auto px-6 py-10">
      <Seo />
      <JsonLd id="ai-teacher-resource" data={learningResourceLd({
        name: 'المعلم الذكي لتعلم الصينية',
        description: 'خطة يومية لتعلم الصينية، كلمات HSK، تدريب بينين، واختبار سريع للناطقين بالعربية.',
        path: '/ai-teacher',
      })} />
      <JsonLd id="ai-teacher-breadcrumb" data={breadcrumbLd([
        { name: 'الرئيسية', path: '/' },
        { name: 'المعلم الذكي', path: '/ai-teacher' },
      ])} />

      {/* hero */}
      <div className="text-center mb-8" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-[#FF3333]/15 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={26} className="text-[#FF3333]" />
        </div>
        <h1 className="font-display font-black text-3xl text-white mb-2">المعلم الذكي لتعلّم الصينية</h1>
        <p className="text-sm font-arabic" style={{ color: 'var(--color-text-secondary)' }}>
          احصل على خطة يومية، كلمات، اختبار سريع، وروابط مناسبة لمستواك.
        </p>
      </div>

      <AiTeacherAgent />

      <HskToolsNav />
    </div>
  );
}
