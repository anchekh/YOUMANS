<script setup lang="ts">
const heroImage = `${useRuntimeConfig().app.baseURL}images/about.png`

const glowRef = ref<HTMLDivElement | null>(null)

const moveGlow = (event: PointerEvent) => {
	if (!glowRef.value) return

	const hero = event.currentTarget as HTMLElement
	const rect = hero.getBoundingClientRect()

	const x = event.clientX - rect.left - 225
	const y = event.clientY - rect.top - 225

	glowRef.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
}

useHead({
	title: 'О магазине — Юманс-ВЦ'
})

const categories = [
	{
		name: 'Одежда',
		slug: 'clothing',
		description: 'Фирменная одежда с символикой 1С.',
		icon: 'M16 3l5 3 2 5-4 2-2-3v11H7V10l-2 3-4-2 2-5 5-3a4 4 0 0 0 8 0Z'
	},
	{
		name: 'Обувь',
		slug: 'shoes',
		description: 'Обувь для повседневного использования.',
		icon: 'M3 4v11l-1 2v3h20v-4l-7-3-4-7H7v5H3M2 17h20'
	},
	{
		name: 'Аксессуары',
		slug: 'accessories',
		description: 'Стильные и практичные аксессуары.',
		icon: 'M7 7h10v10H7zM9 7l1-5h4l1 5M9 17l1 5h4l1-5M12 10v3h2'
	},
	{
		name: 'Посуда',
		slug: 'tableware',
		description: 'Кружки, стаканы и другая фирменная посуда.',
		icon: 'M3 3h14v11a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5ZM17 5h2a3 3 0 0 1 0 6h-2M2 22h18'
	},
	{
		name: 'Сувениры',
		slug: 'souvenirs',
		description: 'Фирменные подарки для себя и коллег.',
		icon: 'M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8H7a3 3 0 1 1 3-3ZM12 8h5a3 3 0 1 0-3-3Z'
	},
	{
		name: 'Сумки',
		slug: 'bags',
		description: 'Фирменные сумки и шопперы на каждый день.',
		icon: 'M4 7h16l1 14H3ZM8 9V6a4 4 0 0 1 8 0v3'
	},
	{
		name: 'Рюкзаки',
		slug: 'bags',
		description: 'Удобные рюкзаки для работы и путешествий.',
		icon: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M9 6h6a5 5 0 0 1 5 5v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a5 5 0 0 1 5-5ZM8 14h8v5H8z'
	},
	{
		name: 'Канцелярия',
		slug: 'stationery',
		description: 'Принадлежности для работы и учёбы.',
		icon: 'M4 3h16v18H4zM8 3v18M11 8h6M11 12h6M11 16h4'
	}
]

const categoryTrack = ref<HTMLDivElement | null>(null)

const canScrollPrev = ref(false)
const canScrollNext = ref(false)

let categoryObserver: ResizeObserver | null = null

const updateCategoryScroll = () => {
	const track = categoryTrack.value

	if (!track) return

	canScrollPrev.value = track.scrollLeft > 1
	canScrollNext.value =
		track.scrollLeft + track.clientWidth < track.scrollWidth - 1
}

const scrollCategories = (direction: number) => {
	const track = categoryTrack.value
	const card = track?.firstElementChild as HTMLElement | null

	if (!track || !card) return

	const gap = parseFloat(getComputedStyle(track).columnGap) || 0

	track.scrollBy({
		left: (card.offsetWidth + gap) * direction,
		behavior: 'smooth'
	})
}

onMounted(() => {
	updateCategoryScroll()

	if (categoryTrack.value) {
		categoryObserver = new ResizeObserver(updateCategoryScroll)
		categoryObserver.observe(categoryTrack.value)
	}
})

onBeforeUnmount(() => {
	categoryObserver?.disconnect()
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

					<h1>О магазине</h1>

                    <p>
                        Заказывайте фирменную продукцию 1С через компанию
                        «Юманс-ВЦ». Магазин предназначен для сотрудников
                        компаний, входящих в партнёрскую сеть 1С.
                    </p>

					<NuxtLink to="/store/catalog" class="hero-button">
						Смотреть мерч
						<span aria-hidden="true">→</span>
					</NuxtLink>
				</div>

				<div class="hero-image">
					<img :src="heroImage" alt="" />
				</div>
			</section>

            <section class="info-section">
                <h2>О нашем магазине</h2>

                <p>
                    Компания «Юманс-ВЦ», являясь официальным партнёром фирмы «1С»,
                    предоставляет сотрудникам компаний партнёрской сети возможность
                    заказывать фирменную продукцию с символикой 1С.
                </p>

                <p>
                    У фирмы «1С» существует собственный магазин фирменной продукции.
                    Наш интернет-магазин представляет собой отдельную площадку,
                    предназначенную для оформления заказов на фирменный мерч
                    через компанию «Юманс-ВЦ».
                </p>

                <p>
                    В каталоге представлена фирменная одежда, обувь, аксессуары,
                    посуда, сувениры, сумки, рюкзаки и канцелярские принадлежности.
                    Продукцию можно заказать для личного использования, коллег
                    и проведения корпоративных мероприятий.
                </p>
            </section>

            <section class="info-section">
                <div class="categories-heading">
                    <h2>Что вы найдёте в нашем каталоге</h2>

                    <div class="carousel-actions">
                        <button
                            type="button"
                            aria-label="Предыдущая категория"
                            :disabled="!canScrollPrev"
                            @click="scrollCategories(-1)"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            aria-label="Следующая категория"
                            :disabled="!canScrollNext"
                            @click="scrollCategories(1)"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div
                    ref="categoryTrack"
                    class="categories-track"
                    @scroll.passive="updateCategoryScroll"
                >
                    <article
                        v-for="category in categories"
                        :key="category.name"
                        class="category-card"
                    >
                        <div class="category-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path :d="category.icon" />
                            </svg>
                        </div>

                        <h3>{{ category.name }}</h3>
                        <p>{{ category.description }}</p>

                        <NuxtLink
                            :to="{
                                path: '/store/catalog',
                                query: { category: category.slug }
                            }"
                            class="text-link"
                        >
                            Смотреть товары →
                        </NuxtLink>
                    </article>
                </div>
            </section>

			<section class="info-section">
				<h2>О компании «Юманс-ВЦ»</h2>

				<p>
					Компания «Юманс-ВЦ» является официальным
					партнёром 1С. Интернет-магазин предоставляет
					возможность приобретения фирменной продукции
					через компанию.
				</p>

				<p>
					Если у вас возникли вопросы об ассортименте,
					оформлении заказа или условиях приобретения
					товаров, вы можете обратиться к нам за консультацией.
				</p>

				<NuxtLink to="/store/contacts" class="text-link">
					Связаться с нами →
				</NuxtLink>
			</section>

			<section class="info-section">
				<h2>Кто может оформить заказ?</h2>

				<p>
					На данный момент возможность оформления заказов
					доступна сотрудникам компаний, входящих
					в партнёрскую сеть 1С.
				</p>

				<p>
					Для приобретения продукции необходимо
					зарегистрироваться в интернет-магазине,
					выбрать понравившиеся товары и заполнить
					информацию о доставке.
				</p>

				<NuxtLink to="/store/delivery" class="text-link">
					Подробнее о доставке и оплате →
				</NuxtLink>
			</section>

			<section class="bottom-banner">
				<div>
					<h2>Мерч для тех, кто в теме</h2>

					<p>
						Откройте для себя фирменную продукцию 1С.
						Выбирайте товары для себя и своей команды.
					</p>
				</div>

				<NuxtLink to="/store/catalog" class="hero-button">
					Перейти в каталог
					<span aria-hidden="true">→</span>
				</NuxtLink>
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
	min-height: 60px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 20px;
	padding: 0 24px;
	box-sizing: border-box;
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

.info-section {
	margin-top: 60px;
}

.info-section h2 {
	margin: 0 0 24px;
	font-size: 28px;
	font-weight: 700;
}

.info-section > p {
	max-width: 900px;
	margin: 0 0 16px;
	color: #666;
	font-size: 16px;
	line-height: 1.8;
}

.info-section > p:last-child {
	margin-bottom: 0;
}

.categories-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 20px;
}

.category-card {
	min-width: 0;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	padding: 30px;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 16px;
}

.category-icon {
	width: 52px;
	height: 52px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24px;
	background: #e51a24;
	color: #fff;
	border-radius: 12px;
}

.category-icon svg {
	width: 26px;
	height: 26px;
}

.category-card h3 {
	margin: 0 0 12px;
	font-size: 20px;
	font-weight: 700;
}

.category-card p {
	margin: 0 0 24px;
	color: #777;
	font-size: 15px;
	line-height: 1.7;
}

.text-link {
	display: inline-block;
	color: #e51a24;
	font-size: 14px;
	font-weight: 600;
	text-decoration: none;
	transition: color 0.2s;
}

.text-link:hover {
	color: #b9152b;
}

.category-card .text-link {
	margin-top: auto;
}

.bottom-banner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 30px;
	margin-top: 60px;
	padding: 40px;
	background: #fafafa;
	border-radius: 20px;
}

.bottom-banner h2 {
	margin: 0 0 16px;
	font-size: 28px;
	font-weight: 800;
}

.bottom-banner p {
	max-width: 550px;
	margin: 0;
	color: #666;
	font-size: 16px;
	line-height: 1.7;
}

.bottom-banner .hero-button {
	flex-shrink: 0;
}

.categories-heading {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20px;
	margin-bottom: 24px;
}

.categories-heading h2 {
	margin: 0;
}

.carousel-actions {
	display: flex;
	flex-shrink: 0;
	gap: 10px;
}

.carousel-actions button {
	width: 44px;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #e51a24;
	color: #fff;
	border: none;
	border-radius: 50%;
	cursor: pointer;
	transition: background 0.2s;
}

.carousel-actions button:hover:not(:disabled) {
	background: #b9152b;
}

.carousel-actions button:disabled {
	background: #f0f0f0;
	color: #aaa;
	cursor: default;
}

.carousel-actions svg {
	width: 22px;
	height: 22px;
}

.categories-track {
	display: grid;
	grid-auto-flow: column;
	grid-auto-columns: calc((100% - 60px) / 4);
	gap: 20px;
	overflow-x: auto;
	scroll-snap-type: x mandatory;
	scrollbar-width: none;
}

.categories-track::-webkit-scrollbar {
	display: none;
}

.category-card {
	min-width: 0;
	min-height: 260px;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	box-sizing: border-box;
	padding: 24px;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 16px;
	scroll-snap-align: start;
}

.category-card h3 {
	margin: 0 0 12px;
	font-size: 20px;
	font-weight: 700;
}

.category-card p {
	margin: 0 0 24px;
	color: #777;
	font-size: 15px;
	line-height: 1.7;
}

.category-card .text-link {
	margin-top: auto;
}

@media (max-width: 950px) {
	.categories-track {
		grid-auto-columns: calc((100% - 40px) / 3);
	}
}

@media (max-width: 750px) {
	.categories-track {
		grid-auto-columns: calc((100% - 20px) / 2);
	}
}

@media (max-width: 500px) {
	.categories-track {
		grid-auto-columns: 85%;
		gap: 12px;
	}

	.categories-heading {
		gap: 12px;
	}

	.categories-heading h2 {
		font-size: 20px;
	}

	.carousel-actions button {
		width: 36px;
		height: 36px;
	}
}

@media (hover: none) {
	.hero-glow {
		display: none;
	}
}

@media (prefers-reduced-motion: reduce) {
	.hero-glow {
		display: none;
	}

	.hero-button,
	.text-link {
		transition: none;
	}
}

@media (max-width: 1240px) {
	.store {
		padding: 30px 20px 80px;
	}
}

@media (max-width: 950px) {
	.hero-content,
	.category-card {
		padding: 30px;
	}

	.categories-grid {
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

	.info-section {
		margin-top: 40px;
	}

	.info-section h2 {
		font-size: 24px;
	}

	.info-section > p {
		font-size: 14px;
	}

	.categories-grid {
		grid-template-columns: 1fr;
	}

	.category-card {
		padding: 24px;
	}

	.bottom-banner {
		flex-direction: column;
		align-items: flex-start;
		margin-top: 40px;
		padding: 24px;
	}

	.bottom-banner h2 {
		font-size: 24px;
	}

	.bottom-banner p {
		font-size: 14px;
	}
}

@media (max-width: 400px) {
	.bottom-banner .hero-button {
		width: 100%;
	}
}
</style>