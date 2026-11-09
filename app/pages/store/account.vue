<script setup lang="ts">
const { user, initialize, logout } = useShopAuth()

const checking = ref(true)

const signOut = async () => {
	await logout()
	await navigateTo('/store/login')
}

onMounted(async () => {
	try {
		await initialize()

		if (!user.value) {
			await navigateTo('/store/login')
			return
		}

		if (user.value.role === 'admin') {
			await navigateTo('/store/admin')
			return
		}
	} finally {
		checking.value = false
	}
})
</script>

<template>
	<div class="page">
		<AppHeader />
		<main class="store">
			<p v-if="checking">Проверка доступа...</p>

			<div v-else-if="user?.role === 'user'" class="account-content">
				<div>
					<h1>Личный кабинет</h1>
					<p>Вы вошли как {{ user.username }}</p>
				</div>

				<button type="button" class="logout-button" @click="signOut">
					Выйти
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
	padding: 40px 20px 80px;
}

.account-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24px;
}

.account-content h1 {
	margin: 0 0 12px;
	font-size: 32px;
	font-weight: 700;
}

.account-content p {
	margin: 0;
	color: #777;
	font-size: 16px;
}

.logout-button {
	min-height: 44px;
	padding: 0 24px;
	background: #e51a24;
	border: none;
	border-radius: 12px;
	color: #fff;
	font: inherit;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.2s;
}

.logout-button:hover {
	background: #b9152b;
}

@media (max-width: 600px) {
	.account-content {
		align-items: flex-start;
		flex-direction: column;
	}

	.account-content h1 {
		font-size: 28px;
	}
}
</style>