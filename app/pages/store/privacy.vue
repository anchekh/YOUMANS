<script setup lang="ts">
useHead({
	title: 'Политика конфиденциальности — Юманс-ВЦ'
})
</script>

<template>
	<div class="page">
		<AppHeader />

		<main class="store">
			<h1>Политика конфиденциальности</h1>

			<p>
				Данный интернет-магазин разработан в рамках производственной
				практики и является демонстрационным проектом. Введённые
				пользователями данные используются для тестирования функций
				сайта, регистрации и оформления заказов. Просим не указывать
				реальные персональные данные при использовании сайта.
			</p>
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

h1 {
	margin: 0 0 24px;
	font-size: 32px;
	font-weight: 700;
}

p {
	max-width: 900px;
	margin: 0;
	color: #666;
	font-size: 16px;
	line-height: 1.8;
}

@media (max-width: 1240px) {
	.store {
		padding: 40px 20px 80px;
	}
}

@media (max-width: 600px) {
	h1 {
		font-size: 26px;
	}

	p {
		font-size: 14px;
	}
}
</style>