<script setup lang="ts">
import type { OrderDetails, OrderSummary } from '~/types/order'
import { formatOrderPrice } from '~/types/order'

const { cart, initialize: initializeShop, removeFromCart, setQuantity } = useShop()
const { user, initialize: initializeAuth } = useShopAuth()
const { createOrder } = useShopOrders()
const supabase = useSupabase()
const logoBase = useRuntimeConfig().app.baseURL

const details = reactive<OrderDetails>({
	full_name: '',
	phone: '',
	email: '',
	city: '',
	address: '',
	comment: '',
	payment_method: 'card_on_delivery'
})

type CheckoutProduct = {
	id: string
	name: string
	price: number
	image_url: string | null
}

const products = ref<CheckoutProduct[]>([])
const checking = ref(true)
const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const loadError = ref('')
const completed = ref<OrderSummary | null>(null)
const accountLink = computed(() => user.value?.role === 'admin' ? '/store/admin' : '/store/account')
const rows = computed(() => cart.value.flatMap(item => {
	const product = products.value.find(product => product.id === item.id)
	return product ? [{ ...product, quantity: item.quantity }] : []
}))
const unavailable = computed(() => cart.value.length > 0 && rows.value.length !== cart.value.length)
const validCart = computed(() => cart.value.length > 0 && cart.value.length <= 100 && !unavailable.value &&
	new Set(cart.value.map(item => item.id)).size === cart.value.length &&
	rows.value.every(item => Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99 && Number.isFinite(Number(item.price)) && Number(item.price) >= 0))
const totalCents = computed(() => rows.value.reduce((sum, product) => sum + Math.round(Number(product.price) * 100) * product.quantity, 0))

const loadProducts = async () => {
	loading.value = true
	loadError.value = ''
	try {
		const ids = cart.value.map(item => item.id)
		if (!ids.length) {
			products.value = []
			return
		}
		if (ids.length > 100) throw new Error('В одном заказе может быть не более 100 разных товаров')
		const { data, error } = await supabase
			.from('products')
			.select('id, name, price, image_url')
			.in('id', ids)
			.eq('active', true)
		if (error) throw error
		products.value = data ?? []
	} catch {
		loadError.value = 'Не удалось загрузить корзину. Обновите страницу или вернитесь в корзину.'
	} finally {
		loading.value = false
	}
}

const requestKey = async (payload: object) => {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)))
	return 'youmans-order-' + Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

let lastKey = ''
let lastId = ''

const submitOrder = async () => {
	if (submitting.value || loading.value || completed.value || !user.value || !validCart.value || loadError.value) return
	submitting.value = true
	errorMessage.value = ''
	try {
		const items = cart.value.map(item => ({ id: item.id, quantity: item.quantity })).sort((a, b) => a.id.localeCompare(b.id))
		const orderDetails = { ...details }
		const expected = totalCents.value
		const key = await requestKey({ user: user.value.id, details: orderDetails, items })
		let requestId = key === lastKey ? lastId : ''
		try { requestId = sessionStorage.getItem(key) || requestId } catch {}
		if (!requestId) requestId = crypto.randomUUID()
		lastKey = key
		lastId = requestId
		try { sessionStorage.setItem(key, requestId) } catch {}

		const { order } = await createOrder(orderDetails, items, expected, requestId)
		completed.value = order
		for (const item of items) {
			const current = cart.value.find(row => row.id === item.id)
			if (!current) continue
			const remaining = current.quantity - item.quantity
			if (remaining > 0) setQuantity(item.id, remaining)
			else removeFromCart(item.id)
		}
		try { sessionStorage.removeItem(key) } catch {}
	} catch (error) {
		errorMessage.value = error instanceof Error ? error.message : 'Не удалось оформить заказ'
		const code = (error as { code?: string } | null)?.code
		if (code === 'PRICE_CHANGED' || code === 'PRODUCT_UNAVAILABLE') await loadProducts()
	} finally {
		submitting.value = false
	}
}

const imageSrc = (url: string | null) => url || `${logoBase}images/logo.png`

onMounted(async () => {
	try {
		await initializeShop()
		await initializeAuth()
		if (user.value) await loadProducts()
	} catch {
		loadError.value = 'Не удалось проверить аккаунт или корзину. Обновите страницу.'
	} finally {
		checking.value = false
	}
})
</script>

<template>
	<div class="page">
		<AppHeader />
		<main class="checkout">
			<p v-if="checking" class="message">Загрузка оформления...</p>
			<section v-else-if="completed" class="success">
				<div class="success-icon" aria-hidden="true">✓</div>
				<h1>Заказ оформлен</h1>
				<p>Заказ №{{ completed.order_number }} на сумму {{ formatOrderPrice(completed.total) }} принят.</p>
				<NuxtLink :to="accountLink" class="primary-button">Мои заказы</NuxtLink>
				<NuxtLink to="/store/catalog" class="back-link">Продолжить покупки</NuxtLink>
			</section>
			<section v-else-if="!user" class="message">
				<h1>Оформление заказа</h1>
				<p>Войдите в аккаунт, чтобы оформить заказ и отслеживать его статус.</p>
				<p v-if="loadError" role="alert">{{ loadError }}</p>
				<NuxtLink to="/store/login" class="primary-button">Войти</NuxtLink>
				<NuxtLink to="/store/cart" class="back-link">Вернуться в корзину</NuxtLink>
			</section>
			<section v-else-if="!cart.length" class="message">
				<h1>Корзина пуста</h1>
				<NuxtLink to="/store/catalog" class="primary-button">Перейти в каталог</NuxtLink>
			</section>
			<template v-else>
				<NuxtLink to="/store/cart" class="back-link">← Вернуться в корзину</NuxtLink>
				<h1>Оформление заказа</h1>
				<form class="checkout-grid" @submit.prevent="submitOrder">
					<div class="form-column">
						<fieldset class="section" :disabled="submitting">
							<legend>Контактные данные</legend>
							<div class="fields">
								<label class="field full">ФИО
									<input v-model.trim="details.full_name" autocomplete="name" placeholder="Иванов Иван Иванович" minlength="3" maxlength="150" required />
								</label>
								<label class="field">Телефон
									<input v-model.trim="details.phone" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" minlength="7" maxlength="30" required />
								</label>
								<label class="field">Электронная почта
									<input v-model.trim="details.email" type="email" autocomplete="email" placeholder="mail@example.ru" maxlength="254" required />
								</label>
							</div>
						</fieldset>
						<fieldset class="section" :disabled="submitting">
							<legend>Доставка</legend>
							<div class="fields">
								<label class="field full">Город
									<input v-model.trim="details.city" autocomplete="address-level2" placeholder="Владивосток" minlength="2" maxlength="100" required />
								</label>
								<label class="field full">Адрес доставки
									<input v-model.trim="details.address" autocomplete="street-address" placeholder="Улица, дом, квартира или офис" minlength="3" maxlength="300" required />
								</label>
								<label class="field full">Комментарий к заказу (необязательно)
									<textarea v-model.trim="details.comment" rows="4" maxlength="1000" placeholder="Дополнительная информация для доставки" />
								</label>
							</div>
						</fieldset>
						<fieldset class="section" :disabled="submitting">
							<legend>Способ оплаты</legend>
							<label class="payment-option" :class="{ selected: details.payment_method === 'card_on_delivery' }">
								<input v-model="details.payment_method" type="radio" name="payment" value="card_on_delivery" />
								<span>Картой при получении</span>
							</label>
							<label class="payment-option" :class="{ selected: details.payment_method === 'cash_on_delivery' }">
								<input v-model="details.payment_method" type="radio" name="payment" value="cash_on_delivery" />
								<span>Наличными при получении</span>
							</label>
						</fieldset>
					</div>
					<aside class="summary">
						<h2>Ваш заказ</h2>
						<p v-if="loading">Обновляем товары...</p>
						<div v-else class="summary-items">
							<div v-for="item in rows" :key="item.id" class="summary-item">
								<img :src="imageSrc(item.image_url)" alt="" />
								<div class="item-name">
									<strong>{{ item.name }}</strong>
									<span>{{ item.quantity }} шт. × {{ formatOrderPrice(item.price) }}</span>
								</div>
								<strong>{{ formatOrderPrice(Math.round(Number(item.price) * 100) * item.quantity / 100) }}</strong>
							</div>
						</div>
						<div class="summary-total"><span>Сумма товаров</span><strong>{{ formatOrderPrice(totalCents / 100) }}</strong></div>
						<p class="note">Оплата при получении. Стоимость доставки пока не рассчитывается.</p>
						<p v-if="loadError" class="error" role="alert">{{ loadError }}</p>
						<p v-else-if="!loading && !validCart" class="error" role="alert">Проверьте наличие и количество товаров в корзине (до 99 шт. каждого товара).</p>
						<p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
						<button class="primary-button" type="submit" :disabled="submitting || loading || !validCart || !!loadError">
							{{ submitting ? 'Оформляем...' : 'Подтвердить заказ' }}
						</button>
					</aside>
				</form>
			</template>
		</main>
		<AppFooter />
	</div>
</template>

<style scoped>
.page { min-height: 100vh; display: flex; flex-direction: column; }
.checkout { flex: 1; width: 100%; max-width: 1240px; padding: 40px 20px 80px; margin: 0 auto; box-sizing: border-box; }
h1 { margin: 18px 0 32px; font-size: clamp(28px, 4vw, 40px); line-height: 1.2; }
h2 { margin: 0 0 20px; font-size: 22px; }
.back-link { display: inline-block; color: #777; text-decoration: none; font-size: 14px; }
.back-link:hover { color: #D71920; }
.checkout-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 380px); align-items: start; gap: 32px; }
.form-column { display: flex; flex-direction: column; gap: 28px; min-width: 0; }
.section { min-width: 0; margin: 0; padding: 20px; border: 1px solid #eee; border-radius: 14px; }
.section legend { padding: 0 8px; font-size: 20px; font-weight: 700; }
.fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; min-width: 0; font-size: 14px; font-weight: 600; }
.field.full { grid-column: 1 / -1; }
.field input, .field textarea { box-sizing: border-box; width: 100%; border: 1px solid #ddd; border-radius: 10px; padding: 12px 14px; min-height: 48px; font: inherit; font-weight: 400; background: #fff; color: #222; }
.field textarea { resize: vertical; }
.field input:focus, .field textarea:focus { border-color: #D71920; outline: 1px solid #D71920; }
.payment-option { display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 12px; border: 1px solid #eee; border-radius: 10px; box-sizing: border-box; cursor: pointer; }
.payment-option + .payment-option { margin-top: 12px; }
.payment-option.selected { border-color: #D71920; }
.payment-option input { accent-color: #D71920; width: 18px; height: 18px; flex-shrink: 0; }
.summary { border: 1px solid #eee; border-radius: 14px; padding: 24px; min-width: 0; }
.summary-items { display: flex; flex-direction: column; gap: 18px; }
.summary-item { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 10px; font-size: 14px; }
.summary-item img { width: 48px; height: 48px; object-fit: contain; background: #fafafa; border-radius: 8px; }
.item-name { display: flex; flex-direction: column; gap: 5px; overflow-wrap: anywhere; }
.item-name span { color: #777; font-size: 12px; }
.summary-total { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; border-top: 1px solid #eee; margin-top: 24px; padding-top: 20px; font-size: 16px; }
.summary-total strong { font-size: 22px; text-align: right; }
.note { color: #777; font-size: 13px; line-height: 1.6; }
.error { color: #D71920; font-size: 14px; line-height: 1.5; }
.primary-button { display: inline-flex; justify-content: center; align-items: center; box-sizing: border-box; min-height: 52px; padding: 12px 24px; border: 0; border-radius: 12px; background: #D71920; color: #fff; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; }
.primary-button:hover:not(:disabled) { background: #b9152b; }
.primary-button:disabled { opacity: .5; cursor: not-allowed; }
.summary .primary-button { width: 100%; margin-top: 10px; }
.message, .success { text-align: center; padding: 60px 0; }
.message p, .success p { color: #777; line-height: 1.6; }
.message .back-link, .success .back-link { display: block; margin-top: 20px; }
.success-icon { display: grid; place-items: center; margin: 0 auto; width: 70px; height: 70px; background: #fff0f0; color: #D71920; border-radius: 50%; font-size: 36px; }
@media (max-width: 900px) {
	.checkout-grid { grid-template-columns: 1fr; gap: 28px; }
}
@media (max-width: 550px) {
	.checkout { padding: 28px 16px 50px; }
	.fields { grid-template-columns: 1fr; }
	.section, .summary { padding: 16px; }
	.summary-item { grid-template-columns: 44px minmax(0, 1fr); }
	.summary-item > strong { grid-column: 2; }
}
</style>
