<script setup lang="ts">
const { user, initialize, logout } = useShopAuth()

const checking = ref(true)
const loggingOut = ref(false)

const userInitial = computed(() => {
	return user.value?.username?.charAt(0).toUpperCase() || 'U'
})

const signOut = async () => {
	if (loggingOut.value) return

	loggingOut.value = true

	try {
		await logout()
		await navigateTo('/store/login')
	} finally {
		loggingOut.value = false
	}
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

		<main class="account-page">
			<div v-if="checking" class="account-loading">
				<p>Проверка доступа...</p>
			</div>

			<template v-else-if="user?.role === 'user'">
				<div class="account-heading">
					<h1>Личный кабинет</h1>
					<p>Управляйте своими заказами и отслеживайте их статус.</p>
				</div>

				<div class="account-layout">
					<aside class="profile-card">
						<div class="profile-card__user">
							<div class="profile-card__avatar">
								{{ userInitial }}
							</div>

							<div class="profile-card__info">
								<h2>{{ user.username }}</h2>
								<span>Покупатель</span>
							</div>
						</div>

						<div class="profile-card__divider"></div>

						<div class="profile-card__actions">
							<NuxtLink
								to="/store/catalog"
								class="profile-card__catalog"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d="M3 3h2l2.5 12h12L22 7H6" />
									<circle cx="9" cy="20" r="1" />
									<circle cx="19" cy="20" r="1" />
								</svg>

								Перейти в каталог
							</NuxtLink>

							<button
								type="button"
								class="profile-card__logout"
								:disabled="loggingOut"
								@click="signOut"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
									<path d="m16 17 5-5-5-5" />
									<path d="M21 12H9" />
								</svg>

								{{ loggingOut ? 'Выход...' : 'Выйти из аккаунта' }}
							</button>
						</div>
					</aside>

					<section class="account-orders">
						<OrderHistory />
					</section>
				</div>
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

.account-page {
	width: 100%;
	max-width: 1200px;
	flex: 1;
	box-sizing: border-box;
	margin: 0 auto;
	padding: 48px 0 100px;
}

.account-loading {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 300px;
	color: #777;
	font-size: 16px;
}

.account-heading {
	margin-bottom: 40px;
}

.account-heading h1 {
	margin: 0 0 12px;
	color: #222;
	font-size: clamp(28px, 4vw, 40px);
	font-weight: 800;
	line-height: 1.2;
}

.account-heading p {
	margin: 0;
	color: #777;
	font-size: 15px;
	line-height: 1.6;
}

.account-layout {
	display: grid;
	grid-template-columns: 280px minmax(0, 1fr);
	align-items: start;
	gap: 28px;
}

.profile-card {
	min-width: 0;
	padding: 24px;
	box-sizing: border-box;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 16px;
}

.profile-card__user {
	display: flex;
	align-items: center;
	gap: 14px;
}

.profile-card__avatar {
	width: 56px;
	height: 56px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fce8ea;
	border-radius: 50%;
	color: #D71920;
	font-size: 24px;
	font-weight: 800;
}

.profile-card__info {
	min-width: 0;
}

.profile-card__info h2 {
	margin: 0 0 5px;
	color: #222;
	font-size: 18px;
	font-weight: 700;
	overflow-wrap: anywhere;
}

.profile-card__info span {
	color: #999;
	font-size: 13px;
}

.profile-card__divider {
	width: 100%;
	height: 1px;
	margin: 24px 0;
	background: #eee;
}

.profile-card__actions {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.profile-card__catalog,
.profile-card__logout {
	width: 100%;
	min-height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	padding: 0 14px;
	box-sizing: border-box;
	border-radius: 12px;
	font: inherit;
	font-size: 14px;
	font-weight: 600;
	text-decoration: none;
	cursor: pointer;
	transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.profile-card__catalog {
	background: #D71920;
	border: 1px solid #D71920;
	color: #fff;
}

.profile-card__catalog:hover {
	background: #b9152b;
	border-color: #b9152b;
}

.profile-card__logout {
	background: #fff;
	border: 1px solid #e5e5e5;
	color: #555;
}

.profile-card__logout:hover:not(:disabled) {
	border-color: #D71920;
	color: #D71920;
}

.profile-card__logout:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.profile-card__actions svg {
	width: 18px;
	height: 18px;
	flex-shrink: 0;
}

.account-orders {
	min-width: 0;
}

.account-orders :deep(.history) {
	margin-top: 0;
}

.account-orders :deep(.history-heading) {
	margin-bottom: 24px;
}

.account-orders :deep(.history-heading h2) {
	color: #222;
	font-size: 26px;
	font-weight: 700;
}

.account-orders :deep(.order) {
	margin-bottom: 20px;
	padding: 24px;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 16px;
}

.account-orders :deep(.order-heading h3) {
	color: #222;
	font-size: 18px;
	font-weight: 700;
}

.account-orders :deep(.secondary-button) {
	border-radius: 10px;
}

.account-orders :deep(.empty) {
	padding: 60px 24px;
	background: #fafafa;
	border: 1px solid #f1f1f1;
	border-radius: 16px;
}

@media (max-width: 1240px) {
	.account-page {
		padding: 40px 20px 80px;
	}
}

@media (max-width: 900px) {
	.account-layout {
		grid-template-columns: 1fr;
		gap: 36px;
	}

	.profile-card {
		padding: 20px;
	}

	.profile-card__actions {
		flex-direction: row;
	}

	.profile-card__catalog,
	.profile-card__logout {
		flex: 1;
	}
}

@media (max-width: 600px) {
	.account-page {
		padding: 30px 16px 60px;
	}

	.account-heading {
		margin-bottom: 28px;
	}

	.account-heading p {
		font-size: 14px;
	}

	.account-layout {
		gap: 32px;
	}

	.profile-card {
		padding: 20px;
	}

	.profile-card__avatar {
		width: 48px;
		height: 48px;
		font-size: 20px;
	}

	.profile-card__actions {
		flex-direction: column;
	}

	.account-orders :deep(.history-heading h2) {
		font-size: 22px;
	}

	.account-orders :deep(.order) {
		padding: 16px;
	}
}
</style>