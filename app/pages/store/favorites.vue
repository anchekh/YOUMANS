<script setup lang="ts">
import type { Product } from '~/types/product'

const { favorites, initialize } = useShop()

const products = ref<Product[]>([])
const loading = ref(true)
const errorMessage = ref('')

const favoriteProducts = computed(() => {
    return favorites.value
        .map(id => products.value.find(
            product => String(product.id) === String(id)
        ))
        .filter((product): product is Product => product !== undefined)
})


onMounted(async () => {
    initialize()

    console.log('ID избранного:', favorites.value)

    if (!favorites.value.length) {
        loading.value = false
        return
    }

    try {
        const supabase = useSupabase()

        const { data, error } = await supabase
            .from('products')
            .select('id, slug, name, description, price, image_url, active')
            .in('id', favorites.value)

        console.log('Товары из Supabase:', data)
        console.log('Ошибка Supabase:', error)

        if (error) throw error

        products.value = data ?? []

        console.log('Найденные товары:', favoriteProducts.value)

    } catch (error) {
        console.error('Ошибка загрузки:', error)
        errorMessage.value = 'Не удалось загрузить избранное'
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="page">
        <AppHeader />
        <main class="favorites-page">
            <h1>Избранное</h1>
            <p v-if="loading">Загрузка...</p>
            <p v-else-if="errorMessage">{{ errorMessage }}</p>
            <div v-else-if="favoriteProducts.length" class="products">
                <ProductCard
                    v-for="product in favoriteProducts"
                    :key="product.id"
                    :product="product"
                />
            </div>
            <div v-else class="empty">
                <h2>Пока ничего нет</h2>
                <p>Добавляй понравившиеся товары в избранное.</p>
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

.favorites-page {
	width: 100%;
	max-width: 1200px;
	flex: 1;
	margin: 0 auto;
	padding: 40px 0 80px;
}

.favorites-page {
	max-width: 1200px;
	margin: 0 auto;
	padding: 40px 0 80px;
}

h1 {
	margin: 0 0 30px;
	font-size: 28px;
}

.products {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 20px;
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
	background: #E51A24;
	color: #fff;
	border-radius: 12px;
	text-decoration: none;
	font-weight: 600;
}

.button:hover {
	background: #b9152b;
}

@media (max-width: 1240px) {
	.favorites-page {
		padding: 40px 20px 80px;
	}
}

@media (max-width: 800px) {
	.products {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 550px) {
	.products {
		grid-template-columns: 1fr;
	}
}
</style>