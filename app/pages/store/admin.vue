<script setup lang="ts">
const { user, token, initialize, logout } = useShopAuth()
const config = useRuntimeConfig()

const checking = ref(true)
const saving = ref(false)
const loggingOut = ref(false)
const activeTab = ref<'orders' | 'products'>('orders')
const accessError = ref('')
const errorMessage = ref('')
const successMessage = ref('')

type Category = {
	id: string
	name: string
	slug: string
}

const categories = ref<Category[]>([])
const categoriesError = ref('')
const form = reactive({
	name: '',
	description: '',
	price: '' as string | number,
	category_id: '',
	is_new: false,
	is_popular: false,
	active: true
})

const image = shallowRef<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const imageError = ref('')
const imagePreview = ref('')

const resetImage = () => {
	if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
	imagePreview.value = ''
	image.value = null
	imageError.value = ''
	if (fileInput.value) fileInput.value.value = ''
}

const onImageChange = (event: Event) => {
	const input = event.target as HTMLInputElement
	const file = input.files?.[0]
	if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
	imagePreview.value = ''
	image.value = null
	imageError.value = ''

	if (!file) return
	if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
		imageError.value = 'Выберите PNG, JPEG или WebP размером до 5 МБ'
		input.value = ''
		return
	}

	image.value = file
	imagePreview.value = URL.createObjectURL(file)
}

const defaultCategory = () => categories.value.find(category => category.slug === 'other')?.id ?? categories.value[0]?.id ?? ''

const loadCategories = async () => {
	categoriesError.value = ''
	try {
		const { data, error } = await useSupabase()
			.from('product_categories')
			.select('id, name, slug')
			.order('sort_order', { ascending: true })

		if (error) throw error
		categories.value = data ?? []
		form.category_id = defaultCategory()
		if (!categories.value.length) categoriesError.value = 'Категории не найдены'
	} catch {
		categoriesError.value = 'Не удалось загрузить категории'
	}
}

const signOut = async () => {
	if (loggingOut.value) return
	loggingOut.value = true
	accessError.value = ''
	try {
		await logout()
		await navigateTo('/store/login')
	} catch {
		accessError.value = 'Не удалось выйти из аккаунта'
	} finally {
		loggingOut.value = false
	}
}

const addProduct = async () => {
	if (saving.value || !token.value || imageError.value) return
	if (!categories.value.some(category => category.id === form.category_id)) return

	saving.value = true
	errorMessage.value = ''
	successMessage.value = ''

	try {
		const data = new FormData()
		data.append('name', form.name.trim())
		data.append('description', form.description)
		data.append('price', String(form.price))
		data.append('category_id', form.category_id)
		data.append('is_new', String(form.is_new))
		data.append('is_popular', String(form.is_popular))
		data.append('active', String(form.active))
		if (image.value) data.append('image', image.value)

		const response = await fetch(`${config.public.supabaseUrl}/functions/v1/shop-admin`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token.value}`
			},
			body: data
		})

		const result = await response.json() as {
			error?: string
			product?: { id: string; name: string; slug: string }
		}

		if (!response.ok) throw new Error(result.error || 'Ошибка сохранения товара')

		successMessage.value = `Товар «${form.name}» добавлен`
		Object.assign(form, {
			name: '',
			description: '',
			price: '',
			category_id: defaultCategory(),
			is_new: false,
			is_popular: false,
			active: true
		})
		resetImage()
	} catch (error) {
		errorMessage.value = error instanceof Error ? error.message : 'Не удалось добавить товар'
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
	} catch {
		accessError.value = 'Не удалось проверить доступ. Обновите страницу.'
	} finally {
		checking.value = false
	}
})

onBeforeUnmount(() => {
	if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
})
</script>

<template>
	<div class="page">
		<AppHeader />

		<main class="admin-page">
			<p v-if="checking" class="loading" role="status">Проверка доступа...</p>
			<p v-if="accessError" class="message message--error" role="alert">{{ accessError }}</p>

			<template v-if="!checking && user?.role === 'admin'">
				<div class="admin-heading">
					<div>
						<h1>Панель администратора</h1>
						<p>Вы вошли как {{ user.username }}</p>
					</div>
					<button type="button" class="logout-button" :disabled="loggingOut" @click="signOut">
						{{ loggingOut ? 'Выход...' : 'Выйти' }}
					</button>
				</div>

				<nav class="admin-tabs" aria-label="Разделы панели администратора">
					<button type="button" :class="{ active: activeTab === 'orders' }" :aria-pressed="activeTab === 'orders'" @click="activeTab = 'orders'">
						Заказы
					</button>
					<button type="button" :class="{ active: activeTab === 'products' }" :aria-pressed="activeTab === 'products'" @click="activeTab = 'products'">
						Добавить товар
					</button>
				</nav>

				<AdminOrders v-if="activeTab === 'orders'" />

				<section v-show="activeTab === 'products'" class="product-section">
					<div class="section-heading">
						<h2>Добавить товар</h2>
						<p>Заполните информацию для новой карточки товара.</p>
					</div>

					<form class="product-form" @submit.prevent="addProduct">
						<fieldset :disabled="saving" class="form-layout">
							<div class="form-main">
								<h3>Основная информация</h3>

								<div class="field">
									<label for="product-name">Название товара</label>
									<input id="product-name" v-model="form.name" type="text" minlength="2" maxlength="120" placeholder="Например, футболка 1С" required />
								</div>

								<div class="form-row">
									<div class="field">
										<label for="product-category">Категория</label>
										<select id="product-category" v-model="form.category_id" required>
											<option value="" disabled>Выберите категорию</option>
											<option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
										</select>
										<p v-if="categoriesError" class="field-error" role="alert">{{ categoriesError }}</p>
										<button v-if="categoriesError" type="button" class="text-button" @click="loadCategories">Повторить загрузку</button>
									</div>
									<div class="field">
										<label for="product-price">Цена, ₽</label>
										<input id="product-price" v-model="form.price" type="number" min="0.01" step="0.01" placeholder="0.00" required />
									</div>
								</div>

								<div class="field">
									<label for="product-description">Описание</label>
									<textarea id="product-description" v-model="form.description" rows="6" maxlength="3000" placeholder="Описание и характеристики товара"></textarea>
									<span class="field-hint">{{ form.description.length }} / 3000</span>
								</div>

								<div class="settings">
									<h3>Настройки отображения</h3>
									<label class="checkbox-row"><input v-model="form.active" type="checkbox" /><span>Активен</span></label>
									<label class="checkbox-row"><input v-model="form.is_new" type="checkbox" /><span>Новинка</span></label>
									<label class="checkbox-row"><input v-model="form.is_popular" type="checkbox" /><span>Популярное</span></label>
								</div>
							</div>

							<div class="form-media">
								<h3>Изображение товара</h3>
								<div class="image-preview">
									<img v-if="imagePreview" :src="imagePreview" alt="Предпросмотр товара" />
									<div v-else class="image-placeholder">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
											<rect x="3" y="3" width="18" height="18" rx="3" />
											<circle cx="9" cy="9" r="2" />
											<path d="m21 16-5-5L6 21" />
										</svg>
										<span>Изображение не выбрано</span>
									</div>
								</div>
								<div class="field">
									<label for="product-image">Загрузить изображение</label>
									<input id="product-image" ref="fileInput" class="file-input" type="file" accept="image/png,image/jpeg,image/webp" @change="onImageChange" />
									<span class="field-hint">PNG, JPEG или WebP, до 5 МБ</span>
									<p v-if="imageError" class="field-error" role="alert">{{ imageError }}</p>
									<button v-if="image || imageError" type="button" class="text-button" @click="resetImage">Удалить изображение</button>
								</div>
							</div>
						</fieldset>

						<p v-if="errorMessage" class="message message--error" role="alert">{{ errorMessage }}</p>
						<p v-if="successMessage" class="message message--success" role="status">{{ successMessage }}</p>

						<div class="form-actions">
							<button type="submit" class="primary-button" :disabled="saving || !categories.length || !!imageError">
								{{ saving ? 'Сохранение...' : 'Добавить товар' }}
							</button>
						</div>
					</form>
				</section>
			</template>
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

.admin-page {
	width: 100%;
	max-width: 1200px;
	box-sizing: border-box;
	flex: 1;
	margin: 0 auto;
	padding: 48px 0 80px;
	color: #222;
}

.admin-heading {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20px;
	margin-bottom: 32px;
}

.admin-heading h1 {
	margin: 0 0 10px;
	font-size: clamp(28px, 4vw, 36px);
	line-height: 1.2;
}

.admin-heading p,
.section-heading p {
	margin: 0;
	color: #777;
	font-size: 14px;
	line-height: 1.6;
}

.logout-button,
.primary-button,
.admin-tabs button {
	min-height: 46px;
	padding: 0 24px;
	box-sizing: border-box;
	border: 1px solid transparent;
	border-radius: 10px;
	font: inherit;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.logout-button {
	flex-shrink: 0;
	background: #fff;
	border-color: #e5e5e5;
	color: #555;
}

.logout-button:hover:not(:disabled) {
	border-color: #D71920;
	color: #D71920;
}

.admin-tabs {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	padding-bottom: 20px;
	margin-bottom: 28px;
	border-bottom: 1px solid #eee;
}

.admin-tabs button {
	background: #f5f5f5;
	color: #555;
}

.admin-tabs button:hover:not(.active) {
	background: #fce8ea;
	color: #D71920;
}

.admin-tabs button.active,
.primary-button {
	background: #D71920;
	color: #fff;
}

.primary-button:hover:not(:disabled) {
	background: #b9152b;
}

button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.section-heading {
	margin-bottom: 24px;
}

.section-heading h2 {
	margin: 0 0 8px;
	font-size: 24px;
}

.form-layout {
	min-width: 0;
	display: grid;
	grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
	align-items: start;
	gap: 24px;
	padding: 0;
	margin: 0;
	border: 0;
}

.form-main,
.form-media {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 22px;
	padding: 26px;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 16px;
}

.form-main h3,
.form-media h3 {
	margin: 0;
	font-size: 18px;
}

.form-row {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	gap: 16px;
}

.field {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.field label {
	font-size: 14px;
	font-weight: 600;
}

.field input,
.field select,
.field textarea {
	width: 100%;
	min-width: 0;
	min-height: 48px;
	padding: 12px 14px;
	box-sizing: border-box;
	background: #fff;
	border: 1px solid #e2e2e2;
	border-radius: 10px;
	color: #222;
	font: inherit;
	font-size: 14px;
}

.field textarea {
	min-height: 140px;
	resize: vertical;
}

.field input::placeholder,
.field textarea::placeholder {
	color: #999;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
	border-color: #D71920;
	outline: 1px solid #D71920;
}

button:focus-visible,
.checkbox-row input:focus-visible {
	outline: 2px solid #D71920;
	outline-offset: 2px;
}

.field-hint {
	color: #777;
	font-size: 12px;
}

.field-error {
	margin: 0;
	color: #a5161c;
	font-size: 13px;
}

.settings {
	display: grid;
	gap: 12px;
	padding-top: 20px;
	border-top: 1px solid #eee;
}

.settings h3 {
	margin-bottom: 4px;
}

.checkbox-row {
	display: flex;
	align-items: center;
	gap: 10px;
	min-height: 28px;
	font-size: 14px;
	cursor: pointer;
}

.checkbox-row input {
	width: 18px;
	height: 18px;
	margin: 0;
	accent-color: #D71920;
}

.image-preview {
	display: flex;
	align-items: center;
	justify-content: center;
	aspect-ratio: 1 / 1;
	max-height: 340px;
	overflow: hidden;
	background: #fafafa;
	border: 1px dashed #ddd;
	border-radius: 12px;
}

.image-preview img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.image-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	padding: 12px;
	color: #999;
	font-size: 13px;
	text-align: center;
}

.image-placeholder svg {
	width: 40px;
	height: 40px;
}

.field .file-input {
	padding: 8px;
	font-size: 12px;
}

.file-input::file-selector-button {
	margin-right: 10px;
	padding: 9px 12px;
	background: #f5f5f5;
	border: none;
	border-radius: 6px;
	color: #333;
	font: inherit;
	font-weight: 600;
	cursor: pointer;
}

.text-button {
	align-self: flex-start;
	padding: 0;
	background: none;
	border: none;
	color: #D71920;
	font: inherit;
	font-size: 13px;
	cursor: pointer;
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 24px;
}

.primary-button {
	min-height: 50px;
	min-width: 180px;
}

.loading {
	padding: 40px 0;
	color: #777;
	text-align: center;
}

.message {
	margin: 20px 0 0;
	padding: 12px 16px;
	border-radius: 10px;
	font-size: 14px;
}

.message--error {
	background: #fce8ea;
	color: #a5161c;
}

.message--success {
	background: #e8f6ed;
	color: #226a3d;
}

@media (max-width: 1240px) {
	.admin-page { padding: 40px 20px 80px; }
}

@media (max-width: 850px) {
	.form-layout { grid-template-columns: 1fr; }
	.image-preview { width: 100%; max-width: 350px; box-sizing: border-box; }
}

@media (max-width: 550px) {
	.admin-page { padding: 30px 16px 60px; }
	.admin-heading { align-items: flex-start; flex-direction: column; }
	.admin-tabs button { flex: 1; padding: 0 10px; white-space: nowrap; }
	.form-main, .form-media { padding: 16px; gap: 18px; }
	.form-row { grid-template-columns: 1fr; }
	.primary-button { width: 100%; }
}
</style>
