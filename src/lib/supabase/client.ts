// src/lib/supabase/client.ts
import { Database } from '@/src/types/database'
import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
  }
  return client
}