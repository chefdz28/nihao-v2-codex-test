import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Seo from './components/Seo';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import Vocabulary from './pages/Vocabulary';
import Practice from './pages/Practice';
import Pronunciation from './pages/Pronunciation';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Results from './pages/Results';
import Certificate from './pages/Certificate';
import About from './pages/About';
const Blog = lazy(() => import('./pages/Blog'));
import Contact from './pages/Contact';
import FAQPage from './pages/FAQPage';
const Admin = lazy(() => import('./pages/Admin'));
import Flashcards from './pages/Flashcards';
import Pinyin from './pages/Pinyin';
import Essentials from './pages/Essentials';
import ToneTrainer from './pages/ToneTrainer';
import NumberTrainer from './pages/NumberTrainer';
import Dialogues from './pages/Dialogues';
import PathMap from './pages/PathMap';
const Worksheet = lazy(() => import('./pages/Worksheet'));
import { Missions, Achievements } from './pages/Missions';
import PlacementTest from './pages/PlacementTest';
import Dictionary from './pages/Dictionary';
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
const Report = lazy(() => import('./pages/Report'));
const StudyInChina = lazy(() => import('./pages/StudyInChina'));
const StudyInChinaArticle = lazy(() => import('./pages/StudyInChina').then(m => ({ default: m.StudyInChinaArticle })));
const Answers = lazy(() => import('./pages/Answers'));
const AnswerPageView = lazy(() => import('./pages/Answers').then(m => ({ default: m.AnswerPageView })));
const BestSite = lazy(() => import('./pages/BestSite'));
const AdminContentDrafts = lazy(() => import('./pages/AdminContentDrafts'));
import Daily from './pages/Daily';
import Review from './pages/Review';

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
  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Layout>
      <Seo />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">...</div></div>}>
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
        <Route path="/dialogues" element={<Dialogues />} />
        <Route path="/path" element={<PathMap />} />
        <Route path="/worksheet/:lessonId" element={<Worksheet />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/placement-test" element={<PlacementTest />} />
        <Route path="/dictionary" element={<Dictionary />} />
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
      </Routes>
      </Suspense>
    </Layout>
  );
}
