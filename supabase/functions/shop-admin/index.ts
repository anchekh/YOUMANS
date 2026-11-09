import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS')

const serviceKey = (
	secretKeys ? JSON.parse(secretKeys).default : null
) ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !serviceKey) {
	throw new Error('Supabase configuration is missing')
}

const db = createClient(supabaseUrl, serviceKey, {
	auth: {
		persistSession: false,
		autoRefreshToken: false
	}
})

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, content-type',
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

const getAdmin = async (request: Request) => {
	const authorization = request.headers.get('Authorization') ?? ''
	const match = authorization.match(/^Bearer ([A-Za-z0-9_-]{43})$/)

	if (!match) return null

	const tokenHash = await sha256(match[1])

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
		.select('id, role')
		.eq('id', session.user_id)
		.maybeSingle()

	if (userError) throw userError

	return user
}

const getImageType = async (file: File) => {
	const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())

	if (
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47 &&
		bytes[4] === 0x0d &&
		bytes[5] === 0x0a &&
		bytes[6] === 0x1a &&
		bytes[7] === 0x0a
	) {
		return { extension: 'png', contentType: 'image/png' }
	}

	if (
		bytes[0] === 0xff &&
		bytes[1] === 0xd8 &&
		bytes[2] === 0xff
	) {
		return { extension: 'jpg', contentType: 'image/jpeg' }
	}

	if (
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46 &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	) {
		return { extension: 'webp', contentType: 'image/webp' }
	}

	return null
}


const translit: Record<string, string> = {
	а: 'a', б: 'b', в: 'v', г: 'g', д: 'd',
	е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
	й: 'y', к: 'k', л: 'l', м: 'm', н: 'n',
	о: 'o', п: 'p', р: 'r', с: 's', т: 't',
	у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch',
	ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '',
	э: 'e', ю: 'yu', я: 'ya'
}

const createProductSlug = (name: string) => {
	const base = [...name.toLowerCase()]
		.map(char => translit[char] ?? char)
		.join('')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 40)
		.replace(/-+$/g, '') || 'product'

	const suffix = crypto.randomUUID().replaceAll('-', '')

	return `${base}-${suffix}`
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
		const user = await getAdmin(request)

		if (!user) {
			return json({ error: 'Необходима авторизация' }, 401)
		}

		if (user.role !== 'admin') {
			return json({ error: 'Недостаточно прав' }, 403)
		}

		const contentLength = Number(request.headers.get('content-length'))

		if (contentLength > 6 * 1024 * 1024) {
			return json({ error: 'Слишком большой запрос' }, 413)
		}

		let form: FormData

		try {
			form = await request.formData()
		} catch {
			return json({ error: 'Некорректные данные формы' }, 400)
		}

		const name = String(form.get('name') ?? '').trim()
		const description = String(form.get('description') ?? '').trim()
		const priceValue = String(form.get('price') ?? '').trim()
		const categoryId = String(form.get('category_id') ?? '').trim()
		const price = Number(priceValue)

		const isNew = form.get('is_new') === 'true'
		const isPopular = form.get('is_popular') === 'true'
		const active = form.get('active') === 'true'

		if (name.length < 2 || name.length > 120) {
			return json({ error: 'Название должно содержать от 2 до 120 символов' }, 400)
		}

		const slug = createProductSlug(name)

		if (description.length > 3000) {
			return json({ error: 'Описание слишком длинное' }, 400)
		}

		if (
			!/^\d{1,8}(\.\d{1,2})?$/.test(priceValue) ||
			!Number.isFinite(price) ||
			price <= 0
		) {
			return json({ error: 'Некорректная цена' }, 400)
		}

		if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(categoryId)) {
			return json({ error: 'Выберите категорию товара' }, 400)
		}

		const { data: category, error: categoryError } = await db
			.from('product_categories')
			.select('id')
			.eq('id', categoryId)
			.maybeSingle()

		if (categoryError) throw categoryError

		if (!category) {
			return json({ error: 'Категория не найдена' }, 400)
		}

		const image = form.get('image')

		if (image !== null && !(image instanceof File)) {
			return json({ error: 'Некорректный файл' }, 400)
		}

		let imageUrl: string | null = null
		let storagePath: string | null = null

		if (image instanceof File) {
			if (image.size === 0 || image.size > 5 * 1024 * 1024) {
				return json({ error: 'Размер изображения должен быть до 5 МБ' }, 400)
			}

			const imageType = await getImageType(image)

			if (!imageType) {
				return json({ error: 'Допускаются только JPG, PNG и WebP' }, 400)
			}

			storagePath = `catalog/${crypto.randomUUID()}.${imageType.extension}`

			const { error: uploadError } = await db.storage
				.from('products')
				.upload(storagePath, image, {
					contentType: imageType.contentType,
					upsert: false
				})

			if (uploadError) throw uploadError

			imageUrl = db.storage
				.from('products')
				.getPublicUrl(storagePath)
				.data.publicUrl
		}

		const { data: product, error: insertError } = await db
			.from('products')
			.insert({
				name,
				slug,
				description: description || null,
				price,
				category_id: categoryId,
				image_url: imageUrl,
				is_new: isNew,
				is_popular: isPopular,
				active
			})
			.select('id, name, slug')
			.single()

		if (insertError) {
			if (storagePath) {
				await db.storage.from('products').remove([storagePath])
			}

			if (insertError.code === '23505') {
				return json({ error: 'Товар с таким slug уже существует' }, 409)
			}

			throw insertError
		}

		return json({ success: true, product }, 201)
	} catch (error) {
		console.error('Shop admin error:', error)

		return json({
			error: 'Не удалось сохранить товар'
		}, 500)
	}
})
