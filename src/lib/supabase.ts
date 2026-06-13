import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY');
}

/**
 * Frontend Supabase client.
 *
 * IMPORTANT:
 * We intentionally export this as `any` because the generated Supabase
 * relationship types in this project are incomplete and make TypeScript return:
 * SelectQueryError<"Invalid Relationships cannot infer result type">
 *
 * Runtime row safety is handled by the page-level row interfaces.
 */
export const supabase: any = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Bucket names
export const BUCKETS = {
  lessonImages: 'lesson-images',
  lessonAudio: 'lesson-audio',
  pdfUploads: 'pdf-uploads',
  certificates: 'certificates',
} as const;
