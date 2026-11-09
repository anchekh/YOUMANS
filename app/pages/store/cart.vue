<script setup lang="ts">
import type { Product } from '~/types/product'
import { formatPrice } from '~/utils/formatPrice'

const { cart, initialize, removeFromCart, setQuantity } = useShop()

const products = ref<Product[]>([])
const loading = ref(true)
const errorMessage = ref('')

const cartProducts = computed(() => {
	return cart.value.flatMap(item => {
		const product = products.value.find(product => product.id === item.id)

		return product
			? [{ ...product, quantity: item.quantity }]
			: []
	})
})

const total = computed(() => {
	return cartProducts.value.reduce(
		(sum, product) => sum + product.price * product.quantity,
		0
	)
})

onMounted(async () => {
	initialize()

	if (!cart.value.length) {
		loading.value = false
		return
	}

	try {
		const supabase = useSupabase()

		const { data, error } = await supabase
			.from('products')
			.select('id, slug, name, description, price, image_url')
			.eq('active', true)
			.in('id', cart.value.map(item => item.id))

		if (error) throw error

		products.value = data ?? []
	} catch {
		errorMessage.value = 'Не удалось загрузить корзину'
	} finally {
		loading.value = false
	}
})
</script>

<template>
    <div class="page">
        <AppHeader />
        <main class="cart-page">
            <h1>Корзина</h1>
            <p v-if="loading">Загрузка...</p>
            <p v-else-if="errorMessage">{{ errorMessage }}</p>

            <div v-else-if="cartProducts.length" class="cart-layout">
                <div class="cart-items">
                    <article
                        v-for="product in cartProducts"
                        :key="product.id"
                        class="cart-item"
                    >
                        <NuxtLink
                            :to="{ path: '/store/product', query: { slug: product.slug } }"
                            class="item-image"
                        >
                            <img
                                v-if="product.image_url"
                                :src="product.image_url"
                                :alt="product.name"
                            />
                        </NuxtLink>
                        <div class="item-info">
                            <NuxtLink
                                :to="{ path: '/store/product', query: { slug: product.slug } }"
                                class="item-name"
                            >
                                {{ product.name }}
                            </NuxtLink>
                            <strong>{{ formatPrice(product.price) }}</strong>
                            <div class="quantity">
                                <button
                                    type="button"
                                    aria-label="Уменьшить количество"
                                    @click="setQuantity(product.id, product.quantity - 1)"
                                >
                                    −
                                </button>
                                <span>{{ product.quantity }}</span>
                                <button
                                    type="button"
                                    aria-label="Увеличить количество"
                                    @click="setQuantity(product.id, product.quantity + 1)"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div class="item-actions">
                            <strong>
                                {{ formatPrice(product.price * product.quantity) }}
                            </strong>

                            <button
                                type="button"
                                class="remove-button"
                                @click="removeFromCart(product.id)"
                            >
                                Удалить
                            </button>
                        </div>
                    </article>
                </div>
                <aside class="summary">
                    <h2>Ваш заказ</h2>
                    <div class="summary-row">
                        <span>Количество товаров</span>
                        <span>{{ cart.reduce((sum, item) => sum + item.quantity, 0) }}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Итого</span>
                        <strong>{{ formatPrice(total) }}</strong>
                    </div>
                    <p>Оформление заказов пока не подключено.</p>
                </aside>
            </div>
            <div v-else class="empty">
                <h2>Корзина пуста</h2>
                <p>Добавь товары, которые хочешь приобрести.</p>
                <NuxtLink to="/store" class="button">
                    Смотреть товары
                </NuxtLink>
            </div>
        </main>
        <AppFooter />
    </div>
</template>

<style scoped>
.page {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

.cart-page {
	width: 100%;
	max-width: 1200px;
	flex: 1;
	margin: 0 auto;
	padding: 40px 0 80px;
	box-sizing: border-box;
}

.cart-page {
	max-width: 1200px;
	margin: 0 auto;
	padding: 40px 0 80px;
}

h1 {
	margin: 0 0 30px;
	font-size: 28px;
}

.cart-layout {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 320px;
	align-items: start;
	gap: 20px;
}

.cart-items {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.cart-item {
	display: flex;
	gap: 20px;
	padding: 20px;
	border: 1px solid #eee;
	border-radius: 16px;
}

.item-image {
	width: 140px;
	height: 140px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f8f8f8;
	border-radius: 12px;
	overflow: hidden;
}

.item-image img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.item-info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 12px;
}

.item-name {
	color: #222;
	font-size: 17px;
	font-weight: 600;
	text-decoration: none;
}

.item-name:hover {
	color: #d71932;
}

.item-info strong {
	font-size: 18px;
}

.quantity {
	display: flex;
	align-items: center;
	gap: 15px;
	border: 1px solid #eee;
	border-radius: 10px;
}

.quantity button {
	width: 36px;
	height: 36px;
	background: transparent;
	border: none;
	font-size: 20px;
	cursor: pointer;
}

.quantity button:hover {
	color: #d71932;
}

.item-actions {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: space-between;
	gap: 15px;
}

.item-actions strong {
	font-size: 20px;
	white-space: nowrap;
}

.remove-button {
	padding: 0;
	background: transparent;
	border: none;
	color: #d71932;
	font: inherit;
	font-size: 14px;
	cursor: pointer;
}

.summary {
	padding: 24px;
	background: #fafafa;
	border-radius: 16px;
}

.summary h2 {
	margin: 0 0 24px;
	font-size: 20px;
}

.summary-row {
	display: flex;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 20px;
}

.total {
	padding-top: 20px;
	border-top: 1px solid #ddd;
	font-size: 20px;
}

.summary p {
	margin: 0;
	color: #888;
	font-size: 13px;
	line-height: 1.6;
}

.empty {
	padding: 60px 20px;
	background: #fafafa;
	border-radius: 16px;
	text-align: center;
}

.empty h2 {
	margin: 0 0 12px;
}

.empty p {
	margin: 0 0 30px;
	color: #777;
}

.button {
	height: 50px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0 24px;
	background: #d71932;
	color: #fff;
	border-radius: 12px;
	text-decoration: none;
	font-weight: 600;
}

@media (max-width: 1240px) {
	.cart-page {
		padding: 40px 20px 80px;
	}
}

@media (max-width: 850px) {
	.cart-layout {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 550px) {
	.cart-item {
		flex-wrap: wrap;
		padding: 12px;
		gap: 12px;
	}

	.item-image {
		width: 100px;
		height: 100px;
	}

	.item-actions {
		width: 100%;
		flex-direction: row;
		align-items: center;
	}

	.item-actions strong {
		font-size: 17px;
	}
}
</style>