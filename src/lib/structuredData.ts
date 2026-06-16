// V2.5 JSON-LD builders (truthful, visible facts only). Separated from the
// JsonLd component so fast-refresh stays happy.

const DOMAIN = 'https://cnihao.com';

// ---- reusable builders (only truthful, visible facts) ----
export const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NiHao',
  url: DOMAIN,
  description: 'Arabic-friendly Chinese learning platform for beginners and Arab students preparing to study in China.',
  logo: `${DOMAIN}/images/icon-512.png`,
};

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NiHao',
  url: DOMAIN,
  inLanguage: ['ar', 'en'],
  description: 'تعلم الصينية من الصفر بالعربية: البينين، النغمات، الدروس، القاموس، القصص، والدراسة في الصين.',
};

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${DOMAIN}${t.path}`,
    })),
  };
}

export function articleLd(opts: { headline: string; description: string; path: string; dateModified?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    inLanguage: 'ar',
    mainEntityOfPage: `${DOMAIN}${opts.path}`,
    publisher: { '@type': 'Organization', name: 'NiHao', url: DOMAIN },
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  };
}

export function learningResourceLd(opts: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: opts.name,
    description: opts.description,
    inLanguage: 'ar',
    url: `${DOMAIN}${opts.path}`,
    educationalLevel: 'Beginner',
    teaches: 'Mandarin Chinese',
    isAccessibleForFree: true,
    provider: { '@type': 'Organization', name: 'NiHao', url: DOMAIN },
  };
}

// V2.8A — dictionary word page (DefinedTerm in a glossary)
export function definedTermLd(opts: { term: string; definition: string; path: string; pinyin?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: opts.term,
    ...(opts.pinyin ? { alternateName: opts.pinyin } : {}),
    description: opts.definition,
    inDefinedTermSet: `${DOMAIN}/dictionary`,
    url: `${DOMAIN}${opts.path}`,
  };
}

// V3.5 — HSK practice simulation (Quiz). No fake results/ratings; describes the
// free practice test so search engines can surface it for HSK-test queries.
export function quizLd(opts: { name: string; description: string; path: string; numQuestions?: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: opts.name,
    description: opts.description,
    url: `${DOMAIN}${opts.path}`,
    educationalUse: 'Practice',
    isAccessibleForFree: true,
    learningResourceType: 'Practice problem set',
    ...(opts.numQuestions ? { numberOfQuestions: opts.numQuestions } : {}),
    about: { '@type': 'Thing', name: 'HSK Chinese proficiency' },
    provider: { '@type': 'Organization', name: 'NiHao', url: DOMAIN },
  };
}

// V3.5 — HSK tests hub / learning tool (Course-like, free).
export function courseLd(opts: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: opts.name,
    description: opts.description,
    url: `${DOMAIN}${opts.path}`,
    inLanguage: ['ar', 'zh'],
    isAccessibleForFree: true,
    teaches: 'Mandarin Chinese (HSK)',
    provider: { '@type': 'Organization', name: 'NiHao', url: DOMAIN },
  };
}
