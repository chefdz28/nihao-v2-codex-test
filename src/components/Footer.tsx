import LeadCaptureBox from '@/components/LeadCaptureBox';
import { Link } from 'react-router-dom';
import { BookOpen, PenTool, Mic } from 'lucide-react';
import { useI18n } from '@/i18n';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="relative bg-[#0a0a0a]">
      {/* Top gradient line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(255,51,51,0.3), transparent)' }} />

      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-display font-extrabold text-xl text-white">NiHao</span>
              <span className="font-chinese text-[10px] bg-[#FF3333] text-white rounded-full w-5 h-5 flex items-center justify-center">你好</span>
            </div>
            <p className="text-[#a0a0a0] text-sm leading-relaxed mb-6">{t('footer.tagline')}</p>
            <div className="flex gap-3">
              {['X', 'IG', 'YT', 'TK'].map(social => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-[#a0a0a0] hover:text-[#FF3333] hover:border-[#FF3333]/30 transition-all text-xs font-display font-bold"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">{t('footer.quicklinks')}</h4>
            <ul className="space-y-3">
              {[
                { path: '/', label: 'nav.home' },
                { path: '/courses', label: 'nav.courses' },
                { path: '/about', label: 'nav.about' },
                { path: '/blog', label: 'nav.blog' },
                { path: '/contact', label: 'nav.contact' },
                { path: '/faq', label: 'nav.faq' },
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-[#a0a0a0] hover:text-white transition-colors text-sm">
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">{t('footer.learning')}</h4>
            <ul className="space-y-3">
              {[
                { path: '/courses', label: 'nav.courses', icon: BookOpen },
                { path: '/pinyin', label: 'nav.pinyin', icon: BookOpen },
                { path: '/essentials', label: 'nav.essentials', icon: BookOpen },
                { path: '/tones', label: 'nav.tones', icon: Mic },
                { path: '/numbers', label: 'nav.numbers', icon: PenTool },
                { path: '/dialogues', label: 'nav.dialogues', icon: Mic },
                { path: '/path', label: 'nav.path', icon: BookOpen },
                { path: '/study-in-china', label: 'nav.studyInChina', icon: BookOpen },
                { path: '/answers', label: 'nav.answers', icon: BookOpen },
                { path: '/teacher', label: 'nav.teacher', icon: PenTool },
                { path: '/stories', label: 'nav.stories', icon: BookOpen },
                { path: '/worksheets', label: 'nav.worksheets', icon: PenTool },
                { path: '/certificates', label: 'nav.certificates', icon: Mic },
                { path: '/dictionary', label: 'nav.dictionary', icon: BookOpen },
                { path: '/missions', label: 'nav.missions', icon: PenTool },
                { path: '/achievements', label: 'nav.achievements', icon: Mic },
                { path: '/placement-test', label: 'nav.placement', icon: PenTool },
                { path: '/practice', label: 'nav.practice', icon: PenTool },
                { path: '/pronunciation', label: 'nav.pronunciation', icon: Mic },
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-[#a0a0a0] hover:text-white transition-colors text-sm flex items-center gap-2">
                    <link.icon size={14} />
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-bold text-white mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              <li><Link to="#" className="text-[#a0a0a0] hover:text-white transition-colors text-sm">{t('footer.privacy')}</Link></li>
              <li><Link to="#" className="text-[#a0a0a0] hover:text-white transition-colors text-sm">{t('footer.terms')}</Link></li>
              <li><Link to="#" className="text-[#a0a0a0] hover:text-white transition-colors text-sm">{t('footer.cookies')}</Link></li>
            </ul>
          </div>
        </div>

        {/* V3.0A: email capture in footer */}
        <div className="mt-10 max-w-[520px]">
          <LeadCaptureBox sourceType="footer" compact />
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#666] text-sm">&copy; 2024 NiHao. {t('footer.copyright')}</p>
          <p className="text-[#666] text-xs">Made with love for language learners</p>
        </div>
      </div>
    </footer>
  );
}
