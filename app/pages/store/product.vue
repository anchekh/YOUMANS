<script setup lang="ts">
import type { Product } from '~/types/product'
import { formatPrice } from '~/utils/formatPrice'

const route = useRoute()

const product = ref<Product | null>(null)
const loading = ref(true)
const errorMessage = ref('')

const { cart, favorites, addToCart, toggleFavorite } = useShop()

const isFavorite = computed(() => {
	return product.value !== null && favorites.value.includes(product.value.id)
})

const cartQuantity = computed(() => {
	if (!product.value) return 0

	return cart.value.find(item => item.id === product.value?.id)?.quantity || 0
})

const loadProduct = async () => {
	loading.value = true
	errorMessage.value = ''
	product.value = null

	const slug = route.query.slug

	if (typeof slug !== 'string' || !slug) {
		errorMessage.value = 'Товар не найден'
		loading.value = false
		return
	}

	try {
		const supabase = useSupabase()

		const { data, error } = await supabase
			.from('products')
			.select('id, slug, name, description, price, image_url')
			.eq('slug', slug)
			.eq('active', true)
			.maybeSingle()

		if (error) throw error

		product.value = data

		if (!data) {
			errorMessage.value = 'Товар не найден'
		}
	} catch {
		errorMessage.value = 'Не удалось загрузить товар'
	} finally {
		loading.value = false
	}
}

onMounted(loadProduct)

watch(() => route.query.slug, () => {
	if (import.meta.client) loadProduct()
})

const router = useRouter()

const backToProducts = () => {
	if (window.history.state?.back) {
		router.back()
	} else {
		router.push('/store/catalog')
	}
}
</script>

<template>
	<div class="page">
		<AppHeader />
		<main class="product-page">
            <button type="button" class="back-link" @click="backToProducts">
                <span aria-hidden="true">←</span>
                Вернуться к товарам
            </button>
			<p v-if="loading">Загрузка товара...</p>
			<p v-else-if="errorMessage">
				{{ errorMessage }}
			</p>
			<div v-else-if="product" class="product-layout">
				<div class="product-image">
					<img
						v-if="product.image_url"
						:src="product.image_url"
						:alt="product.name"
					/>
					<span v-else>Нет фото</span>
				</div>
				<div class="product-info">
					<h1>{{ product.name }}</h1>
					<p>{{ product.description }}</p>
					<strong class="price">
						{{ formatPrice(product.price) }}
					</strong>
					<div class="product-actions">
						<button
							type="button"
							class="cart-button"
							@click="addToCart(product.id)"
						>
							{{ cartQuantity ? `В корзине: ${cartQuantity}` : 'В корзину' }}
						</button>
						<button
							type="button"
							class="favorite-button"
							:class="{ active: isFavorite }"
							:aria-pressed="isFavorite"
							:aria-label="isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'"
							@click="toggleFavorite(product.id)"
						>
							<svg
								viewBox="0 0 24 24"
								:fill="isFavorite ? 'currentColor' : 'none'"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
							</svg>
						</button>
					</div>
				</div>
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

.product-page {
	width: 100%;
	max-width: 1200px;
	box-sizing: border-box;
	flex: 1;
	margin: 0 auto;
	padding: 40px 0 80px;
}

.back-link {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	padding: 0;
	background: none;
	border: none;
	color: #777;
	font: inherit;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: color 0.2s;
}

.back-link:hover {
	color: #e51a24;
}

.product-layout {
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: start;
	gap: 40px;
}

.product-image {
	width: 100%;
	min-height: 450px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 16px;
	overflow: hidden;
}

.product-image img {
	display: block;
	width: auto;
	height: auto;
	max-width: 100%;
	max-height: 520px;
	object-fit: contain;
	border-radius: 12px;
}

.product-info h1 {
	margin: 0 0 20px;
	font-size: 32px;
}

.product-info p {
	margin: 0 0 30px;
	color: #666;
	line-height: 1.7;
}

.price {
	display: block;
	margin-bottom: 30px;
	font-size: 30px;
}

.product-actions {
	display: flex;
	gap: 20px;
}

.cart-button,
.favorite-button {
	height: 60px;
	border: none;
	border-radius: 12px;
	font: inherit;
	font-weight: 600;
	cursor: pointer;
}

.cart-button {
	padding: 0 36px;
	background: #E51A24;
	color: white;
}

.cart-button:hover {
	background: #b9152b;
}

.favorite-button {
	width: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff0f2;
	color: #E51A24;
}

.favorite-button.active {
	background: #E51A24;
	color: white;
}

.favorite-button svg {
	width: 24px;
	height: 24px;
}

@media (max-width: 1240px) {
	.product-page {
		padding: 40px 20px 80px;
	}
}

@media (max-width: 700px) {
	.product-layout {
		grid-template-columns: 1fr;
		gap: 20px;
	}

	.product-info h1 {
		font-size: 26px;
	}
}
</style>