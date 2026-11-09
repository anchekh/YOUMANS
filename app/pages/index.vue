<template>
	<div class="info-page">
		<div class="info-card">
			<h1>Производственная практика в ООО «Юманс-ВЦ»</h1>
			<div class="students">
				<div v-for="student in students" :key="student.id">
					<span>{{ student.name }}</span>
				</div>
			</div>
			<NuxtLink to="/store">Перейти в магазин</NuxtLink>
		</div>
	</div>
</template>

<script setup>
const students = [
  { id: 1, name: 'Венидиктова Вероника Евгеньевна'},
  { id: 2, name: 'Дубровин Антон Андреевич'},
  { id: 3, name: 'Елесин Никита Константинович'},
  { id: 4, name: 'Караванова Дарья Вадимовна'},
  { id: 5, name: 'Кочетов Роман Владимирович'},
]
</script>

<style scoped>
.info-page {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
	box-sizing: border-box;
	background: #fff;
	font-family: monospace;
}

.info-card {
	width: 100%;
	max-width: 560px;
	padding: 40px;
	border: 2px solid #000;
	border-radius: 0;
	background: #fff;
	color: #000;
	box-sizing: border-box;
}

h1 {
	margin: 0 0 32px;
	font-size: 24px;
	font-weight: 700;
  text-align: center;
}

.students {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-bottom: 32px;
}

.students span {
	font-size: 15px;
	line-height: 1.5;
}

a {
	display: block;
	padding: 14px 20px;
	border: 2px solid #000;
	background: #000;
	color: #fff;
	font: inherit;
	font-size: 14px;
	text-align: center;
	text-decoration: none;
	transition: background 0.2s, color 0.2s;
}

a:hover {
	background: #fff;
	color: #000;
}

@media (max-width: 600px) {
	.info-card {
		padding: 24px;
	}

	h1 {
		font-size: 20px;
	}
}
</style>