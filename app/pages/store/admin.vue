<script setup lang="ts">

const { user, token, initialize, logout } = useShopAuth()

const checking = ref(true)
const saving = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
	name: '',
	description: '',
	price: '',
	category_id: '',
	is_new: false,
	is_popular: false,
	active: true
})

const image = shallowRef<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const onImageChange = (event: Event) => {
	const input = event.target as HTMLInputElement
	image.value = input.files?.[0] ?? null
}

const signOut = async () => {
	await logout()
	await navigateTo('/store/login')
}

const addProduct = async () => {
	if (saving.value || !token.value) return

	saving.value = true
	errorMessage.value = ''
	successMessage.value = ''

	try {
		const data = new FormData()

		data.append('name', form.name)
		data.append('description', form.description)
		data.append('price', form.price)
		data.append('category_id', form.category_id)
		data.append('is_new', String(form.is_new))
		data.append('is_popular', String(form.is_popular))
		data.append('active', String(form.active))

		if (image.value) {
			data.append('image', image.value)
		}

		const config = useRuntimeConfig()

		const response = await fetch(
			`${config.public.supabaseUrl}/functions/v1/shop-admin`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token.value}`
				},
				body: data
			}
		)

		const result = await response.json() as {
			error?: string
			product?: {
				id: string
				name: string
				slug: string
			}
		}

		if (!response.ok) {
			throw new Error(result.error || 'Ошибка сохранения товара')
		}

		successMessage.value = `Товар «${form.name}» добавлен`

		Object.assign(form, {
			name: '',
			description: '',
			price: '',
			category_id: categories.value.find(
				category => category.slug === 'other'
			)?.id ?? '',
			is_new: false,
			is_popular: false,
			active: true
		})

		image.value = null

		if (fileInput.value) {
			fileInput.value.value = ''
		}
	} catch (error) {
		errorMessage.value = error instanceof Error
			? error.message
			: 'Не удалось добавить товар'
	} finally {
		saving.value = false
	}
}

onMounted(async () => {
	try {
		await initialize()

		if (user.value?.role !== 'admin') {
			await navigateTo(user.value ? '/store/account' : '/store/login')
			return
		}
		await loadCategories()
	} finally {
		checking.value = false
	}
})

type Category = {
	id: string
	name: string
	slug: string
}

const categories = ref<Category[]>([])
const categoriesError = ref('')

const loadCategories = async () => {
	try {
		const { data, error } = await useSupabase()
			.from('product_categories')
			.select('id, name, slug')
			.order('sort_order', { ascending: true })

		if (error) throw error

		categories.value = data ?? []

		form.category_id = categories.value.find(
			category => category.slug === 'other'
		)?.id ?? categories.value[0]?.id ?? ''

		if (!categories.value.length) {
			categoriesError.value = 'Категории не найдены'
		}
	} catch (error) {
		console.error('Ошибка загрузки категорий:', error)
		categoriesError.value = 'Не удалось загрузить категории'
	}
}

</script>

<template>
	<div class="page">
		<AppHeader />
		<main class="store">
			<p v-if="checking">Проверка доступа...</p>
			<div v-else-if="user?.role === 'admin'">
				<div class="admin-content">
					<div>
						<h1>Панель администратора</h1>
						<p>Вы вошли как {{ user.username }}</p>
					</div>
					<button type="button" class="logout-button" @click="signOut">
						Выйти
					</button>
				</div>
				<h2>Добавить товар</h2>
				<form @submit.prevent="addProduct">
					<p>
						<label for="product-name">Название товара</label>
						<br />
						<input
							id="product-name"
							v-model="form.name"
							type="text"
							minlength="2"
							maxlength="120"
							required
						/>
					</p>
					<p>
						<label for="product-category">Категория</label>
						<br />
						<select
							id="product-category"
							v-model="form.category_id"
							required
						>
							<option value="" disabled>Выберите категорию</option>

							<option
								v-for="category in categories"
								:key="category.id"
								:value="category.id"
							>
								{{ category.name }}
							</option>
						</select>
					</p>
					<p v-if="categoriesError" role="alert">
						{{ categoriesError }}
					</p>
					<p>
						<label for="product-description">Описание</label>
						<br />
						<textarea
							id="product-description"
							v-model="form.description"
							rows="5"
							maxlength="3000"
						></textarea>
					</p>
					<p>
						<label for="product-price">Цена, ₽</label>
						<br />
						<input
							id="product-price"
							v-model="form.price"
							type="number"
							min="0.01"
							step="0.01"
							required
						/>
					</p>
					<p>
						<label for="product-image">Изображение</label>
						<br />
						<input
							id="product-image"
							ref="fileInput"
							type="file"
							accept="image/png,image/jpeg,image/webp"
							@change="onImageChange"
						/>
					</p>
					<p>
						<label>
							<input v-model="form.is_new" type="checkbox" />
							Новинка
						</label>
					</p>
					<p>
						<label>
							<input v-model="form.is_popular" type="checkbox" />
							Популярное
						</label>
					</p>
					<p>
						<label>
							<input v-model="form.active" type="checkbox" />
							Активен
						</label>
					</p>
					<p v-if="errorMessage" role="alert">
						{{ errorMessage }}
					</p>
					<p v-if="successMessage" role="status">
						{{ successMessage }}
					</p>
					<button type="submit" :disabled="saving">
						{{ saving ? 'Сохранение...' : 'Добавить товар' }}
					</button>
				</form>
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
	padding: 40px 20px 80px;
}

.admin-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24px;
}

.admin-content h1 {
	margin: 0 0 12px;
	font-size: 32px;
}

.admin-content p {
	margin: 0;
	color: #777;
}

.logout-button {
	min-height: 44px;
	padding: 0 24px;
	background: #E51A24;
	border: none;
	border-radius: 12px;
	color: #fff;
	font: inherit;
	cursor: pointer;
}

.logout-button:hover {
	background: #b9152b;
}

@media (max-width: 600px) {
	.admin-content {
		align-items: flex-start;
		flex-direction: column;
	}
}
</style>
