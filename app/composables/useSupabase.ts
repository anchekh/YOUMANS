import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

export const useSupabase = () => {
	if (!import.meta.client) {
		throw new Error('Supabase используется только в браузере')
	}

	if (supabase) return supabase

	const config = useRuntimeConfig()

	const url = config.public.supabaseUrl
	const key = config.public.supabaseKey

	if (typeof url !== 'string' || typeof key !== 'string' || !url || !key) {
		throw new Error('Supabase URL или API key не указаны')
	}

	supabase = createClient(url, key)

	return supabase
}