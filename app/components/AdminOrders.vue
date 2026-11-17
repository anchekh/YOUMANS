<script setup lang="ts">
import type { ShopOrder, OrderStatus } from '~/types/order'
import { orderStatusLabels, paymentMethodLabels, formatOrderPrice } from '~/types/order'

type AdminOrder = ShopOrder & {
	full_name: string
	phone: string
	email: string
	comment: string
}

const { token } = useShopAuth()
const config = useRuntimeConfig()
const orders = ref<AdminOrder[]>([])
const loading = ref(true)
const savingId = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const filter = ref<OrderStatus | 'all'>('all')
const page = ref(0)
const hasMore = ref(false)
const drafts = ref<Record<string, OrderStatus>>({})
const statuses = Object.entries(orderStatusLabels) as [OrderStatus, string][]
let requestId = 0
let disposed = false

const request = async <T>(body: object): Promise<T> => {
	if (!token.value) throw new Error('Войдите в аккаунт')

	const response = await fetch(`${config.public.supabaseUrl}/functions/v1/shop-orders`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token.value}`,
			apikey: String(config.public.supabaseKey),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	})

	const result = await response.json()
	if (!response.ok) throw new Error(result.error || 'Не удалось выполнить запрос')
	return result as T
}

const formatDate = (value: string) => new Intl.DateTimeFormat('ru-RU', {
	dateStyle: 'medium',
	timeStyle: 'short'
}).format(new Date(value))

const loadOrders = async () => {
	if (disposed) return
	const current = ++requestId
	loading.value = true
	errorMessage.value = ''

	try {
		const result = await request<{ orders: AdminOrder[]; hasMore: boolean }>({
			action: 'admin_list',
			status: filter.value,
			page: page.value
		})

		if (disposed || current !== requestId) return

		if (!result.orders.length && page.value > 0) {
			page.value--
			await loadOrders()
			return
		}

		orders.value = result.orders
		hasMore.value = result.hasMore
		drafts.value = Object.fromEntries(result.orders.map(order => [order.id, order.status]))
	} catch (error) {
		if (disposed || current !== requestId) return
		errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить заказы'
		orders.value = []
		hasMore.value = false
	} finally {
		if (!disposed && current === requestId) loading.value = false
	}
}

const changeFilter = () => {
	page.value = 0
	successMessage.value = ''
	void loadOrders()
}

const changePage = (direction: number) => {
	if (loading.value || savingId.value) return
	if (direction < 0 && page.value === 0) return
	if (direction > 0 && !hasMore.value) return
	page.value += direction
	successMessage.value = ''
	void loadOrders()
}

const updateStatus = async (order: AdminOrder) => {
	const status = drafts.value[order.id]
	if (!status || status === order.status || savingId.value || loading.value) return

	savingId.value = order.id
	errorMessage.value = ''
	successMessage.value = ''

	try {
		const result = await request<{ order: { id: string; status: OrderStatus } }>({
			action: 'admin_update_status',
			order_id: order.id,
			status,
			expected_status: order.status
		})

		if (disposed) return
		order.status = result.order.status
		drafts.value[order.id] = result.order.status
		successMessage.value = `Статус заказа №${order.order_number} обновлён`
		if (filter.value !== 'all' && filter.value !== order.status) await loadOrders()
	} catch (error) {
		if (!disposed) errorMessage.value = error instanceof Error ? error.message : 'Не удалось изменить статус'
	} finally {
		savingId.value = ''
	}
}

onMounted(loadOrders)
onBeforeUnmount(() => {
	disposed = true
	requestId++
})
</script>

<template>
	<section class="orders">
		<div class="orders-heading">
			<div>
				<h2>Заказы</h2>
				<p>Просматривайте состав заказов и управляйте их статусами.</p>
			</div>
			<div class="orders-controls">
				<select v-model="filter" aria-label="Фильтр по статусу" :disabled="loading || !!savingId" @change="changeFilter">
					<option value="all">Все статусы</option>
					<option v-for="[value, label] in statuses" :key="value" :value="value">{{ label }}</option>
				</select>
				<button type="button" class="secondary-button" :disabled="loading || !!savingId" @click="loadOrders">Обновить</button>
			</div>
		</div>

		<p v-if="errorMessage" class="message message--error" role="alert">{{ errorMessage }}</p>
		<p v-if="successMessage" class="message message--success" role="status">{{ successMessage }}</p>
		<p v-if="loading" class="empty" role="status">Загрузка заказов...</p>
		<p v-else-if="!orders.length && !errorMessage" class="empty">Заказы не найдены.</p>

		<div v-else-if="orders.length" class="order-list">
			<article v-for="order in orders" :key="order.id" class="order">
				<div class="order-heading">
					<div>
						<h3>Заказ №{{ order.order_number }}</h3>
						<time :datetime="order.created_at">{{ formatDate(order.created_at) }}</time>
					</div>
					<span class="status" :class="`status--${order.status}`">{{ orderStatusLabels[order.status] }}</span>
				</div>

				<details class="order-details">
					<summary>Данные покупателя и доставки</summary>
					<dl class="customer-grid">
						<div><dt>ФИО</dt><dd>{{ order.full_name }}</dd></div>
						<div><dt>Телефон</dt><dd><a :href="`tel:${order.phone.replace(/[^+\d]/g, '')}`">{{ order.phone }}</a></dd></div>
						<div><dt>Электронная почта</dt><dd>{{ order.email }}</dd></div>
						<div><dt>Способ оплаты</dt><dd>{{ paymentMethodLabels[order.payment_method] }}</dd></div>
						<div class="wide"><dt>Адрес доставки</dt><dd>{{ order.city }}, {{ order.address }}</dd></div>
						<div v-if="order.comment" class="wide"><dt>Комментарий</dt><dd>{{ order.comment }}</dd></div>
					</dl>
				</details>

				<div class="items">
					<div v-for="item in order.shop_order_items" :key="item.id" class="item">
						<div class="item-image">
							<img v-if="item.image_url" :src="item.image_url" :alt="item.product_name" loading="lazy" referrerpolicy="no-referrer" />
						</div>
						<div class="item-info">
							<strong>{{ item.product_name }}</strong>
							<span>{{ item.quantity }} шт. × {{ formatOrderPrice(item.unit_price) }}</span>
						</div>
						<strong class="item-total">{{ formatOrderPrice(item.line_total) }}</strong>
					</div>
				</div>

				<div class="order-bottom">
					<div class="order-total">
						<span>Сумма товаров</span>
						<strong>{{ formatOrderPrice(order.total) }}</strong>
					</div>
					<form class="status-form" @submit.prevent="updateStatus(order)">
						<label :for="`status-${order.id}`">Изменить статус</label>
						<div class="status-actions">
							<select :id="`status-${order.id}`" v-model="drafts[order.id]" :disabled="!!savingId || loading">
								<option v-for="[value, label] in statuses" :key="value" :value="value">{{ label }}</option>
							</select>
							<button type="submit" class="primary-button" :disabled="!!savingId || loading || drafts[order.id] === order.status">
								{{ savingId === order.id ? 'Сохранение...' : 'Сохранить' }}
							</button>
						</div>
					</form>
				</div>
			</article>
		</div>

		<div v-if="!loading && (page > 0 || hasMore)" class="pagination">
			<button type="button" class="secondary-button" :disabled="page === 0 || !!savingId" @click="changePage(-1)">Назад</button>
			<span>Страница {{ page + 1 }}</span>
			<button type="button" class="secondary-button" :disabled="!hasMore || !!savingId" @click="changePage(1)">Вперёд</button>
		</div>
	</section>
</template>

<style scoped>
.orders { min-width: 0; }
.orders-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
.orders-heading h2 { margin: 0 0 8px; font-size: 24px; }
.orders-heading p { margin: 0; font-size: 14px; color: #777; }
.orders-controls, .status-actions { display: flex; align-items: center; gap: 10px; }
select, button { min-height: 44px; box-sizing: border-box; padding: 0 14px; border: 1px solid #e5e5e5; border-radius: 10px; background: #fff; color: #333; font: inherit; font-size: 14px; cursor: pointer; }
select { min-width: 0; width: 100%; }
select:focus-visible, button:focus-visible, summary:focus-visible { outline: 2px solid #D71920; outline-offset: 2px; }
button { font-weight: 600; }
.primary-button { background: #D71920; border-color: #D71920; color: #fff; }
.primary-button:hover:not(:disabled) { background: #b9152b; }
.secondary-button:hover:not(:disabled) { color: #D71920; border-color: #D71920; }
button:disabled, select:disabled { opacity: .5; cursor: not-allowed; }
.order-list { display: grid; gap: 20px; }
.order { min-width: 0; padding: 24px; border: 1px solid #eee; border-radius: 16px; background: #fff; }
.order-heading, .order-bottom { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.order-heading h3 { margin: 0 0 6px; font-size: 20px; }
.order-heading time, .item-info span, .order-total span { color: #777; font-size: 13px; }
.status { padding: 7px 12px; border-radius: 8px; background: #f5f5f5; color: #555; font-size: 13px; font-weight: 600; }
.status--new { background: #fff4ce; color: #7b5700; }
.status--confirmed, .status--assembling, .status--shipping { background: #e9f0ff; color: #285096; }
.status--completed { background: #e8f6ed; color: #226a3d; }
.status--cancelled { background: #fce8ea; color: #D71920; }
.order-details { margin-top: 20px; padding: 16px; background: #fafafa; border-radius: 12px; }
.order-details summary { font-size: 14px; font-weight: 600; cursor: pointer; }
.customer-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 20px; margin: 18px 0 0; }
.customer-grid .wide { grid-column: 1 / -1; }
.customer-grid dt { margin-bottom: 4px; color: #777; font-size: 12px; }
.customer-grid dd { margin: 0; font-size: 14px; overflow-wrap: anywhere; white-space: pre-wrap; }
.customer-grid a { color: inherit; }
.items { margin: 20px 0; }
.item { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid #eee; }
.item-image { height: 64px; overflow: hidden; background: #f8f8f8; border-radius: 8px; }
.item-image img { display: block; width: 100%; height: 100%; object-fit: contain; }
.item-info { display: grid; gap: 5px; overflow-wrap: anywhere; }
.item-info strong { font-size: 14px; }
.item-total { font-size: 15px; white-space: nowrap; }
.order-total { display: grid; gap: 4px; }
.order-total strong { font-size: 24px; }
.status-form { display: grid; gap: 8px; }
.status-form label { font-size: 13px; color: #777; }
.empty { margin: 0; padding: 44px 16px; text-align: center; background: #fafafa; border-radius: 12px; color: #777; }
.message { padding: 12px 16px; border-radius: 10px; font-size: 14px; }
.message--error { background: #fce8ea; color: #a5161c; }
.message--success { background: #e8f6ed; color: #226a3d; }
.pagination { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 14px; margin-top: 28px; font-size: 14px; }
@media (max-width: 760px) {
	.orders-heading, .order-bottom { flex-direction: column; align-items: stretch; }
	.orders-controls select, .status-actions select { flex: 1; }
	.order { padding: 16px; }
}
@media (max-width: 480px) {
	.customer-grid { grid-template-columns: 1fr; }
	.item { grid-template-columns: 52px minmax(0, 1fr); gap: 10px; }
	.item-image { height: 52px; }
	.item-total { grid-column: 2; }
	.order-heading { align-items: flex-start; flex-wrap: wrap; gap: 10px; }
	.status-actions { flex-wrap: wrap; }
	.status-actions select, .status-actions button { flex: 1 0 100%; }
}
</style>
