import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hwlnvautebbugqjbshlw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bG52YXV0ZWJidWdxamJzaGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzODUyMDIsImV4cCI6MjEwODk2MTIwMn0.X1oT7M8oBVrFwDV6mmjLXTkftfo0izBn6Mz5MXKGAqg';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase URL and anon key must be set in src/lib/supabase.ts before the app can connect.',
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
