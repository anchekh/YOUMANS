<script setup lang="ts">
const mode = ref<'login' | 'register'>('login')
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const { user, initialize, login, register } = useShopAuth()

const submit = async () => {
	if (loading.value) return

	loading.value = true
	errorMessage.value = ''

	try {
		const account = mode.value === 'register'
			? await register(username.value, password.value)
			: await login(username.value, password.value)

		await navigateTo(
	        account.role === 'admin' ? '/store/admin' : '/store/account'
        )
	} catch (error) {
		errorMessage.value = error instanceof Error
			? error.message
			: 'Не удалось выполнить вход'
	} finally {
		loading.value = false
	}
}

const changeMode = (value: 'login' | 'register') => {
	mode.value = value
	errorMessage.value = ''
}

onMounted(async () => {
	await initialize()

	if (user.value) {
		await navigateTo(
	        user.value.role === 'admin' ? '/store/admin' : '/store/account'
        )
	}
})
</script>

<template>
	<div class="page">
		<AppHeader />
		<main class="auth-content">
			<div class="auth-card">
				<h1>{{ mode === 'login' ? 'Вход' : 'Регистрация' }}</h1>
				<p class="auth-description">
					{{ mode === 'login'
						? 'Войдите в свой аккаунт'
						: 'Создайте аккаунт'
					}}
				</p>
				<form @submit.prevent="submit">
					<label for="username">Логин</label>
					<input
						id="username"
						v-model="username"
						type="text"
						autocomplete="username"
						placeholder="Введите логин"
						minlength="3"
						maxlength="24"
						pattern="[A-Za-z0-9_]{3,24}"
						required
					/>
					<label for="password">Пароль</label>
					<input
						id="password"
						v-model="password"
						type="password"
						:autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
						placeholder="Введите пароль"
						required
					/>
					<p v-if="errorMessage" class="error-message">
						{{ errorMessage }}
					</p>
					<button type="submit" class="submit-button" :disabled="loading">
						{{ loading
							? 'Подождите...'
							: mode === 'login' ? 'Войти' : 'Зарегистрироваться'
						}}
					</button>
				</form>
				<p class="switch-mode">
					{{ mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
					<button
						type="button"
						@click="changeMode(mode === 'login' ? 'register' : 'login')"
					>
						{{ mode === 'login' ? 'Регистрация' : 'Войти' }}
					</button>
				</p>
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

.auth-content {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
}

.auth-card {
	width: 100%;
	max-width: 420px;
	padding: 40px;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 20px;
}

.auth-card h1 {
	margin: 0 0 12px;
	font-size: 32px;
	font-weight: 800;
}

.auth-description {
	margin: 0 0 30px;
	color: #777;
	font-size: 14px;
}

.auth-card form {
	display: flex;
	flex-direction: column;
}

.auth-card label {
	margin-bottom: 8px;
	font-size: 14px;
	font-weight: 600;
}

.auth-card input {
	width: 100%;
	height: 52px;
	box-sizing: border-box;
	margin-bottom: 20px;
	padding: 0 16px;
	background: #fff;
	border: 1px solid #e5e5e5;
	border-radius: 12px;
	color: #222;
	font: inherit;
	font-size: 15px;
	outline: none;
}

.auth-card input:focus {
	border-color: #E51A24;
}

.submit-button {
	height: 52px;
	margin-top: 10px;
	background: #E51A24;
	border: none;
	border-radius: 12px;
	color: #fff;
	font: inherit;
	font-weight: 600;
	cursor: pointer;
}

.submit-button:hover:not(:disabled) {
	background: #b9152b;
}

.submit-button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.error-message {
	margin: 0 0 12px;
	color: #E51A24;
	font-size: 13px;
}

.switch-mode {
	margin: 24px 0 0;
	color: #777;
	font-size: 14px;
	text-align: center;
}

.switch-mode button {
	padding: 0;
	background: transparent;
	border: none;
	color: #E51A24;
	font: inherit;
	font-weight: 600;
	cursor: pointer;
}

@media (max-width: 500px) {
	.auth-card {
		padding: 28px 24px;
	}
}
</style>
