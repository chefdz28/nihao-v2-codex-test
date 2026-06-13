import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useI18n } from '@/i18n';
import { blogPosts } from '@/data/courses';
import { Link } from 'react-router-dom';
import { articles } from '@/data/articles';
import { seoSprint1All } from '@/data/seoSprint1b';

export default function Blog() {
  useI18n(); // Initialize i18n context
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(blogPosts.map(p => p.category)))];
  const filtered = activeCategory === 'All' ? blogPosts : blogPosts.filter(p => p.category === activeCategory);

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-6">
        <div className="absolute inset-0 z-0">
          <img src="/images/blog-hero.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/80 to-[#0a0a0a]" />
        </div>
        <div className="max-w-[800px] mx-auto text-center relative z-10">
          <motion.h1
            className="font-display font-black text-white mb-4"
            style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 0.9 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Learning Blog
          </motion.h1>
          <motion.p className="text-lg" style={{ color: 'var(--color-text-secondary)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            Tips, guides, and insights for learning Chinese
          </motion.p>
        </div>
      </section>

      {/* V2.2: Arabic learning articles (SEO) */}
      <section className="py-12 px-6">
        <div className="max-w-[1100px] mx-auto">
          <Link to="/study-in-china" className="block liquid-glass p-5 rounded-2xl border border-[#FF3333]/25 mb-6 hover:border-[#FF3333]/50 transition-colors" dir="rtl">
            <span className="text-3xl">🎓</span>
            <h3 className="text-lg font-bold text-white font-arabic mt-2">دليل الدراسة في الصين للطلاب العرب</h3>
            <p className="text-xs font-arabic" style={{ color: 'var(--color-text-secondary)' }}>كل ما تحتاجه: القبول، التكاليف، المنح، التأشيرة، المدن، وتعلم الصينية قبل السفر.</p>
          </Link>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" dir="rtl">
            <Link to="/answers" className="liquid-glass p-4 rounded-2xl border border-transparent hover:border-[#FF3333]/30 transition-colors">
              <span className="text-2xl">❓</span>
              <h3 className="text-sm font-bold text-white font-arabic mt-1">أسئلة وأجوبة سريعة</h3>
              <p className="text-xs font-arabic" style={{ color: 'var(--color-text-secondary)' }}>إجابات مباشرة عن تعلم الصينية والدراسة في الصين.</p>
            </Link>
            <Link to="/best-chinese-learning-site-arabic" className="liquid-glass p-4 rounded-2xl border border-transparent hover:border-[#FF3333]/30 transition-colors">
              <span className="text-2xl">🏆</span>
              <h3 className="text-sm font-bold text-white font-arabic mt-1">كيف تختار أفضل موقع؟</h3>
              <p className="text-xs font-arabic" style={{ color: 'var(--color-text-secondary)' }}>معايير اختيار منصة تعلم الصينية للمبتدئ العربي.</p>
            </Link>
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-4 font-arabic" dir="rtl">أدلة الدراسة في الصين وتعلم الصينية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10" dir="rtl">
            {seoSprint1All.map(a => (
              <Link key={a.slug} to={`/blog/${a.slug}`} className="liquid-glass p-5 rounded-2xl border border-transparent hover:border-[#FF3333]/30 transition-colors">
                <span className="text-3xl block mb-3">{a.emoji}</span>
                <h3 className="text-sm font-bold text-white font-arabic leading-snug mb-2">{a.title}</h3>
                <p className="text-xs font-arabic leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{a.meta}</p>
              </Link>
            ))}
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-6 font-arabic" dir="rtl">مقالات تعلم الصينية بالعربية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
            {articles.map(a => (
              <Link key={a.slug} to={`/blog/${a.slug}`} className="liquid-glass p-5 rounded-2xl border border-transparent hover:border-[#FF3333]/30 transition-colors">
                <span className="text-3xl block mb-3">{a.emoji}</span>
                <h3 className="text-sm font-bold text-white font-arabic leading-snug mb-2">{a.title}</h3>
                <p className="text-xs font-arabic leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{a.meta}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-display font-semibold transition-all ${
                activeCategory === cat ? 'bg-[#FF3333] text-white' : 'liquid-glass text-[#a0a0a0] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.article
              key={post.id}
              className="liquid-glass overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className="relative h-[200px] overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#FF3333] text-white text-xs font-display font-bold">
                  {post.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-white mb-2 line-clamp-2 group-hover:text-[#FF3333] transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  <span>{post.author}</span>
                  <div className="flex items-center gap-3">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{post.readTime}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
