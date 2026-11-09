<script setup lang="ts">
const { cartCount, favoritesCount } = useShop()
const { user, initialize } = useShopAuth()

const route = useRoute()
const logoSrc = `${useRuntimeConfig().app.baseURL}images/logo.png`

type Category = {
	id: string
	name: string
	slug: string
}

const categories = ref<Category[]>([])
const menuOpen = ref(false)
const catalogNav = ref<HTMLElement | null>(null)
const searchQuery = ref('')

const accountLink = computed(() => {
	if (!user.value) return '/store/login'

	return user.value.role === 'admin'
		? '/store/admin'
		: '/store/account'
})

const loadCategories = async () => {
	try {
		const { data, error } = await useSupabase()
			.from('product_categories')
			.select('id, name, slug')
			.order('sort_order', { ascending: true })

		if (error) throw error

		categories.value = data ?? []
	} catch (error) {
		console.error('Ошибка загрузки категорий:', error)
	}
}

const closeMenu = () => {
	menuOpen.value = false

	if (document.activeElement instanceof HTMLElement) {
		document.activeElement.blur()
	}
}

const onOutsideClick = (event: PointerEvent) => {
	if (
		catalogNav.value &&
		!catalogNav.value.contains(event.target as Node)
	) {
		menuOpen.value = false
	}
}

const submitSearch = async () => {
	const query = searchQuery.value.trim()

	await navigateTo({
		path: '/store/catalog',
		query: query ? { q: query } : {}
	})
}

watch(() => route.fullPath, () => {
	menuOpen.value = false
})

watch(() => route.query.q, value => {
	searchQuery.value = typeof value === 'string' ? value : ''
})

onMounted(() => {
	void initialize()
	void loadCategories()

	searchQuery.value = typeof route.query.q === 'string'
		? route.query.q
		: ''

	document.addEventListener('pointerdown', onOutsideClick)
})

onBeforeUnmount(() => {
	document.removeEventListener('pointerdown', onOutsideClick)
})
</script>

<template>
	<header class="header">
		<div class="header-inner">
			<NuxtLink to="/store" class="logo" aria-label="Главная">
				<img :src="logoSrc" alt="Логотип" />
			</NuxtLink>
			<div
				ref="catalogNav"
				class="catalog-nav"
				:class="{ 'is-open': menuOpen }"
			>
				<NuxtLink
					to="/store/catalog"
					class="catalog"
					@click="closeMenu"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					>
						<path d="M4 6h16" />
						<path d="M4 12h16" />
						<path d="M4 18h16" />
					</svg>
					Каталог
				</NuxtLink>
				<button
					type="button"
					class="catalog-toggle"
					:aria-expanded="menuOpen"
					aria-controls="catalog-menu"
					aria-label="Показать категории"
					@click="menuOpen = !menuOpen"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</button>
				<nav
					id="catalog-menu"
					class="catalog-dropdown"
					aria-label="Категории товаров"
				>
					<div class="catalog-dropdown-inner">
						<NuxtLink
							to="/store/catalog"
							class="catalog-all-link"
							@click="closeMenu"
						>
							Все товары
						</NuxtLink>
						<div class="catalog-category-grid">
							<NuxtLink
								v-for="category in categories"
								:key="category.id"
								:to="{
									path: '/store/catalog',
									query: { category: category.slug }
								}"
								class="catalog-category-link"
								@click="closeMenu"
							>
								{{ category.name }}
							</NuxtLink>
						</div>
					</div>
				</nav>
			</div>
			<form
				class="search"
				role="search"
				@submit.prevent="submitSearch"
			>
				<input
					v-model="searchQuery"
					type="search"
					name="q"
					placeholder="Поиск по каталогу"
					aria-label="Поиск по каталогу"
				/>
				<button type="submit" aria-label="Найти">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="11" cy="11" r="7" />
						<path d="m20 20-4-4" />
					</svg>
				</button>
			</form>
			<NuxtLink
				to="/store/favorites"
				class="icon-button"
				aria-label="Избранное"
				title="Избранное"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linejoin="round"
				>
					<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
				</svg>
				<span v-if="favoritesCount" class="counter">
					{{ favoritesCount }}
				</span>
			</NuxtLink>
			<NuxtLink
				to="/store/cart"
				class="icon-button"
				aria-label="Корзина"
				title="Корзина"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="9" cy="21" r="1" />
					<circle cx="20" cy="21" r="1" />
					<path d="M1 1h4l2.5 13h12l3-9H6" />
				</svg>

				<span v-if="cartCount" class="counter">
					{{ cartCount }}
				</span>
			</NuxtLink>
			<NuxtLink
				:to="accountLink"
				class="icon-button"
				:aria-label="user?.role === 'admin' ? 'Админ-панель' : 'Личный кабинет'"
				:title="user?.role === 'admin' ? 'Админ-панель' : 'Личный кабинет'"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="8" r="4" />
					<path d="M4 21c0-5 3-8 8-8s8 3 8 8" />
				</svg>
			</NuxtLink>
		</div>
	</header>
</template>

<style scoped>
.header {
	position: sticky;
	top: 0;
	z-index: 100;
	width: 100%;
	height: 80px;
	box-sizing: border-box;
	background: #fff;
}

.header-inner {
	position: relative;
	max-width: 1200px;
	height: 100%;
	margin: auto;
	display: flex;
	align-items: center;
	gap: 20px;
	border-bottom: 1px solid #eee;
}

.logo {
	height: 60px;
	flex-shrink: 0;
}

.logo img {
	height: 100%;
	width: auto;
	display: block;
}

.catalog,
.icon-button,
.search button {
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #E51A24;
	color: #fff;
	border: none;
	border-radius: 12px;
	text-decoration: none;
	cursor: pointer;
}

.catalog-nav {
	position: relative;
	display: flex;
	align-items: center;
	flex-shrink: 0;
}

.catalog {
	gap: 12px;
	padding: 0 24px;
	font-weight: 600;
	white-space: nowrap;
}

.catalog-toggle {
	display: none;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 60px;
	background: #E51A24;
	border: none;
	border-left: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 0 12px 12px 0;
	color: #fff;
	cursor: pointer;
}

.catalog-dropdown {
	position: absolute;
	top: 100%;
	left: 0;
	z-index: 101;
	width: min(680px, calc(100vw - 40px));
	box-sizing: border-box;
	padding-top: 10px;
	opacity: 0;
	visibility: hidden;
	pointer-events: none;
	transform: translateY(6px);
	transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
}

.catalog-nav:hover .catalog-dropdown,
.catalog-nav:focus-within .catalog-dropdown,
.catalog-nav.is-open .catalog-dropdown {
	opacity: 1;
	visibility: visible;
	pointer-events: auto;
	transform: translateY(0);
}

.catalog-dropdown-inner {
	padding: 20px;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 14px;
	box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.catalog-all-link {
	display: block;
	margin-bottom: 10px;
	padding: 10px 12px;
	color: #E51A24;
	font-size: 15px;
	font-weight: 700;
	text-decoration: none;
}

.catalog-category-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 4px;
}

.catalog-category-link {
	display: block;
	padding: 12px;
	border-radius: 8px;
	color: #333;
	font-size: 14px;
	text-decoration: none;
}

.catalog-category-link:hover,
.catalog-all-link:hover {
	background: #fff7d1;
	color: #E51A24;
}

.icon-button,
.search button {
	width: 60px;
	flex-shrink: 0;
}

.icon-button {
	position: relative;
}

.counter {
	position: absolute;
	top: 2px;
	right: 2px;
	min-width: 20px;
	height: 20px;
	padding: 0 4px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	color: #E51A24;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 700;
}

.search {
	height: 60px;
	flex: 1;
	min-width: 0;
	display: flex;
	border: 1px solid #ddd;
	border-radius: 12px;
	overflow: hidden;
}

.search input {
	flex: 1;
	min-width: 0;
	padding: 0 20px;
	border: none;
	outline: none;
	background: transparent;
	font: inherit;
}

.search input::-webkit-search-cancel-button {
	filter: grayscale(1) brightness(0);
	cursor: pointer;
}

.search button {
	border-radius: 0;
}

svg {
	width: 24px;
	height: 24px;
}

.catalog:hover,
.catalog-toggle:hover,
.icon-button:hover,
.search button:hover {
	background: #b9152b;
}

@media (max-width: 1240px) {
	.header-inner {
		margin: 0 20px;
	}
}

@media (hover: none) {
	.catalog-toggle {
		display: flex;
	}

	.catalog {
		border-radius: 12px 0 0 12px;
	}

	.catalog-nav:not(.is-open) .catalog-dropdown {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transform: translateY(6px);
	}
}

@media (max-width: 760px) {
	.header {
		height: auto;
	}

	.header-inner {
		padding: 10px 0;
		flex-wrap: wrap;
		gap: 10px;
	}

	.logo {
		margin-right: auto;
	}

	.logo,
	.catalog,
	.catalog-toggle {
		height: 48px;
	}

	.catalog-nav {
		position: static;
	}

	.catalog {
		padding: 0 10px;
		font-size: 13px;
		border-radius: 12px 0 0 12px;
	}

	.catalog-toggle {
		display: flex;
		width: 32px;
	}

	.catalog-dropdown {
		top: 100%;
		left: 0;
		right: 0;
		width: 100%;
		max-height: calc(100dvh - 150px);
		overflow-y: auto;
	}

	.icon-button {
		width: 42px;
		height: 48px;
	}

	.search {
		order: 1;
		flex: 1 0 100%;
		height: 50px;
	}

	.search button {
		width: 50px;
		height: 50px;
	}
}

@media (max-width: 650px) {
	.catalog-category-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 400px) {
	.catalog-category-grid {
		grid-template-columns: 1fr;
	}
}
</style>