<script setup lang="ts">
import type { ShopOrder } from '~/types/order'
import { formatOrderPrice, orderStatusLabels, paymentMethodLabels } from '~/types/order'

const { token } = useShopAuth()
const { listOrders } = useShopOrders()
const orders = ref<ShopOrder[]>([])
const loading = ref(false)
const errorMessage = ref('')
const page = ref(0)
const hasMore = ref(false)
let generation = 0

const load = async (reset = true) => {
	if (!token.value || (!reset && (loading.value || !hasMore.value))) return
	const current = ++generation
	loading.value = true
	errorMessage.value = ''
	const nextPage = reset ? 0 : page.value + 1
	try {
		const result = await listOrders(nextPage)
		if (current !== generation) return
		if (reset) orders.value = result.orders
		else orders.value = [...orders.value, ...result.orders.filter(order => !orders.value.some(saved => saved.id === order.id))]
		page.value = nextPage
		hasMore.value = result.hasMore
	} catch (error) {
		if (current !== generation) return
		errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить заказы'
	} finally {
		if (current === generation) loading.value = false
	}
}

const formatDate = (date: string) => new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date))

watch(token, value => {
	generation++
	orders.value = []
	page.value = 0
	hasMore.value = false
	loading.value = false
	errorMessage.value = ''
	if (value) void load()
}, { immediate: true })

onBeforeUnmount(() => { generation++ })
</script>

<template>
	<section class="history" aria-labelledby="orders-heading">
		<div class="history-heading">
			<h2 id="orders-heading">Мои заказы</h2>
			<button type="button" class="secondary-button" :disabled="loading || !token" @click="load()">Обновить</button>
		</div>
		<p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
		<p v-if="loading && !orders.length" class="muted">Загружаем заказы...</p>
		<div v-else-if="!orders.length && !errorMessage" class="empty">
			<p>У вас пока нет заказов.</p>
			<NuxtLink to="/store/catalog" class="catalog-link">Перейти в каталог</NuxtLink>
		</div>
		<article v-for="order in orders" :key="order.id" class="order">
			<div class="order-heading">
				<div>
					<h3>Заказ №{{ order.order_number }}</h3>
					<time :datetime="order.created_at">{{ formatDate(order.created_at) }}</time>
				</div>
				<span class="status" :class="`status-${order.status}`">{{ orderStatusLabels[order.status] || order.status }}</span>
			</div>
			<div class="items">
				<div v-for="item in order.shop_order_items" :key="item.id" class="item">
					<img v-if="item.image_url" :src="item.image_url" alt="" />
					<div v-else class="placeholder" aria-hidden="true" />
					<div class="item-description">
						<strong>{{ item.product_name }}</strong>
						<span>{{ item.quantity }} шт. × {{ formatOrderPrice(item.unit_price) }}</span>
					</div>
					<strong class="item-total">{{ formatOrderPrice(item.line_total) }}</strong>
				</div>
			</div>
			<div class="order-bottom">
				<div class="delivery">
					<span>{{ paymentMethodLabels[order.payment_method] }}</span>
					<span>{{ order.city }}, {{ order.address }}</span>
				</div>
				<div class="total"><span>Сумма товаров</span><strong>{{ formatOrderPrice(order.total) }}</strong></div>
			</div>
		</article>
		<button v-if="hasMore" class="secondary-button more" type="button" :disabled="loading" @click="load(false)">{{ loading ? 'Загрузка...' : 'Показать ещё' }}</button>
	</section>
</template>

<style scoped>
.history { width: 100%; margin-top: 40px; }
.history-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.history-heading h2 { margin: 0; font-size: 26px; }
.order { border: 1px solid #eee; border-radius: 14px; padding: 24px; margin-bottom: 20px; }
.order-heading, .order-bottom { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.order-heading h3 { margin: 0 0 6px; font-size: 19px; }
.order-heading time, .item-description span, .delivery, .total span, .muted { color: #777; font-size: 13px; }
.status { display: inline-block; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; background: #f4f4f4; color: #444; }
.status-new { color: #D71920; background: #fce8ea; }
.status-completed { background: #e9f5ec; color: #27643b; }
.status-cancelled { background: #f4f4f4; color: #777; }
.items { display: flex; flex-direction: column; gap: 16px; margin: 24px 0; }
.item { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; align-items: center; gap: 14px; }
.item img, .placeholder { width: 64px; height: 64px; border-radius: 8px; background: #fafafa; object-fit: contain; }
.item-description { display: flex; flex-direction: column; gap: 6px; overflow-wrap: anywhere; }
.item-total { font-size: 15px; }
.order-bottom { padding-top: 20px; border-top: 1px solid #eee; }
.delivery, .total { display: flex; flex-direction: column; gap: 6px; overflow-wrap: anywhere; }
.total { text-align: right; flex-shrink: 0; }
.total strong { font-size: 22px; }
.secondary-button { font: inherit; font-size: 14px; min-height: 42px; padding: 0 16px; border: 1px solid #ddd; border-radius: 10px; color: #333; background: #fff; cursor: pointer; }
.secondary-button:hover:not(:disabled) { color: #D71920; border-color: #D71920; }
.secondary-button:disabled { opacity: .5; cursor: not-allowed; }
.more { display: block; margin: 20px auto 0; }
.empty { padding: 32px; border: 1px solid #eee; border-radius: 14px; text-align: center; color: #777; }
.catalog-link { color: #D71920; text-decoration: none; font-weight: 600; }
.error { color: #D71920; }
@media (max-width: 550px) {
	.order { padding: 16px; }
	.history-heading h2 { font-size: 22px; }
	.order-heading, .order-bottom { flex-wrap: wrap; }
	.item { grid-template-columns: 48px minmax(0, 1fr); gap: 10px; }
	.item img, .placeholder { width: 48px; height: 48px; }
	.item-total { grid-column: 2; }
	.total { text-align: left; width: 100%; }
}
</style>
