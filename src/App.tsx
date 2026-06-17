import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Seo from './components/Seo';
import AnalyticsTracker from './components/AnalyticsTracker';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
const Blog = lazy(() => import('./pages/Blog'));
const Admin = lazy(() => import('./pages/Admin'));
const Worksheet = lazy(() => import('./pages/Worksheet'));
import { Missions, Achievements } from './pages/Missions';
const Stories = lazy(() => import('./pages/Stories').then(m => ({ default: m.Stories })));
const StoryReader = lazy(() => import('./pages/Stories').then(m => ({ default: m.StoryReader })));
const Certificates = lazy(() => import('./pages/Certificates'));
const ArticlePage = lazy(() => import('./pages/Article').then(m => ({ default: m.ArticlePage })));
const WorksheetsIndex = lazy(() => import('./pages/Article').then(m => ({ default: m.WorksheetsIndex })));
const Mistakes = lazy(() => import('./pages/Mistakes'));
const Teacher = lazy(() => import('./pages/Teacher'));
const Present = lazy(() => import('./pages/Present'));
const FlashcardsPrint = lazy(() => import('./pages/TeacherTools').then(m => ({ default: m.FlashcardsPrint })));
const Dictation = lazy(() => import('./pages/TeacherTools').then(m => ({ default: m.Dictation })));
const Hsk1Simulation = lazy(() => import('./pages/Hsk1Simulation'));
const Hsk3Simulation = lazy(() => import('./pages/Hsk3Simulation'));
const Hsk2Simulation = lazy(() => import('./pages/Hsk2Simulation'));
const HskTests = lazy(() => import('./pages/HskTests'));
const AiTeacher = lazy(() => import('./pages/AiTeacher'));
const Hsk3Flashcards = lazy(() => import('./pages/Hsk3Flashcards'));
const Hsk3Worksheet = lazy(() => import('./pages/Hsk3Worksheet'));
const WritingPractice = lazy(() => import('./pages/WritingPractice'));
const Report = lazy(() => import('./pages/Report'));
const StudyInChina = lazy(() => import('./pages/StudyInChina'));
const StudyInChinaArticle = lazy(() => import('./pages/StudyInChina').then(m => ({ default: m.StudyInChinaArticle })));
const Answers = lazy(() => import('./pages/Answers'));
const AnswerPageView = lazy(() => import('./pages/Answers').then(m => ({ default: m.AnswerPageView })));
const BestSite = lazy(() => import('./pages/BestSite'));
const AdminContentDrafts = lazy(() => import('./pages/AdminContentDrafts'));
const AdminDataCenter = lazy(() => import('./pages/AdminDataCenter'));
const AdminStudents = lazy(() => import('./pages/AdminStudents'));
const AdminProgress = lazy(() => import('./pages/AdminProgress'));
const AdminLeads = lazy(() => import('./pages/AdminLeads'));
const AdminQuizResults = lazy(() => import('./pages/AdminQuizResults'));
const DictionaryWord = lazy(() => import('./pages/DictionaryWord'));
const StudentDialogues = lazy(() => import('./pages/StudentDialogues'));
const StudentDialogueView = lazy(() => import('./pages/StudentDialogues').then(m => ({ default: m.StudentDialogueView })));

// Protected route - requires authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Admin route - requires admin role
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Auth redirect - if logged in, redirect to dashboard
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  if (isAuthenticated) {
    // V3.4: return to the route the user was gated from, if any
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from || '/dashboard'} replace />;
  }
  return <>{children}</>;
}

const Quiz = lazy(() => import('./pages/Quiz'));
const Vocabulary = lazy(() => import('./pages/Vocabulary'));
const Pronunciation = lazy(() => import('./pages/Pronunciation'));
const Results = lazy(() => import('./pages/Results'));
const Certificate = lazy(() => import('./pages/Certificate'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const Essentials = lazy(() => import('./pages/Essentials'));
const ToneTrainer = lazy(() => import('./pages/ToneTrainer'));
const NumberTrainer = lazy(() => import('./pages/NumberTrainer'));
const Dialogues = lazy(() => import('./pages/Dialogues'));
const PathMap = lazy(() => import('./pages/PathMap'));
const PlacementTest = lazy(() => import('./pages/PlacementTest'));
const Profile = lazy(() => import('./pages/Profile'));
const Review = lazy(() => import('./pages/Review'));
const Daily = lazy(() => import('./pages/Daily'));
const Pinyin = lazy(() => import('./pages/Pinyin'));

const Courses = lazy(() => import('./pages/Courses'));
const Lesson = lazy(() => import('./pages/Lesson'));
const Practice = lazy(() => import('./pages/Practice'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Dictionary = lazy(() => import('./pages/Dictionary'));

export default function App() {
  return (
    <Layout>
      <Seo />
      <ScrollToTop />
      <AnalyticsTracker />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center" dir="rtl"><div className="text-white font-arabic text-sm flex items-center gap-2"><span className="w-4 h-4 border-2 border-[#FF3333] border-t-transparent rounded-full animate-spin inline-block"></span> جاري التحميل...</div></div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:levelId/:lessonId" element={<Lesson />} />
        <Route path="/quiz/:levelId" element={<Quiz />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/pronunciation" element={<Pronunciation />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/pinyin" element={<Pinyin />} />
        <Route path="/essentials" element={<Essentials />} />
        <Route path="/tones" element={<ToneTrainer />} />
        <Route path="/numbers" element={<NumberTrainer />} />
        <Route path="/dialogues" element={<StudentDialogues />} />
        <Route path="/dialogues/:slug" element={<StudentDialogueView />} />
        <Route path="/dialogues-practice" element={<Dialogues />} />
        <Route path="/path" element={<PathMap />} />
        <Route path="/worksheet/:lessonId" element={<Worksheet />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/placement-test" element={<PlacementTest />} />
        <Route path="/dictionary" element={<Dictionary />} />
        <Route path="/dictionary/:slug" element={<DictionaryWord />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:storyId" element={<StoryReader />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/worksheets" element={<WorksheetsIndex />} />
        <Route path="/blog/:slug" element={<ArticlePage />} />
        <Route path="/mistakes" element={<Mistakes />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/present/:lessonId" element={<Present />} />
        <Route path="/flashcards-print" element={<FlashcardsPrint />} />
        <Route path="/dictation" element={<Dictation />} />
        <Route path="/hsk1-simulation" element={<Hsk1Simulation />} />
        <Route path="/hsk3-simulation" element={<Hsk3Simulation />} />
        <Route path="/hsk2-simulation" element={<Hsk2Simulation />} />
        <Route path="/hsk-tests" element={<HskTests />} />
        <Route path="/ai-teacher" element={<AiTeacher />} />
        <Route path="/flashcards/hsk3" element={<Hsk3Flashcards />} />
        <Route path="/worksheets/hsk3" element={<Hsk3Worksheet />} />
        <Route path="/writing-practice" element={<WritingPractice />} />
        <Route path="/report" element={<Report />} />
        <Route path="/study-in-china" element={<StudyInChina />} />
        <Route path="/study-in-china/:slug" element={<StudyInChinaArticle />} />
        <Route path="/answers" element={<Answers />} />
        <Route path="/answers/:slug" element={<AnswerPageView />} />
        <Route path="/best-chinese-learning-site-arabic" element={<BestSite />} />
        <Route path="/daily" element={<Daily />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQPage />} />

        {/* Auth routes - redirect if already logged in */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

        {/* Protected student routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/review" element={<ProtectedRoute><Review /></ProtectedRoute>} />
        <Route path="/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />

        {/* Admin only */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin/content-drafts" element={<AdminRoute><AdminContentDrafts /></AdminRoute>} />
        <Route path="/admin/data" element={<AdminRoute><AdminDataCenter /></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
        <Route path="/admin/progress" element={<AdminRoute><AdminProgress /></AdminRoute>} />
        <Route path="/admin/leads" element={<AdminRoute><AdminLeads /></AdminRoute>} />
        <Route path="/admin/quiz-results" element={<AdminRoute><AdminQuizResults /></AdminRoute>} />
      </Routes>
      </Suspense>
    </Layout>
  );
}
