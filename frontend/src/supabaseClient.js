// Frontend talks to Supabase directly for CRUD/auth.
// These are PUBLIC keys (safe in the browser). The Gemini key is NOT here.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, anonKey)
