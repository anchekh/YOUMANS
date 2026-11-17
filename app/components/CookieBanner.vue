<script setup lang="ts">
const consent = useCookie<'accepted' | 'rejected' | null>('youmans-cookie-consent', {
	default: () => null,
	maxAge: 60 * 60 * 24 * 365,
	sameSite: 'lax',
	path: '/'
})
</script>

<template>
	<Transition name="cookie">
		<div v-if="!consent" class="cookie-banner">
			<div class="cookie-content">
				<h3>Мы используем cookie</h3>
				<p>
					Мы используем файлы cookie для корректной работы сайта
					и улучшения пользовательского опыта.
				</p>
			</div>

			<div class="cookie-actions">
				<button class="cookie-reject" @click="consent = 'rejected'">
					Отклонить
				</button>

				<button class="cookie-accept" @click="consent = 'accepted'">
					Принять
				</button>
			</div>
		</div>
	</Transition>
</template>

<style scoped>
.cookie-banner {
	position: fixed;
	bottom: 20px;
	left: 50%;
	transform: translateX(-50%);
	z-index: 1000;
	width: calc(100% - 40px);
	max-width: 600px;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	padding: 24px;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 16px;
	box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
	text-align: center;
}

.cookie-content h3 {
	margin: 0 0 12px;
	font-size: 18px;
	font-weight: 700;
}

.cookie-content p {
	margin: 0;
	color: #777;
	font-size: 14px;
	line-height: 1.6;
}

.cookie-actions {
	display: flex;
	justify-content: center;
	gap: 12px;
}

.cookie-actions button {
	min-height: 48px;
	padding: 0 28px;
	border: none;
	border-radius: 12px;
	font: inherit;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.2s;
}

.cookie-reject {
	background: #f5f5f5;
	color: #333;
}

.cookie-reject:hover {
	background: #eaeaea;
}

.cookie-accept {
	background: #D71920;
	color: #fff;
}

.cookie-accept:hover {
	background: #b9152b;
}

.cookie-enter-active,
.cookie-leave-active {
	transition: opacity 0.3s, transform 0.3s;
}

.cookie-enter-from,
.cookie-leave-to {
	opacity: 0;
	transform: translate(-50%, 20px);
}

@media (max-width: 600px) {
	.cookie-banner {
		bottom: 16px;
		width: calc(100% - 32px);
		padding: 20px;
	}

	.cookie-actions button {
		padding: 0 20px;
	}
}
</style>