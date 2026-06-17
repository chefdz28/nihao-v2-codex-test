import { Link } from 'react-router-dom';
import { ClipboardList, Layers, FileText, PenLine, BookOpen } from 'lucide-react';

interface Tool { path: string; label: string; icon: typeof BookOpen }

const ALL: Tool[] = [
  { path: '/ai-teacher', label: 'المعلم الذكي', icon: BookOpen },
  { path: '/hsk-tests', label: 'اختبارات HSK', icon: ClipboardList },
  { path: '/hsk1-simulation', label: 'محاكاة HSK1', icon: ClipboardList },
  { path: '/hsk2-simulation', label: 'محاكاة HSK2', icon: ClipboardList },
  { path: '/hsk3-simulation', label: 'محاكاة HSK3', icon: ClipboardList },
  { path: '/flashcards/hsk3', label: 'بطاقات HSK3', icon: Layers },
  { path: '/worksheets/hsk3', label: 'ورقة عمل HSK3', icon: FileText },
  { path: '/writing-practice', label: 'تدريب الكتابة', icon: PenLine },
  { path: '/dictionary', label: 'القاموس', icon: BookOpen },
];

/**
 * V3.5 — internal linking block for HSK tools. Cross-links every HSK page so
 * learners (and search engines) can move between them. Pass `exclude` to hide
 * the current page's own link.
 */
export default function HskToolsNav({ exclude = [], title = 'أدوات HSK الأخرى' }: { exclude?: string[]; title?: string }) {
  const tools = ALL.filter(t => !exclude.includes(t.path));
  return (
    <nav className="mt-8" dir="rtl" aria-label={title}>
      <h2 className="text-sm font-display font-bold text-white mb-3 font-arabic">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {tools.map(t => {
          const Icon = t.icon;
          return (
            <Link
              key={t.path}
              to={t.path}
              className="liquid-glass rounded-xl px-3 py-2 text-xs font-arabic text-white hover:border-[#FF3333]/30 border border-transparent transition-colors flex items-center gap-1.5"
            >
              <Icon size={13} className="text-[#FF3333]" /> {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
