<script setup lang="ts">
const heroImage = `${useRuntimeConfig().app.baseURL}images/delivery.png`

const glowRef = ref<HTMLDivElement | null>(null)

const moveGlow = (event: PointerEvent) => {
	if (!glowRef.value) return

	const hero = event.currentTarget as HTMLElement
	const rect = hero.getBoundingClientRect()

	const x = event.clientX - rect.left - 225
	const y = event.clientY - rect.top - 225

	glowRef.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
}

const steps = [
	{
		title: 'Выберите товары',
		description: 'Добавьте понравившуюся фирменную продукцию в корзину.'
	},
	{
		title: 'Оформите заказ',
		description: 'Укажите контактные данные, адрес доставки и способ оплаты.'
	},
	{
		title: 'Дождитесь подтверждения',
		description: 'Менеджер свяжется с вами для согласования деталей заказа.'
	},
	{
		title: 'Получите заказ',
		description: 'Получите товары и оплатите заказ выбранным способом.'
	}
]

useHead({
	title: 'Доставка и оплата — Юманс-ВЦ'
})
</script>

<template>
	<div class="page">
		<AppHeader />

		<main class="store">
			<section
				class="hero"
				@pointerenter="moveGlow"
				@pointermove="moveGlow"
			>
				<div ref="glowRef" class="hero-glow"></div>

				<div class="hero-content">
					<span class="hero-label">
						ЮМАНС-ВЦ — ОФИЦИАЛЬНЫЙ ПАРТНЁР 1С
					</span>

					<h1>Доставка и оплата</h1>

					<p>
						Выбирайте удобный способ оплаты, оформляйте
						заказ и получайте фирменную продукцию 1С
						по указанному адресу. Мы поможем согласовать
						все детали доставки.
					</p>

					<NuxtLink to="/store/catalog" class="hero-button">
						Смотреть мерч
						<span aria-hidden="true">→</span>
					</NuxtLink>
				</div>

				<div class="hero-image">
					<img :src="heroImage" alt="" />
				</div>
			</section>

			<section class="info-section">
				<h2>Доставка заказа</h2>

				<div class="info-grid">
					<article class="info-card">
						<div class="info-icon">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<rect x="1" y="3" width="15" height="13" rx="1" />
								<path d="M16 8h4l3 4v4h-7" />
								<circle cx="5.5" cy="18.5" r="2.5" />
								<circle cx="18.5" cy="18.5" r="2.5" />
							</svg>
						</div>

						<h3>Доставка по адресу</h3>

						<p>
							При оформлении заказа укажите город,
							адрес доставки и контактные данные.
							При необходимости оставьте комментарий
							с дополнительной информацией.
						</p>
					</article>

					<article class="info-card">
						<div class="info-icon">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<circle cx="12" cy="12" r="10" />
								<path d="M12 6v6l4 2" />
							</svg>
						</div>

						<h3>Сроки и стоимость доставки</h3>

						<p>
							Сроки и стоимость доставки зависят
							от местоположения получателя и состава
							заказа. Подробные условия уточняются
							при согласовании заказа с менеджером.
						</p>
					</article>
				</div>
			</section>

			<section class="info-section">
				<h2>Способы оплаты</h2>

				<div class="info-grid">
					<article class="info-card">
						<div class="info-icon">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<rect x="2" y="4" width="20" height="16" rx="3" />
								<path d="M2 10h20M6 16h4" />
							</svg>
						</div>

						<h3>Картой при получении</h3>

						<p>
							Вы можете оплатить заказ банковской
							картой непосредственно при получении
							товаров. Предварительная оплата
							на сайте не требуется.
						</p>
					</article>

					<article class="info-card">
						<div class="info-icon">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<rect x="2" y="5" width="20" height="14" rx="2" />
								<circle cx="12" cy="12" r="3" />
								<path d="M6 12h.01M18 12h.01" />
							</svg>
						</div>

						<h3>Наличными при получении</h3>

						<p>
							Оплатите заказ наличными при получении
							фирменной продукции. Выбрать данный
							способ оплаты можно на странице
							оформления заказа.
						</p>
					</article>
				</div>
			</section>

			<section class="info-section">
				<h2>Как оформить заказ?</h2>

				<div class="steps-grid">
					<article
						v-for="(step, index) in steps"
						:key="step.title"
						class="step"
					>
						<span class="step-number">
							{{ String(index + 1).padStart(2, '0') }}
						</span>

						<h3>{{ step.title }}</h3>
						<p>{{ step.description }}</p>
					</article>
				</div>
			</section>

			<section class="info-section">
				<h2>Отслеживание заказа</h2>

				<p>
					Информация обо всех оформленных заказах доступна
					в личном кабинете. Вы можете посмотреть текущий
					статус заказа, список приобретённых товаров,
					их стоимость и выбранный способ оплаты.
				</p>

				<NuxtLink to="/store/account" class="text-link">
					Перейти в личный кабинет →
				</NuxtLink>
			</section>

			<section class="info-section">
				<h2>Остались вопросы?</h2>

				<p>
					Если вам необходима дополнительная информация
					об условиях доставки или способах оплаты,
					свяжитесь с нами удобным для вас способом.
				</p>

				<NuxtLink to="/store/contacts" class="text-link">
					Связаться с нами →
				</NuxtLink>
			</section>
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
	padding: 30px 0 80px;
}

.hero {
	position: relative;
	isolation: isolate;
	min-height: 400px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: center;
	gap: 20px;
	background: #fff;
	border-radius: 20px;
	overflow: hidden;
}

.hero-glow {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 0;
	width: 450px;
	height: 450px;
	border-radius: 50%;
	background: radial-gradient(
		circle,
		#ffdd00 0%,
		rgba(255, 221, 0, 0.65) 25%,
		rgba(255, 221, 0, 0.3) 45%,
		rgba(255, 221, 0, 0.1) 60%,
		transparent 75%
	);
	pointer-events: none;
	opacity: 0;
	transform: translate3d(-500px, -500px, 0);
	transition: opacity 0.3s ease;
	will-change: transform;
}

.hero:hover .hero-glow {
	opacity: 1;
}

.hero-content,
.hero-image {
	position: relative;
	z-index: 1;
}

.hero-content {
	padding: 50px;
}

.hero-label {
	color: #e51a24;
	font-size: 13px;
	font-weight: 700;
	letter-spacing: 1px;
}

.hero h1 {
	margin: 20px 0;
	font-size: clamp(32px, 4vw, 46px);
	font-weight: 800;
	line-height: 1.2;
}

.hero p {
	max-width: 420px;
	margin: 0 0 30px;
	color: #666;
	font-size: 16px;
	line-height: 1.7;
}

.hero-button {
	height: 60px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 20px;
	padding: 0 24px;
	background: #e51a24;
	color: #fff;
	border-radius: 12px;
	text-decoration: none;
	font-weight: 600;
	transition: background 0.2s;
}

.hero-button:hover {
	background: #b9152b;
}

.hero-image {
	height: 400px;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	align-self: end;
	pointer-events: none;
}

.hero-image img {
	display: block;
	width: auto;
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
	object-position: bottom;
}

.info-section {
	margin-top: 60px;
}

.info-section h2 {
	margin: 0 0 24px;
	font-size: 28px;
	font-weight: 700;
}

.info-section > p {
	max-width: 900px;
	margin: 0 0 16px;
	color: #666;
	font-size: 16px;
	line-height: 1.8;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 20px;
}

.info-card {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	padding: 30px;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 16px;
}

.info-icon {
	width: 52px;
	height: 52px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24px;
	background: #e51a24;
	color: #fff;
	border-radius: 12px;
}

.info-icon svg {
	width: 26px;
	height: 26px;
}

.info-card h3,
.step h3 {
	margin: 0 0 12px;
	font-size: 20px;
	font-weight: 700;
}

.info-card p,
.step p {
	margin: 0;
	color: #777;
	font-size: 15px;
	line-height: 1.7;
}

.steps-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 20px;
}

.step {
	padding: 24px;
	background: #fafafa;
	border-radius: 16px;
}

.step-number {
	display: block;
	margin-bottom: 20px;
	color: #e51a24;
	font-size: 48px;
	font-weight: 800;
	line-height: 1;
}

.step h3 {
	font-size: 18px;
}

.step p {
	font-size: 14px;
}

.text-link {
	display: inline-block;
	margin-top: 8px;
	color: #e51a24;
	font-weight: 600;
	text-decoration: none;
}

.text-link:hover {
	color: #b9152b;
}

@media (hover: none) {
	.hero-glow {
		display: none;
	}
}

@media (prefers-reduced-motion: reduce) {
	.hero-glow {
		display: none;
	}

	.hero-button {
		transition: none;
	}
}

@media (max-width: 1240px) {
	.store {
		padding: 30px 20px 80px;
	}
}

@media (max-width: 950px) {
	.hero-content {
		padding: 30px;
	}

	.steps-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 650px) {
	.hero {
		grid-template-columns: 1fr;
		gap: 0;
	}

	.hero-content {
		padding: 30px 24px;
	}

	.hero h1 {
		font-size: 32px;
	}

	.hero-image {
		height: 260px;
	}

	.info-section {
		margin-top: 40px;
	}

	.info-section h2 {
		font-size: 24px;
	}

	.info-grid {
		grid-template-columns: 1fr;
	}

	.info-card,
	.step {
		padding: 20px;
	}
}

@media (max-width: 400px) {
	.steps-grid {
		grid-template-columns: 1fr;
	}
}
</style>