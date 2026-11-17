import { createClient } from '@supabase/supabase-js'

const cors = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Cache-Control': 'no-store'
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
	status,
	headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' }
})

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

const readField = (value: unknown, min: number, max: number) => {
	if (typeof value !== 'string') return null
	const text = value.trim()
	return text.length >= min && text.length <= max ? text : null
}

const hashToken = async (token: string) => {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
	return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

const getKey = () => {
	const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
	if (legacy) return legacy
	const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}') as Record<string, string>
	return keys.default || Object.values(keys)[0] || ''
}

const db = createClient(Deno.env.get('SUPABASE_URL')!, getKey(), {
	auth: { persistSession: false, autoRefreshToken: false }
})

Deno.serve(async request => {
	if (request.method === 'OPTIONS') return new Response(null, { headers: cors })
	if (request.method !== 'POST') return json({ error: 'Метод не поддерживается' }, 405)

	try {
		const token = request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_-]{32,128})$/i)?.[1]
		if (!token) return json({ error: 'Войдите в аккаунт' }, 401)

		const { data: session, error: sessionError } = await db.from('shop_sessions')
			.select('user_id')
			.eq('token_hash', await hashToken(token))
			.gt('expires_at', new Date().toISOString())
			.maybeSingle()

		if (sessionError) throw sessionError
		if (!session) return json({ error: 'Сессия истекла. Войдите снова' }, 401)

		const raw = await request.text()
		if (raw.length > 30000) return json({ error: 'Слишком большой запрос' }, 413)
		let body: unknown
		try { body = JSON.parse(raw) } catch { return json({ error: 'Неверный формат запроса' }, 400) }
		if (!isObject(body)) return json({ error: 'Неверный формат запроса' }, 400)

		if (body.action === 'list') {
			const page = body.page === undefined ? 0 : body.page
			if (typeof page !== 'number' || !Number.isInteger(page) || page < 0 || page > 10000) {
				return json({ error: 'Неверная страница' }, 400)
			}
			const offset = page * 20
			const { data, error } = await db.from('shop_orders')
				.select('id, order_number, status, total, payment_method, created_at, city, address, shop_order_items(id, product_name, image_url, unit_price, quantity, line_total)')
				.eq('user_id', session.user_id)
				.order('created_at', { ascending: false })
				.order('id', { ascending: false })
				.range(offset, offset + 20)

			if (error) throw error
			return json({ orders: data.slice(0, 20), hasMore: data.length > 20 })
		}

		if (body.action !== 'create') return json({ error: 'Неизвестное действие' }, 400)
		if (!isObject(body.details) || typeof body.request_id !== 'string' || !uuid.test(body.request_id)) {
			return json({ error: 'Неверные данные заказа' }, 400)
		}

		const full_name = readField(body.details.full_name, 3, 150)
		const phone = readField(body.details.phone, 7, 30)
		const email = readField(body.details.email, 3, 254)
		const city = readField(body.details.city, 2, 100)
		const address = readField(body.details.address, 3, 300)
		const comment = readField(body.details.comment ?? '', 0, 1000)
		const payment_method = body.details.payment_method

		if (!full_name || !phone || !email || !city || !address || comment === null ||
			!/^\+?[\d\s().-]+$/.test(phone) || !/^\d{7,15}$/.test(phone.replace(/\D/g, '')) ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
			(payment_method !== 'card_on_delivery' && payment_method !== 'cash_on_delivery')) {
			return json({ error: 'Проверьте контактные данные и способ оплаты' }, 400)
		}

		if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 100 ||
			typeof body.expected_total_cents !== 'number' || !Number.isSafeInteger(body.expected_total_cents) ||
			body.expected_total_cents < 0 || body.expected_total_cents > 99999999999999) {
			return json({ error: 'Проверьте состав и сумму заказа' }, 400)
		}

		const items: { id: string; quantity: number }[] = []
		const seen = new Set<string>()
		for (const item of body.items) {
			if (!isObject(item) || typeof item.id !== 'string' || !uuid.test(item.id) ||
				typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
				return json({ error: 'Некорректное количество или товар' }, 400)
			}
			const id = item.id.toLowerCase()
			if (seen.has(id)) return json({ error: 'Товар повторяется в заказе' }, 400)
			seen.add(id)
			items.push({ id, quantity: item.quantity })
		}

		const { data, error } = await db.rpc('shop_create_order', {
			p_user_id: session.user_id,
			p_request_id: body.request_id,
			p_details: { full_name, phone, email, city, address, comment, payment_method },
			p_items: items,
			p_expected_total: (body.expected_total_cents / 100).toFixed(2)
		})

		if (error) {
			if (error.message === 'PRODUCT_UNAVAILABLE') return json({ error: 'Некоторые товары больше недоступны. Проверьте корзину', code: 'PRODUCT_UNAVAILABLE' }, 409)
			if (error.message === 'PRICE_CHANGED') return json({ error: 'Цена товара изменилась. Проверьте новую сумму', code: 'PRICE_CHANGED' }, 409)
			if (error.message === 'INVALID_ITEMS') return json({ error: 'Некорректный состав заказа' }, 400)
			throw error
		}
		return json({ order: data }, 201)
	} catch (error) {
		console.error('shop-orders:', isObject(error) ? error.code ?? error.name ?? 'internal' : 'internal')
		return json({ error: 'Не удалось обработать запрос. Попробуйте снова' }, 500)
	}
})
