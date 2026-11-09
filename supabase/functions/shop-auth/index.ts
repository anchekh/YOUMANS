import { createClient } from '@supabase/supabase-js'
import { hash, compare } from 'bcryptjs'

const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS')
const secretKey = secretKeys
	? JSON.parse(secretKeys).default
	: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabaseUrl = Deno.env.get('SUPABASE_URL')

if (!supabaseUrl || !secretKey) {
	throw new Error('Supabase configuration is missing')
}

const db = createClient(supabaseUrl, secretKey, {
	auth: {
		persistSession: false,
		autoRefreshToken: false
	}
})

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'content-type, apikey, authorization',
	'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const json = (data: unknown, status = 200) => {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			...corsHeaders,
			'Content-Type': 'application/json'
		}
	})
}

const sha256 = async (value: string) => {
	const bytes = new TextEncoder().encode(value)
	const digest = await crypto.subtle.digest('SHA-256', bytes)

	return Array.from(new Uint8Array(digest))
		.map(byte => byte.toString(16).padStart(2, '0'))
		.join('')
}

const createToken = () => {
	const bytes = crypto.getRandomValues(new Uint8Array(32))

	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '')
}

const createSession = async (userId: string) => {
	const token = createToken()
	const tokenHash = await sha256(token)

	const expiresAt = new Date(
		Date.now() + 7 * 24 * 60 * 60 * 1000
	).toISOString()

	const { error } = await db.from('shop_sessions').insert({
		token_hash: tokenHash,
		user_id: userId,
		expires_at: expiresAt
	})

	if (error) throw error

	return token
}

const isAllowed = async (
	key: string,
	max: number,
	windowSeconds: number
) => {
	const { data, error } = await db.rpc('shop_hit_auth_limit', {
		p_key: key,
		p_max: max,
		p_window_seconds: windowSeconds
	})

	if (error) throw error

	return data === true
}

const getUserByToken = async (token: string) => {
	if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null

	const tokenHash = await sha256(token)

	const { data: session, error: sessionError } = await db
		.from('shop_sessions')
		.select('user_id')
		.eq('token_hash', tokenHash)
		.gt('expires_at', new Date().toISOString())
		.maybeSingle()

	if (sessionError) throw sessionError
	if (!session) return null

	const { data: user, error: userError } = await db
		.from('shop_users')
		.select('id, username, role')
		.eq('id', session.user_id)
		.maybeSingle()

	if (userError) throw userError

	return user
}

Deno.serve(async request => {
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: corsHeaders
		})
	}

	if (request.method !== 'POST') {
		return json({ error: 'Метод не поддерживается' }, 405)
	}

	try {
		const body = await request.json().catch(() => null)

		if (!body || typeof body !== 'object') {
			return json({ error: 'Некорректный запрос' }, 400)
		}

		const action = body.action

		if (action === 'register' || action === 'login') {
			const username = typeof body.username === 'string'
				? body.username.trim().toLowerCase()
				: ''

			const password = typeof body.password === 'string'
				? body.password
				: ''

			if (!/^[a-z0-9_]{3,24}$/.test(username)) {
				return json({ error: 'Некорректный логин' }, 400)
			}

			if (action === 'register') {
				const passwordLength = new TextEncoder()
					.encode(password).length

				if (passwordLength < 8 || passwordLength > 72) {
					return json({
						error: 'Пароль должен содержать от 8 до 72 байт'
					}, 400)
				}

				const allowed = await isAllowed(
					`register:${username}`,
					3,
					3600
				)

				if (!allowed) {
					return json({
						error: 'Слишком много попыток регистрации'
					}, 429)
				}

				const passwordHash = await hash(password, 12)

				const { data: user, error } = await db
					.from('shop_users')
					.insert({
						username,
						password_hash: passwordHash,
						role: 'user'
					})
					.select('id, username, role')
					.single()

				if (error?.code === '23505') {
					return json({ error: 'Логин уже занят' }, 409)
				}

				if (error) throw error

				const token = await createSession(user.id)

				return json({ user, token }, 201)
			}

			const allowed = await isAllowed(
				`login:${username}`,
				10,
				900
			)

			if (!allowed) {
				return json({
					error: 'Слишком много попыток входа. Попробуйте позже'
				}, 429)
			}

			const { data: user, error } = await db
				.from('shop_users')
				.select('id, username, role, password_hash')
				.eq('username', username)
				.maybeSingle()

			if (error) throw error

			const validPassword = user
				? await compare(password, user.password_hash)
				: false

			if (!user || !validPassword) {
				return json({
					error: 'Неверный логин или пароль'
				}, 401)
			}

			const token = await createSession(user.id)

			return json({
				user: {
					id: user.id,
					username: user.username,
					role: user.role
				},
				token
			})
		}

		if (action === 'me') {
			const token = typeof body.token === 'string'
				? body.token
				: ''

			const user = await getUserByToken(token)

			if (!user) {
				return json({ error: 'Сессия недействительна' }, 401)
			}

			return json({ user })
		}

		if (action === 'logout') {
			const token = typeof body.token === 'string'
				? body.token
				: ''

			if (/^[A-Za-z0-9_-]{43}$/.test(token)) {
				const tokenHash = await sha256(token)

				const { error } = await db
					.from('shop_sessions')
					.delete()
					.eq('token_hash', tokenHash)

				if (error) throw error
			}

			return json({ success: true })
		}

		return json({ error: 'Неизвестное действие' }, 400)
	} catch (error) {
		console.error('Shop auth error:', error)

		return json({
			error: 'Внутренняя ошибка сервера'
		}, 500)
	}
})