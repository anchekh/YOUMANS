
<template>
	<div class="info-page">
		<div class="info-card">
			<h1>Производственная практика в ООО «Юманс-ВЦ»</h1>
			<section class="info-section" style="border: none;">
				<h2>1. О проекте</h2>
                <p>
                    Интернет-магазин фирменной продукции 1С, разработанный
                    в рамках производственной практики. Проект позволяет
                    просматривать товары, добавлять их в корзину и избранное.
                    Для управления ассортиментом предусмотрена административная
                    панель, через которую можно добавлять новые товары в каталог.
                </p>
			</section>

			<section class="info-section">
				<h2>2. Стек технологий</h2>
				<ul>
					<li v-for="item in technologies" :key="item">
						{{ item }}
					</li>
				</ul>
			</section>

			<section class="info-section">
				<h2>3. Реализованные страницы / Реализованные не полностью</h2>
				<ul>
					<li v-for="page in implementedPages" :key="page">
						{{ page }}
					</li>
				</ul>
			</section>

			<section class="info-section">
				<h2>4. Нереализованные страницы (отсутствующие)</h2>
				<ul>
					<li v-for="page in plannedPages" :key="page">
						{{ page }}
					</li>
				</ul>
			</section>

			<section class="info-section">
				<h2>5. Авторизация</h2>
				<h3>Для обычных пользователей</h3>
				<p>
					Можно зарегистрироваться, указав собственные данные,
					и войти в созданную учётную запись.
				</p>
			</section>

			<section class="info-section">
				<h2>6. Вход в административную панель</h2>
				<p>
					Для просмотра данных администратора
					введите дату начала производственной практики.
				</p>

				<div class="access-form">
					<label for="practice-date">Дата начала практики:</label>
					<input
						id="practice-date"
						v-model="enteredDate"
						type="date"
					>

					<div v-if="isDateCorrect" class="credentials">
						<p><strong>Логин:</strong> {{ adminLogin }}</p>
						<p><strong>Пароль:</strong> {{ adminPassword }}</p>
					</div>

					<p v-else-if="enteredDate" class="error">
						Неверная дата.
					</p>
				</div>
			</section>
            <div class="navigation">
				<NuxtLink to="/">На главную</NuxtLink>
				<NuxtLink to="/store">В магазин</NuxtLink>
			</div>
		</div>
	</div>
</template>

<script setup>
const technologies = [
	'Nuxt',
	'Vue 3',
	'TypeScript',
	'Supabase',
	'HTML',
	'CSS',
	'GitHub Pages'
]

const implementedPages = [
	'Главная страница магазина',
	'Каталог товаров',
	'Карточка товара',
	'Корзина',
	'Избранное',
    'Страница авторизации',
    'Личный кабинет пользователя',
    'Административная панель'
]

const plannedPages = [
	'Контакты',
	'О магазине',
	'Политика конфиденциальности',
    'Доставка и оплата',
]

const practiceStartDate = '2026-11-03'
const adminLogin = 'admin'
const adminPassword = 'admin12345'

const enteredDate = ref('')

const isDateCorrect = computed(() =>
	enteredDate.value === practiceStartDate
)
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
	max-width: 720px;
	padding: 40px;
	border: 2px solid #000;
	border-radius: 0;
	background: #fff;
	color: #000;
	box-sizing: border-box;
}

.navigation {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}

h1 {
	margin: 0 0 16px;
	font-size: 24px;
	font-weight: 700;
	text-align: center;
	line-height: 1.4;
}

.info-section {
	padding: 24px 0;
	border-top: 1px solid #000;
}

.info-section h2 {
	margin: 0 0 16px;
	font-size: 17px;
	font-weight: 700;
	line-height: 1.5;
}

.info-section h3 {
	margin: 0 0 12px;
	font-size: 14px;
	font-weight: 700;
}

.info-section p {
	margin: 0;
	font-size: 14px;
	line-height: 1.8;
}

.info-section ul {
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: 0;
	padding-left: 20px;
    list-style-type: square;
}

.info-section li {
	font-size: 14px;
	line-height: 1.6;
}

.access-form {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-top: 24px;
}

.access-form label {
	font-size: 14px;
	font-weight: 700;
}

.access-form input {
	width: 100%;
	padding: 14px;
	border: 2px solid #000;
	border-radius: 0;
	background: #fff;
	color: #000;
	font: inherit;
	font-size: 14px;
	box-sizing: border-box;
	outline: none;
}

.access-form input:focus {
	outline: 1px solid #000;
	outline-offset: 3px;
}

.credentials {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-top: 8px;
	padding: 20px;
	border: 2px solid #000;
	background: #fff;
	overflow-wrap: anywhere;
}

.credentials p {
	margin: 0;
}

.error {
	color: #000;
	font-size: 13px;
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

	.navigation {
		gap: 8px;
	}

	.navigation a {
		padding: 12px 8px;
		font-size: 12px;
	}

	.info-section h2 {
		font-size: 16px;
	}
}
</style>
