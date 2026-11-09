<script setup lang="ts">
import type { Product } from '~/types/product'

type ProductFilter = 'all' | 'new' | 'popular'
type ProductSort = 'newest' | 'name' | 'priceAsc' | 'priceDesc'

type Category = {
	id: string
	name: string
	slug: string
}

const route = useRoute()
const router = useRouter()

const queryString = (value: unknown) => {
	return typeof value === 'string' ? value : ''
}

const category = computed(() => queryString(route.query.category))

const filter = computed<ProductFilter>(() => {
	const value = route.query.filter
	return value === 'new' || value === 'popular' ? value : 'all'
})

const searchQuery = computed(() => queryString(route.query.q).trim())
const search = ref(queryString(route.query.q))

const page = computed(() => {
	const value = Number(queryString(route.query.page))
	return Number.isSafeInteger(value) && value > 0 ? value : 1
})

const updateQuery = (changes: Record<string, string | undefined>) => {
	return router.replace({
		path: '/store/catalog',
		query: {
			...route.query,
			...changes
		}
	})
}

const sort = computed<ProductSort>({
	get() {
		const value = route.query.sort

		if (value === 'name' || value === 'priceAsc' || value === 'priceDesc') {
			return value
		}

		return 'newest'
	},
	set(value) {
		void updateQuery({
			sort: value === 'newest' ? undefined : value,
			page: undefined
		})
	}
})

const categories = ref<Category[]>([])
const categoriesError = ref('')

const products = ref<Product[]>([])
const loading = ref(true)
const errorMessage = ref('')
const total = ref(0)

const pageSize = 12
const totalPages = computed(() => Math.ceil(total.value / pageSize))

let searchTimer: ReturnType<typeof setTimeout> | null = null
let requestId = 0
let ready = false

const loadCategories = async () => {
	const { data, error } = await useSupabase()
		.from('product_categories')
		.select('id, name, slug')
		.order('sort_order', { ascending: true })

	if (error) throw error

	categories.value = data ?? []
}

const loadProducts = async () => {
	const currentRequest = ++requestId

	loading.value = true
	errorMessage.value = ''

	try {
		const supabase = useSupabase()

		let query = supabase
			.from('products')
			.select('id, slug, name, description, price, image_url', {
				count: 'exact'
			})
			.eq('active', true)

		if (category.value) {
			const selectedCategory = categories.value.find(
				item => item.slug === category.value
			)

			if (!selectedCategory) {
				if (currentRequest !== requestId) return

				products.value = []
				total.value = 0
				errorMessage.value = categoriesError.value || 'Категория не найдена'
				return
			}

			query = query.eq('category_id', selectedCategory.id)
		}

		if (filter.value === 'new') {
			query = query.eq('is_new', true)
		}

		if (filter.value === 'popular') {
			query = query.eq('is_popular', true)
		}

		if (searchQuery.value) {
			const escapedSearch = searchQuery.value.replace(/[\\%_]/g, '\\$&')
			query = query.ilike('name', `%${escapedSearch}%`)
		}

		switch (sort.value) {
			case 'name':
				query = query.order('name', { ascending: true })
				break

			case 'priceAsc':
				query = query.order('price', { ascending: true })
				break

			case 'priceDesc':
				query = query.order('price', { ascending: false })
				break

			default:
				query = query.order('created_at', { ascending: false })
		}

		query = query.order('id', { ascending: true })

		const from = (page.value - 1) * pageSize

		const { data, count, error } = await query.range(
			from,
			from + pageSize - 1
		)

		if (currentRequest !== requestId) return

		if (error) throw error

		const productCount = count ?? 0
		const lastPage = Math.max(1, Math.ceil(productCount / pageSize))

		if (page.value > lastPage) {
			await updateQuery({
				page: lastPage === 1 ? undefined : String(lastPage)
			})
			return
		}

		products.value = data ?? []
		total.value = productCount
	} catch (error) {
		if (currentRequest !== requestId) return

		console.error('Ошибка загрузки каталога:', error)
		errorMessage.value = 'Не удалось загрузить каталог товаров'
		products.value = []
		total.value = 0
	} finally {
		if (currentRequest === requestId) {
			loading.value = false
		}
	}
}

const setCategory = (value: string) => {
	if (category.value === value) return

	void updateQuery({
		category: value || undefined,
		page: undefined
	})
}

const setFilter = (value: ProductFilter) => {
	if (filter.value === value) return

	void updateQuery({
		filter: value === 'all' ? undefined : value,
		page: undefined
	})
}

const setPage = async (value: number) => {
	if (value < 1 || value > totalPages.value || value === page.value) return

	await updateQuery({
		page: value === 1 ? undefined : String(value)
	})

	document.getElementById('catalog')?.scrollIntoView({
		behavior: 'smooth',
		block: 'start'
	})
}

watch(search, value => {
	if (searchTimer) clearTimeout(searchTimer)

	const nextValue = value.trim()

	if (nextValue === searchQuery.value) return

	searchTimer = setTimeout(() => {
		void updateQuery({
			q: nextValue || undefined,
			page: undefined
		})
	}, 350)
})

watch(() => route.query.q, value => {
	const nextValue = queryString(value)

	if (nextValue !== search.value) {
		if (searchTimer) clearTimeout(searchTimer)
		search.value = nextValue
	}
})

watch([category, filter, sort, page, searchQuery], () => {
	if (ready) void loadProducts()
})

onMounted(async () => {
	try {
		await loadCategories()
	} catch (error) {
		console.error('Ошибка загрузки категорий:', error)
		categoriesError.value = 'Не удалось загрузить категории'
	}

	ready = true
	await loadProducts()
})

onBeforeUnmount(() => {
	ready = false
	requestId++

	if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
	<div class="page">
		<AppHeader />
		<main id="catalog" class="store">
			<div class="catalog-heading">
				<div>
					<h1>Каталог товаров</h1>
					<p>Фирменная продукция 1С от компании «Юманс-ВЦ»</p>
				</div>
			</div>
			<div class="catalog-controls">
				<div class="search">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.35-4.35" />
					</svg>
					<input
						v-model="search"
						type="search"
						placeholder="Поиск по каталогу"
						aria-label="Поиск товаров"
					/>
				</div>
				<select v-model="sort" class="sort" aria-label="Сортировка товаров">
					<option value="newest">Сначала новые</option>
					<option value="name">По названию</option>
					<option value="priceAsc">Сначала дешевле</option>
					<option value="priceDesc">Сначала дороже</option>
				</select>
			</div>
			<div class="catalog-filters category-filters">
				<button
					type="button"
					:class="{ active: !category }"
					:aria-pressed="!category"
					@click="setCategory('')"
				>
					Все категории
				</button>
				<button
					v-for="item in categories"
					:key="item.id"
					type="button"
					:class="{ active: category === item.slug }"
					:aria-pressed="category === item.slug"
					@click="setCategory(item.slug)"
				>
					{{ item.name }}
				</button>
			</div>
			<p v-if="categoriesError" class="categories-error">
				{{ categoriesError }}
			</p>
			<div class="catalog-filters product-filters">
				<button
					type="button"
					:class="{ active: filter === 'all' }"
					:aria-pressed="filter === 'all'"
					@click="setFilter('all')"
				>
					Все товары
				</button>
				<button
					type="button"
					:class="{ active: filter === 'new' }"
					:aria-pressed="filter === 'new'"
					@click="setFilter('new')"
				>
					Новинки
				</button>
				<button
					type="button"
					:class="{ active: filter === 'popular' }"
					:aria-pressed="filter === 'popular'"
					@click="setFilter('popular')"
				>
					Популярное
				</button>
			</div>
			<div class="catalog-info">
				<span v-if="!loading && !errorMessage">
					Найдено товаров: {{ total }}
				</span>
				<span v-else-if="loading">
					Загрузка товаров...
				</span>
			</div>
			<div v-if="loading" class="catalog-message">
				Загружаем товары...
			</div>
			<div v-else-if="errorMessage" class="catalog-message">
				<p>{{ errorMessage }}</p>

				<button type="button" class="retry-button" @click="loadProducts">
					Повторить
				</button>
			</div>
			<div v-else-if="products.length" class="products">
				<ProductCard
					v-for="product in products"
					:key="product.id"
					:product="product"
				/>
			</div>

			<div v-else class="catalog-message">
				<h2>Товары не найдены</h2>
				<p>Попробуйте изменить поисковый запрос или фильтр.</p>
			</div>
			<div v-if="!loading && !errorMessage && totalPages > 1" class="pagination">
				<button
					type="button"
					:disabled="page === 1"
					@click="setPage(page - 1)"
				>
					← Назад
				</button>
				<span>Страница {{ page }} из {{ totalPages }}</span>
				<button
					type="button"
					:disabled="page === totalPages"
					@click="setPage(page + 1)"
				>
					Вперёд →
				</button>
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

.store {
	width: 100%;
	max-width: 1200px;
	box-sizing: border-box;
	flex: 1;
	margin: 0 auto;
	padding: 40px 0 80px;
}

.catalog-heading {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 36px;
}

.catalog-heading h1 {
	margin: 0 0 12px;
	font-size: clamp(30px, 4vw, 40px);
	font-weight: 800;
	line-height: 1.2;
}

.catalog-heading p {
	margin: 0;
	color: #777;
	font-size: 16px;
	line-height: 1.6;
}

.catalog-controls {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 240px;
	gap: 20px;
	margin-bottom: 24px;
}

.search {
	height: 56px;
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 0 18px;
	background: #fff;
	border: 1px solid #e5e5e5;
	border-radius: 12px;
	transition: border-color 0.2s;
}

.search:focus-within {
	border-color: #e51a24;
}

.search svg {
	flex-shrink: 0;
	width: 22px;
	height: 22px;
	color: #999;
}

.search input {
	width: 100%;
	height: 100%;
	padding: 0;
	background: transparent;
	border: none;
	outline: none;
	color: #222;
	font: inherit;
	font-size: 15px;
}

.search input::placeholder {
	color: #999;
}

.sort {
	width: 100%;
	height: 56px;
	padding: 0 16px;
	background: #fff;
	border: 1px solid #e5e5e5;
	border-radius: 12px;
	color: #333;
	font: inherit;
	font-size: 14px;
	cursor: pointer;
}

.sort:focus-visible {
	outline: 2px solid #e51a24;
	outline-offset: 2px;
}

.catalog-filters {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 28px;
}

.catalog-filters button {
	min-height: 44px;
	padding: 0 20px;
	background: #f5f5f5;
	border: 1px solid transparent;
	border-radius: 10px;
	color: #555;
	font: inherit;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.2s, color 0.2s;
}

.catalog-filters button:hover {
	background: #fce8ea;
	color: #e51a24;
}

.catalog-filters button.active {
	background: #e51a24;
	color: #fff;
}

.catalog-filters button.active:hover {
	background: #b9152b;
	color: #fff;
}

.catalog-info {
	min-height: 22px;
	margin-bottom: 20px;
	color: #777;
	font-size: 14px;
}

.products {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 20px;
}

.catalog-message {
	padding: 70px 20px;
	background: #fafafa;
	border-radius: 16px;
	color: #777;
	text-align: center;
}

.catalog-message h2 {
	margin: 0 0 12px;
	color: #222;
	font-size: 24px;
}

.catalog-message p {
	margin: 0 0 16px;
	line-height: 1.6;
}

.retry-button {
	min-height: 44px;
	padding: 0 24px;
	background: #e51a24;
	border: none;
	border-radius: 10px;
	color: #fff;
	font: inherit;
	cursor: pointer;
}

.retry-button:hover {
	background: #b9152b;
}

.pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 24px;
	margin-top: 50px;
}

.pagination button {
	min-height: 44px;
	padding: 0 20px;
	background: #fff;
	border: 1px solid #e5e5e5;
	border-radius: 10px;
	color: #333;
	font: inherit;
	font-size: 14px;
	cursor: pointer;
}

.pagination button:hover:not(:disabled) {
	border-color: #e51a24;
	color: #e51a24;
}

.pagination button:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.pagination span {
	color: #777;
	font-size: 14px;
	white-space: nowrap;
}


.product-filters {
	gap: 24px;
	margin-bottom: 28px;
}

.catalog-filters.product-filters button {
	min-height: auto;
	padding: 0;
	background: none;
	border: none;
	border-radius: 0;
	color: #777;
	font-size: 14px;
	font-weight: 300;
}

.catalog-filters.product-filters button:hover {
	background: none;
	color: #e51a24;
}

.catalog-filters.product-filters button.active,
.catalog-filters.product-filters button.active:hover {
	background: none;
	color: #e51a24;
	font-weight: 400;
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
}

@media (max-width: 750px) {
	.products {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.catalog-controls {
		grid-template-columns: 1fr;
		gap: 12px;
	}
}

@media (max-width: 500px) {
	.catalog-heading {
		margin-bottom: 28px;
	}

	.catalog-filters button {
		padding: 0 14px;
		font-size: 13px;
	}

	.pagination {
		gap: 12px;
	}

	.pagination button {
		padding: 0 12px;
		font-size: 13px;
	}

	.pagination span {
		font-size: 12px;
	}
}

@media (max-width: 400px) {
	.products {
		grid-template-columns: 1fr;
	}
}

.category-filters {
	margin-bottom: 12px;
}

.categories-error {
	color: #e51a24;
	font-size: 14px;
}
</style>