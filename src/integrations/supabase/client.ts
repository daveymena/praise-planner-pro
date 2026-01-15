// This file is kept for future use with PostgreSQL/Backend API
// Currently the app uses mock data, but this can be adapted for direct PostgreSQL connection
// when a backend API is implemented

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
// NOTE: This client is disabled. Use apiClient from @/lib/api instead.

// Placeholder export to prevent import errors
export const supabase = null as any;