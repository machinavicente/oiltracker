import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jgfbuowjbescheraaqcd.supabase.co'
const supabaseKey = 'sb_publishable_2h5a9m24HxmqFblEKD7JXg_jnwmoAr1'

export const supabase = createClient(supabaseUrl, supabaseKey)

export function useSupabase() {
  return supabase
}