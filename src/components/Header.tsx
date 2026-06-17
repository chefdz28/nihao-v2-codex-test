import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, PenTool, Mic, LogOut, User, LayoutDashboard, Settings, Layers, Sun, RotateCcw, Music2, Hash, MessagesSquare, Map, ChevronDown, Target, BookA, Award, ClipboardCheck, BookOpenText, GraduationCap, FileText, NotebookPen, School, Headphones, ClipboardList, FileBarChart, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { lang, t, setLang } = useI18n();
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false); // V2.0.6: Practice dropdown
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setPracticeOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  // V2.0.6 navigation: primary links + Practice dropdown
  const navLeft = [
    { path: '/', label: 'nav.home' },
    { path: '/courses', label: 'nav.courses' },
    { path: '/pinyin', label: 'nav.pinyin' },
    { path: '/essentials', label: 'nav.essentials' },
  ];
  const navRight = [
    { path: '/about', label: 'nav.about' },
    { path: '/blog', label: 'nav.blog' },
    { path: '/contact', label: 'nav.contact' },
  ];
  // V3.8.3 — grouped Training menu (clearer than one long flat list)
  const practiceGroups = [
    { heading: 'البداية', items: [
      { path: '/ai-teacher', label: 'nav.aiTeacher', icon: Sparkles },
      { path: '/daily', label: 'nav.daily', icon: Sun },
      { path: '/path', label: 'nav.path', icon: Map },
      { path: '/missions', label: 'nav.missions', icon: Target },
    ] },
    { heading: 'المهارات', items: [
      { path: '/pinyin', label: 'nav.pinyin', icon: Hash },
      { path: '/tones', label: 'nav.tones', icon: Music2 },
      { path: '/pronunciation', label: 'nav.pronunciation', icon: Mic },
      { path: '/writing-practice', label: 'nav.writing', icon: PenTool },
      { path: '/dictation', label: 'nav.dictation', icon: Headphones },
    ] },
    { heading: 'الاختبارات', items: [
      { path: '/hsk-tests', label: 'nav.hskTests', icon: ClipboardList },
      { path: '/hsk1-simulation', label: 'nav.hsk1', icon: ClipboardList },
      { path: '/hsk2-simulation', label: 'nav.hsk2', icon: ClipboardList },
      { path: '/hsk3-simulation', label: 'nav.hsk3', icon: ClipboardList },
      { path: '/placement-test', label: 'nav.placement', icon: ClipboardCheck },
    ] },
    { heading: 'المراجعة', items: [
      { path: '/review', label: 'nav.review', icon: RotateCcw },
      { path: '/mistakes', label: 'nav.mistakes', icon: NotebookPen },
      { path: '/flashcards', label: 'nav.flashcards', icon: Layers },
      { path: '/flashcards/hsk3', label: 'nav.flashcardsHsk3', icon: Layers },
      { path: '/worksheets/hsk3', label: 'nav.worksheets', icon: FileText },
    ] },
    { heading: 'المحتوى', items: [
      { path: '/dictionary', label: 'nav.dictionary', icon: BookA },
      { path: '/dialogues', label: 'nav.dialogues', icon: MessagesSquare },
      { path: '/stories', label: 'nav.stories', icon: BookOpenText },
      { path: '/essentials', label: 'nav.essentials', icon: BookOpen },
    ] },
    { heading: 'أدوات المعلم', items: [
      { path: '/teacher', label: 'nav.teacher', icon: School },
      { path: '/report', label: 'nav.report', icon: FileBarChart },
      { path: '/certificates', label: 'nav.certificates', icon: GraduationCap },
    ] },
  ];
  const practiceLinks = practiceGroups.flatMap(g => g.items);
  // extra tools kept in the mobile menu
  const moreLinks = [
    { path: '/practice', label: 'nav.practice', icon: PenTool },
    { path: '/vocabulary', label: 'nav.vocabulary', icon: BookOpen },
    { path: '/numbers', label: 'nav.numbers', icon: Hash },
    { path: '/achievements', label: 'nav.achievements', icon: Award },
  ];
  const isPracticeActive = practiceLinks.some(l => isActive(l.path));

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: '72px',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display font-extrabold text-2xl text-white tracking-tight">NiHao</span>
          <span className="font-chinese text-xs bg-[#FF3333] text-white rounded-full w-7 h-7 flex items-center justify-center">你好</span>
        </Link>

        {/* Desktop Nav (V2.0.6: includes Pinyin, Essentials + Practice dropdown) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLeft.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-display font-semibold text-base px-3 py-2 rounded-lg transition-colors ${
                isActive(link.path) ? 'text-[#FF3333]' : 'text-[#a0a0a0] hover:text-white'
              }`}
              style={isActive(link.path) ? { borderBottom: '2px solid #FF3333' } : undefined}
            >
              {t(link.label)}
            </Link>
          ))}

          {/* Practice dropdown */}
          <div className="relative">
            <button
              onClick={() => setPracticeOpen(v => !v)}
              className={`font-display font-semibold text-base px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                isPracticeActive || practiceOpen ? 'text-[#FF3333]' : 'text-[#a0a0a0] hover:text-white'
              }`}
              style={isPracticeActive ? { borderBottom: '2px solid #FF3333' } : undefined}
              aria-expanded={practiceOpen}
            >
              {t('nav.practiceMenu')} <ChevronDown size={14} className={`transition-transform ${practiceOpen ? 'rotate-180' : ''}`} />
            </button>
            {practiceOpen && (
              <div className="absolute top-full mt-2 start-0 w-[560px] max-w-[92vw] liquid-glass-strong rounded-2xl p-4 shadow-2xl border border-white/10">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                  {practiceGroups.map(group => (
                    <div key={group.heading}>
                      <p className="px-2 mb-1 text-[11px] font-display font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-tertiary)' }}>{group.heading}</p>
                      {group.items.map(link => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => trackEvent('training_menu_click', { route: link.path })}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] font-display font-semibold transition-colors ${
                            isActive(link.path) ? 'text-[#FF3333] bg-[#FF3333]/10' : 'text-[#c0c0c0] hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <link.icon size={15} className="shrink-0" /> <span className="truncate">{t(link.label)}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
                <Link
                  to="/practice"
                  onClick={() => trackEvent('training_menu_click', { route: '/practice' })}
                  className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-sm font-display font-bold text-[#FF3333] hover:bg-[#FF3333]/5 rounded-lg py-2"
                >
                  <PenTool size={15} /> كل أدوات التدريب
                </Link>
              </div>
            )}
          </div>

          {navRight.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-display font-semibold text-base px-3 py-2 rounded-lg transition-colors ${
                isActive(link.path) ? 'text-[#FF3333]' : 'text-[#a0a0a0] hover:text-white'
              }`}
              style={isActive(link.path) ? { borderBottom: '2px solid #FF3333' } : undefined}
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="hidden sm:flex items-center liquid-glass rounded-lg p-1 gap-1">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-md text-sm font-display font-semibold transition-all ${
                lang === 'en' ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0] hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`px-3 py-1 rounded-md text-sm font-display font-semibold transition-all ${
                lang === 'ar' ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0] hover:text-white'
              }`}
            >
              عربي
            </button>
          </div>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="hidden lg:flex items-center gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`font-display font-semibold text-sm px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                    isActive('/admin') ? 'text-[#FF3333] border-[#FF3333]/50' : 'text-[#a0a0a0] border-white/10 hover:text-white hover:border-[#FF3333]/50'
                  }`}
                >
                  <Settings size={14} /> Admin
                </Link>
              )}
              <Link
                to="/dashboard"
                className={`font-display font-semibold text-sm px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                  isActive('/dashboard') ? 'text-[#FF3333] border-[#FF3333]/50' : 'text-[#a0a0a0] border-white/10 hover:text-white hover:border-[#FF3333]/50'
                }`}
              >
                <LayoutDashboard size={14} /> {user?.fullName || 'Dashboard'}
              </Link>
              <button
                onClick={handleLogout}
                className="font-display font-semibold text-sm text-[#a0a0a0] hover:text-[#FF3333] px-3 py-2 rounded-lg border border-white/10 hover:border-[#FF3333]/30 transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/login"
                className="font-display font-semibold text-sm text-[#a0a0a0] hover:text-white px-4 py-2 rounded-lg border border-white/10 hover:border-[#FF3333]/50 transition-all"
              >
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">
                {t('nav.getstarted')}
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden icon-btn"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden absolute top-[72px] left-4 right-4 p-6 flex flex-col gap-1 rounded-2xl border border-white/10 shadow-2xl max-h-[80vh] overflow-y-auto"
          style={{ animation: 'fadeIn 0.2s ease-out', backgroundColor: '#0A0A0A' }}
          onClick={(e) => { if ((e.target as HTMLElement).closest('a,button')) setMobileOpen(false); }}
        >
          {[...navLeft, ...navRight].map((link, i) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-display font-semibold text-lg py-3 px-4 rounded-lg transition-colors ${
                isActive(link.path) ? 'text-[#FF3333] bg-[#FF3333]/10' : 'text-white hover:bg-white/5'
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {t(link.label)}
            </Link>
          ))}
          <hr className="border-white/10 my-2" />
          <p className="px-4 text-xs font-display font-semibold uppercase" style={{ color: 'var(--color-text-tertiary)' }}>{t('nav.practiceMenu')}</p>
          {practiceGroups.map(group => (
            <div key={group.heading}>
              <p className="px-4 pt-2 text-[11px] font-display font-bold" style={{ color: 'var(--color-text-tertiary)' }}>{group.heading}</p>
              {group.items.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => trackEvent('training_menu_click', { route: link.path })}
                  className="flex items-center gap-3 text-[#c0c0c0] hover:text-white py-2.5 px-4 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <link.icon size={18} />
                  <span className="font-display font-semibold">{t(link.label)}</span>
                </Link>
              ))}
            </div>
          ))}
          <Link to="/practice" onClick={() => trackEvent('training_menu_click', { route: '/practice' })} className="flex items-center gap-3 text-[#FF3333] py-3 px-4 rounded-lg hover:bg-[#FF3333]/5 transition-colors font-display font-bold">
            <PenTool size={18} /> كل أدوات التدريب
          </Link>
          <hr className="border-white/10 my-2" />
          {moreLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3 text-[#c0c0c0] hover:text-white py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
            >
              <link.icon size={18} />
              <span className="font-display font-semibold">{t(link.label)}</span>
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <hr className="border-white/10 my-2" />
              <Link to="/dashboard" className="flex items-center gap-3 text-[#c0c0c0] hover:text-white py-3 px-4 rounded-lg hover:bg-white/5 transition-colors">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/profile" className="flex items-center gap-3 text-[#c0c0c0] hover:text-white py-3 px-4 rounded-lg hover:bg-white/5 transition-colors">
                <User size={18} /> Profile
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-3 text-[#c0c0c0] hover:text-white py-3 px-4 rounded-lg hover:bg-white/5 transition-colors">
                  <Settings size={18} /> Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-3 text-[#FF3333] py-2 px-4 rounded-lg hover:bg-[#FF3333]/10 transition-colors w-full text-left">
                <LogOut size={18} /> Logout
              </button>
            </>
          )}

          <hr className="border-white/10 my-2" />
          <div className="flex sm:hidden items-center gap-2 px-4">
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-lg text-sm font-display font-semibold flex-1 ${
                lang === 'en' ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0] bg-white/5'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`px-4 py-2 rounded-lg text-sm font-display font-semibold flex-1 ${
                lang === 'ar' ? 'bg-[#FF3333] text-white' : 'text-[#a0a0a0] bg-white/5'
              }`}
            >
              عربي
            </button>
          </div>

          {!isAuthenticated && (
            <div className="flex gap-2 mt-2 px-4">
              <Link to="/login" className="btn-secondary flex-1 text-sm py-3 justify-center">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn-primary flex-1 text-sm py-3 justify-center">
                {t('nav.getstarted')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
