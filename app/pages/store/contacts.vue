<script setup lang="ts">
const heroImage = `${useRuntimeConfig().app.baseURL}images/contacts.png`

const glowRef = ref<HTMLDivElement | null>(null)

const moveGlow = (event: PointerEvent) => {
	if (!glowRef.value) return

	const hero = event.currentTarget as HTMLElement
	const rect = hero.getBoundingClientRect()

	const x = event.clientX - rect.left - 225
	const y = event.clientY - rect.top - 225

	glowRef.value.style.transform = `translate3d(${x}px, ${y}px, 0)`
}

useHead({
	title: 'Контакты — Юманс-ВЦ'
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

					<h1>Контакты</h1>

					<p>
                        Поможем вам с выбором фирменной продукции 1С, 
                        ответим на вопросы об оформлении заказов, условиях 
                        оплаты и доставки. Свяжитесь с нами удобным для вас способом.
					</p>

					<a href="#contacts" class="hero-button">
						Связаться с нами
						<span aria-hidden="true">→</span>
					</a>
				</div>

				<div class="hero-image">
					<img :src="heroImage" alt="" />
				</div>
			</section>

			<section id="contacts" class="contacts-section">
				<h2>Свяжитесь с нами</h2>

				<div class="contacts-grid">
					<article class="contact-card">
						<div class="contact-icon">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M22 16.92v3a2 2 0 0 1-2.18 2 18.4 18.4 0 0 1-8.05-2.86 18 18 0 0 1-5.5-5.5 18.4 18.4 0 0 1-2.86-8.09A2 2 0 0 1 5.4 3.3h3a2 2 0 0 1 2 1.72l.55 3.03a2 2 0 0 1-.57 2.02l-1.27 1.27a14 14 0 0 0 5.5 5.5l1.27-1.27a2 2 0 0 1 2.02-.57l2.38.35A2 2 0 0 1 22 16.92Z" />
							</svg>
						</div>

						<h3>Телефон</h3>
						<p>Для консультаций и вопросов по заказам.</p>

						<a href="tel:+79999999999">
							+7 (999) 999-99-99
						</a>
					</article>

					<article class="contact-card">
						<div class="contact-icon">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="3" y="5" width="18" height="14" rx="2" />
								<path d="m3 7 9 6 9-6" />
							</svg>
						</div>

						<h3>Электронная почта</h3>
						<p>Для обращений и деловой переписки.</p>

						<a href="mailto:email@1c.ru">
							email@1c.ru
						</a>
					</article>

					<article class="contact-card">
						<div class="contact-icon">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
							</svg>
						</div>

						<h3>Социальные сети</h3>
						<p>Следите за новостями и обновлениями.</p>

						<div class="social-links">
							<a href="https://vk.com/" target="_blank" rel="noopener noreferrer">
								ВКонтакте
							</a>

							<a href="https://t.me/" target="_blank" rel="noopener noreferrer">
								Telegram
							</a>
						</div>
					</article>
				</div>
			</section>

			<section class="info-section">
				<h2>По вопросам заказов</h2>

				<p>
					Если у вас возникли вопросы по оформлению, оплате,
					доставке или возврату товара, свяжитесь с нами
					удобным для вас способом.
				</p>

				<p>
					При обращении по уже оформленному заказу укажите
					его номер. Это поможет быстрее обработать ваш запрос.
					Номер заказа и его текущий статус доступны
					в личном кабинете.
				</p>

				<NuxtLink to="/store/account" class="account-link">
					Перейти в личный кабинет →
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

.contacts-section,
.info-section {
	margin-top: 60px;
	scroll-margin-top: 160px;
}

.contacts-section h2,
.info-section h2 {
	margin: 0 0 24px;
	font-size: 28px;
	font-weight: 700;
}

.contacts-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 20px;
}

.contact-card {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	padding: 30px;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 16px;
}

.contact-icon {
	width: 52px;
	height: 52px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #e51a24;
	color: #fff;
	border-radius: 12px;
	margin-bottom: 24px;
}

.contact-icon svg {
	width: 26px;
	height: 26px;
}

.contact-card h3 {
	margin: 0 0 12px;
	font-size: 20px;
	font-weight: 700;
}

.contact-card p {
	margin: 0 0 24px;
	color: #777;
	font-size: 14px;
	line-height: 1.6;
}

.contact-card a {
	color: #e51a24;
	font-size: 16px;
	font-weight: 600;
	text-decoration: none;
	overflow-wrap: anywhere;
}

.contact-card a:hover {
	color: #b9152b;
}

.contact-card > a,
.social-links {
	margin-top: auto;
}

.social-links {
	display: flex;
	flex-wrap: wrap;
	gap: 10px 20px;
}

.info-section p {
	max-width: 900px;
	margin: 0 0 16px;
	color: #666;
	font-size: 16px;
	line-height: 1.8;
}

.account-link {
	display: inline-block;
	margin-top: 8px;
	color: #e51a24;
	font-weight: 600;
	text-decoration: none;
}

.account-link:hover {
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
	.hero-content,
	.contact-card {
		padding: 24px;
	}
}

@media (max-width: 800px) {
	.contacts-grid {
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

	.hero-image {
		height: 260px;
	}

	.contacts-section,
	.info-section {
		margin-top: 40px;
	}

	.contacts-section h2,
	.info-section h2 {
		font-size: 24px;
	}

	.contacts-grid {
		grid-template-columns: 1fr;
	}

	.info-section p {
		font-size: 14px;
	}
}
</style>