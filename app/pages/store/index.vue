<script setup lang="ts">
import type { Product } from '~/types/product'

const newProducts = ref<Product[]>([])
const popularProducts = ref<Product[]>([])
const loading = ref(true)
const errorMessage = ref('')

const heroImage = `${useRuntimeConfig().app.baseURL}images/hero-person.png`

const glowRef = shallowRef<HTMLElement | null>(null)

let animationFrame: number | null = null
let pointerX = -500
let pointerY = -500

const moveGlow = (event: PointerEvent) => {
	if (event.pointerType === 'touch') return

	const hero = event.currentTarget as HTMLElement
	const rect = hero.getBoundingClientRect()

	pointerX = event.clientX - rect.left
	pointerY = event.clientY - rect.top

	if (animationFrame !== null) return

	animationFrame = requestAnimationFrame(() => {
		if (glowRef.value) {
			glowRef.value.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`
		}

		animationFrame = null
	})
}

onBeforeUnmount(() => {
	if (animationFrame !== null) {
		cancelAnimationFrame(animationFrame)
	}
})

onMounted(async () => {
	try {
		const supabase = useSupabase()

		const [newResult, popularResult] = await Promise.all([
			supabase
				.from('products')
				.select('id, slug, name, description, price, image_url')
				.eq('active', true)
				.eq('is_new', true)
				.order('name', { ascending: true })
				.limit(4),

			supabase
				.from('products')
				.select('id, slug, name, description, price, image_url')
				.eq('active', true)
				.eq('is_popular', true)
				.order('name', { ascending: true })
				.limit(4)
		])

		if (newResult.error) throw newResult.error
		if (popularResult.error) throw popularResult.error

		newProducts.value = newResult.data ?? []
		popularProducts.value = popularResult.data ?? []
	} catch (error) {
		console.error('Ошибка загрузки товаров:', error)
		errorMessage.value = 'Не удалось загрузить товары'
	} finally {
		loading.value = false
	}
})
</script>

<template>
	<div class="page">
		<AppHeader />
		<main class="store">
			<section
				class="hero"
				@pointerenter="moveGlow"
				@pointermove="moveGlow"
			>
				<div ref="glowRef" class="hero-glow"></div>
				<div class="hero-content">
					<span class="hero-label">
						ЮМАНС-ВЦ — ОФИЦИАЛЬНЫЙ ПАРТНЁР 1С
					</span>
					<h1>Фирменный мерч 1С</h1>
					<p>
						Заказывайте фирменную продукцию 1С через компанию «Юманс-ВЦ».
						Сейчас оформить заказ могут только сотрудники компаний,
						входящих в партнёрскую сеть 1С.
					</p>
					<NuxtLink to="/store/catalog" class="hero-button">
						Смотреть мерч
						<span aria-hidden="true">→</span>
					</NuxtLink>
				</div>
				<div class="hero-image">
					<img :src="heroImage" alt="YOUMANS" />
				</div>
			</section>
			<p v-if="errorMessage" class="error-message">
				{{ errorMessage }}
			</p>
			<section id="products" class="products-section">
				<div class="section-heading">
					<h2>Новинки</h2>
					<NuxtLink to="/store/catalog?filter=new" class="more-link">
	                    Смотреть все
	                    <span aria-hidden="true">→</span>
                    </NuxtLink>
				</div>
				<p v-if="loading" class="empty-message">
					Загрузка товаров...
				</p>
				<div v-else-if="newProducts.length" class="products">
					<ProductCard
						v-for="product in newProducts"
						:key="product.id"
						:product="product"
					/>
				</div>
				<p v-else-if="!errorMessage" class="empty-message">
					Новинок пока нет
				</p>
			</section>
			<section class="products-section">
				<div class="section-heading">
					<h2>Популярное</h2>
                    <NuxtLink to="/store/catalog?filter=popular" class="more-link">
                        Смотреть все
                        <span aria-hidden="true">→</span>
                    </NuxtLink>
				</div>
				<p v-if="loading" class="empty-message">
					Загрузка товаров...
				</p>
				<div v-else-if="popularProducts.length" class="products">
					<ProductCard
						v-for="product in popularProducts"
						:key="product.id"
						:product="product"
					/>
				</div>
				<p v-else-if="!errorMessage" class="empty-message">
					Популярных товаров пока нет
				</p>
			</section>
			<section class="products-section info-section">
				<div class="section-heading">
					<h2>Доставка и оплата</h2>
				</div>
				<p>
					Мы стараемся сделать получение заказов максимально удобным.
					Доступные способы доставки, сроки и стоимость зависят от
					получателя и состава заказа.
				</p>
				<p>
					Для уточнения условий доставки и доступных способов оплаты
					свяжитесь с нами перед оформлением заказа.
				</p>
			</section>
			<section class="products-section info-section">
				<div class="section-heading">
					<h2>Возврат и обмен</h2>
				</div>
				<p>
					Если товар не подошёл или возникли вопросы по качеству,
					вы можете обратиться к нам для оформления возврата или обмена.
				</p>
				<p>
					По вопросам возврата товара и предъявления претензий обращайтесь на 
					адрес электронной почты, с которого вам был отправлен счёт на оплату.
				</p>
			</section>
			<section class="products-section info-section">
				<div class="section-heading">
					<h2>Контакты</h2>
				</div>
				<p>
					Если у вас есть вопросы о товарах, доставке, оплате
					или оформлении заказа, свяжитесь с нами удобным способом.
				</p>
				<p>
					Электронная почта:
					<a href="mailto:email@1c.ru">email@1c.ru</a>
				</p>
				<p>
					Телефон:
					<a href="tel:+79999999999">+7 (999) 999-99-99</a>
				</p>
			</section>
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

.store {
	width: 100%;
	max-width: 1200px;
	box-sizing: border-box;
	flex: 1;
	margin: 0 auto;
	padding: 30px 0 80px;
}

.hero {
	position: relative;
	isolation: isolate;
	min-height: 400px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: center;
	gap: 20px;
	background: #fff;
	border-radius: 20px;
	overflow: hidden;
}

.hero-glow {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 0;
	width: 450px;
	height: 450px;
	border-radius: 50%;
	background: radial-gradient(
		circle,
		#ffdd00 0%,
		rgba(255, 221, 0, 0.65) 25%,
		rgba(255, 221, 0, 0.3) 45%,
		rgba(255, 221, 0, 0.1) 60%,
		transparent 75%
	);
	pointer-events: none;
	opacity: 0;
	transform: translate3d(-500px, -500px, 0);
	transition: opacity 0.3s ease;
	will-change: transform;
}

.hero:hover .hero-glow {
	opacity: 1;
}

.hero-content,
.hero-image {
	position: relative;
	z-index: 1;
}

.hero-content {
	padding: 50px;
}

.hero-label {
	color: #e51a24;
	font-size: 13px;
	font-weight: 700;
	letter-spacing: 1px;
}

.hero h1 {
	max-width: 500px;
	margin: 20px 0;
	font-size: clamp(32px, 4vw, 46px);
	font-weight: 800;
	line-height: 1.2;
}

.hero p {
	max-width: 420px;
	margin: 0 0 30px;
	color: #666;
	font-size: 16px;
	line-height: 1.7;
}

.hero-button {
	position: relative;
	z-index: 2;
	height: 60px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 20px;
	padding: 0 24px;
	background: #e51a24;
	color: #fff;
	border-radius: 12px;
	text-decoration: none;
	font-weight: 600;
	transition: background 0.2s;
}

.hero-button:hover {
	background: #b9152b;
}

.hero-image {
	height: 400px;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	align-self: end;
	pointer-events: none;
}

.hero-image img {
	display: block;
	width: auto;
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
	object-position: bottom;
}

.products-section {
	margin-top: 60px;
	scroll-margin-top: 100px;
}

.section-heading {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20px;
	margin-bottom: 24px;
}

.section-heading h2 {
	margin: 0;
	font-size: 28px;
	font-weight: 700;
}

.more-link {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	color: #e51a24;
	font-size: 14px;
	font-weight: 600;
	text-decoration: none;
	white-space: nowrap;
}

.more-link:hover {
	color: #b9152b;
}

.products {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 20px;
}

.empty-message,
.error-message {
	padding: 30px;
	background: #fafafa;
	border-radius: 12px;
	color: #777;
	text-align: center;
}

.error-message {
	margin-top: 30px;
	color: #e51a24;
}

.info-section p {
	max-width: 900px;
	margin: 0 0 16px;
	color: #666;
	font-size: 16px;
	line-height: 1.8;
}

.info-section p:last-child {
	margin-bottom: 0;
}

.info-section a {
	color: #e51a24;
	text-decoration: none;
}

.info-section a:hover {
	text-decoration: underline;
}

@media (hover: none) {
	.hero-glow {
		display: none;
	}
}

@media (prefers-reduced-motion: reduce) {
	.hero-glow,
	.hero-button {
		transition: none;
	}
}

@media (max-width: 1240px) {
	.store {
		padding: 30px 20px 80px;
	}
}

@media (max-width: 950px) {
	.products {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.hero-content {
		padding: 30px;
	}
}

@media (max-width: 750px) {
	.products {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 650px) {
	.hero {
		grid-template-columns: 1fr;
		gap: 0;
	}

	.hero-content {
		padding: 30px 24px;
	}

	.hero h1 {
		font-size: 32px;
	}

	.hero-image {
		height: 260px;
	}

	.products-section {
		margin-top: 40px;
	}

	.section-heading h2 {
		font-size: 24px;
	}
}

@media (max-width: 400px) {
	.products {
		grid-template-columns: 1fr;
	}
}
</style>
