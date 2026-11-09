<script setup lang="ts">
import type { Product } from '~/types/product'
import { formatPrice } from '~/utils/formatPrice'

const props = defineProps<{
	product: Product
}>()

const { cart, favorites, addToCart, toggleFavorite } = useShop()

const isFavorite = computed(() => {
	return favorites.value.includes(props.product.id)
})

const cartQuantity = computed(() => {
	return cart.value.find(item => item.id === props.product.id)?.quantity || 0
})
</script>

<template>
	<article class="product-card">
		<NuxtLink
			:to="{ path: '/store/product', query: { slug: product.slug } }"
			class="card-link"
			:aria-label="`Открыть товар ${product.name}`"
		/>
		<div class="product-image">
			<img
				v-if="product.image_url"
				:src="product.image_url"
				:alt="product.name"
				loading="lazy"
			/>
			<span v-else>Нет фото</span>
		</div>
		<div class="product-info">
			<h3>{{ product.name }}</h3>
			<p>{{ product.description }}</p>
			<strong>{{ formatPrice(product.price) }}</strong>
			<div class="product-actions">
				<button
					type="button"
					class="cart-button"
					@click="addToCart(product.id)"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="9" cy="21" r="1" />
						<circle cx="20" cy="21" r="1" />
						<path d="M1 1h4l2.5 13h12l3-9H6" />
					</svg>
					{{ cartQuantity ? `В корзине: ${cartQuantity}` : 'В корзину' }}
				</button>
				<button
					type="button"
					class="favorite-button"
					:class="{ active: isFavorite }"
					:aria-label="isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'"
					:aria-pressed="isFavorite"
					@click="toggleFavorite(product.id)"
				>
					<svg viewBox="0 0 24 24"
						:fill="isFavorite ? 'currentColor' : 'none'"
						stroke="currentColor" stroke-width="2">
						<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
					</svg>
				</button>
			</div>	
		</div>
	</article>
</template>

<style scoped>
.product-card {
	position: relative;
	display: flex;
	flex-direction: column;
	min-width: 0;
	height: 100%;
	padding: 12px;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 16px;
	overflow: hidden;
	transition: border-color 0.2s ease;
}

.product-card:hover {
	border-color: #ddd;
}

.card-link {
	position: absolute;
	inset: 0;
	z-index: 1;
	border-radius: inherit;
}

.card-link:focus-visible {
	outline: 3px solid #E51A24;
	outline-offset: -3px;
}

.product-image {
	position: relative;
	width: 100%;
	aspect-ratio: 1;
	overflow: hidden;
	border-radius: 12px;
	background: #fff;
}

.product-image img {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center;
}

.product-image > span {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	color: #999;
	font-size: 14px;
}

.favorite-button {
    position: relative;
    z-index: 2;
    flex: 0 0 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    min-height: 44px;
    padding: 0;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    color: #555;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease;
}

.favorite-button:hover,
.favorite-button.active {
	color: #E51A24;
}

.favorite-button svg {
	width: 22px;
	height: 22px;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 20px 8px 8px;
}

.product-info h3 {
	min-height: calc(2 * 1.4em);
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	overflow: hidden;
	margin: 0;
	font-size: 18px;
	font-weight: 700;
	line-height: 1.4;
	overflow-wrap: anywhere;
}

.product-info p {
	min-height: calc(4 * 1.6em);
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 4;
	line-clamp: 4;
	overflow: hidden;
	margin: 0;
	color: #777;
	font-size: 14px;
	line-height: 1.6;
	text-align: justify;
	overflow-wrap: anywhere;
}


.product-info strong {
	margin-top: auto;
}

.product-actions {
    display: flex;
    align-items: stretch;
    gap: 10px;
    width: 100%;
}

.cart-button {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    min-height: 44px;
    padding: 10px 12px;
    background: #E51A24;
    border: none;
    border-radius: 12px;
    color: #fff;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
}

.cart-button:hover {
	background: #b9152b;
}

.cart-button svg {
	flex-shrink: 0;
	width: 20px;
	height: 20px;
}

@media (max-width: 400px) {
	.product-info h3 {
		font-size: 16px;
	}

	.product-info strong {
		font-size: 20px;
	}
}
</style>