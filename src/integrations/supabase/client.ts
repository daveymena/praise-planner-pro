// This file is kept for future use with PostgreSQL/Backend API
// Currently the app uses mock data, but this can be adapted for direct PostgreSQL connection
// when a backend API is implemented

<<<<<<< HEAD
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
// NOTE: This client is disabled. Use apiClient from @/lib/api instead.
=======
// For now, we'll use a placeholder that won't cause errors
// Future: Replace with actual API client when backend is ready

// Example future implementation:
// import axios from 'axios';
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
// export const apiClient = axios.create({ baseURL: API_URL });
>>>>>>> 547bf4b29666d8a4068b92295cae21fc2f742582

// Placeholder export to prevent import errors
export const supabase = null as any;