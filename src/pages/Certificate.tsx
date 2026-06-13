import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLessons, fetchUserProgress, fetchLevels } from '@/lib/dataService';
import { completedLessonIds } from '@/lib/learning';
import type { LessonRow, LevelRow, UserProgressItem } from '@/types/supabase';

/**
 * V2 Certificate: earned dynamically when every lesson is completed
 * (no hardcoded lesson count). Otherwise shows how many lessons remain.
 */
export default function Certificate() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [levels, setLevels] = useState<LevelRow[]>([]);
  const [progress, setProgress] = useState<UserProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const [l, lv, p] = await Promise.all([fetchLessons(), fetchLevels(), fetchUserProgress(user.id)]);
        setLessons(l);
        setLevels(lv);
        setProgress(p);
      } catch (err) {
        console.error('Certificate load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> {t('common.loading')}</div>
      </div>
    );
  }

  const done = completedLessonIds(progress);
  const completedCount = lessons.filter(l => done.has(l.id)).length;
  const totalCount = lessons.length;
  const remaining = Math.max(0, totalCount - completedCount);
  const earned = totalCount > 0 && remaining === 0;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const levelName = levels.length > 0 ? (lang === 'ar' ? levels[0].title_ar : levels[0].title_en) : 'Chinese Basics';
  const userName = user?.fullName || 'Student';
  const date = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (!earned) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-16 text-center">
        <div className="liquid-glass p-12">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Lock size={28} className="text-[#666]" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">{t('cert.locked')}</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>{t('cert.lockedSub')}</p>
          <div className="mb-2 flex items-center justify-between text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <span>{completedCount} / {totalCount}</span>
            <span className="text-white font-bold">{pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden mb-4">
            <div className="h-full rounded-full bg-gradient-to-r from-[#FF3333] to-[#ff7755] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sm mb-6 font-semibold text-[#f59e0b]">
            {remaining} {t('cert.remaining')}
          </p>
          <Link to="/courses" className="btn-primary text-sm py-2 px-6">{t('cert.continue')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#a0a0a0] hover:text-white mb-8 transition-colors">
        <ArrowLeft size={16} /> {t('daily.dashboard')}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div
          className="relative p-12 md:p-16 text-center"
          style={{ background: 'url(/images/cert-bg.jpg) center/cover', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          <div className="absolute inset-0 bg-[#0a0a0a]/40 rounded-2xl" />
          <div className="relative z-10">
            <p className="font-display text-lg tracking-wider text-[#f59e0b] mb-2">Certificate of Completion</p>
            <div className="w-16 h-0.5 bg-[#f59e0b] mx-auto mb-6" />
            <p className="text-sm text-[#a0a0a0] mb-4">This certifies that</p>
            <h2 className="font-display font-black text-4xl text-white mb-4">{userName}</h2>
            <p className="text-sm text-[#a0a0a0] mb-4">has successfully completed all {totalCount} lessons of</p>
            <h3 className="font-display font-bold text-2xl text-[#FF3333] mb-6">{levelName}</h3>
            <p className="text-sm text-[#a0a0a0] mb-8">{date}</p>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="w-24 h-0.5 bg-white/20 mb-2" />
                <p className="text-xs text-[#a0a0a0]">NiHao Team · cnihao.com</p>
              </div>
            </div>
            <p className="text-xs text-[#666] mt-6">Cert ID: NH-{new Date().getFullYear()}-{(user?.id || '').slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => window.print()} className="btn-primary">
            <Download size={16} /> Download / Print
          </button>
          <button
            onClick={() => { if (navigator.share) navigator.share({ title: 'NiHao Certificate', url: window.location.href }).catch(() => {}); }}
            className="btn-secondary"
          >
            <Share2 size={16} /> Share
          </button>
        </div>
      </motion.div>
    </div>
  );
}
