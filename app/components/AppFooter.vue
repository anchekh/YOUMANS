<script setup lang="ts">
const logoUrl = `${useRuntimeConfig().app.baseURL}images/logo.png`
</script>

<template>
	<footer class="footer">
		<div class="footer-inner">
			<div class="footer-brand">
				<NuxtLink to="/store" class="footer-logo" aria-label="Главная">
					<img :src="logoUrl" alt="Логотип магазина" />
				</NuxtLink>
				<span class="copyright">© 2026 Все права защищены</span>
			</div>
			<nav class="footer-nav" aria-label="Навигация по магазину">
				<NuxtLink to="/store/catalog">Каталог</NuxtLink>
				<NuxtLink to="/store/delivery">Доставка и оплата</NuxtLink>
				<NuxtLink to="/store/contacts">Контакты</NuxtLink>
				<NuxtLink to="/store/about">О магазине</NuxtLink>
				<NuxtLink to="/store/privacy">Политика конфиденциальности</NuxtLink>
				<NuxtLink to="/about" style="color: #D71920;">О ПРОЕКТЕ</NuxtLink>
			</nav>
			<div class="footer-contact">
				<a href="mailto:email@1c.ru">email@1c.ru</a>
				<a href="tel:+79999999999">+7 (999) 999-99-99</a>
				<div class="socials">
					<a
						href="https://vk.com/"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="ВКонтакте"
						title="ВКонтакте"
					>
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path d="M12.79 17.49C5.93 17.49 2.02 12.79 1.86 5h3.46c.11 5.72 2.63 8.15 4.63 8.65V5h3.26v4.94c1.97-.21 4.04-2.47 4.74-4.94h3.26c-.54 3.05-2.8 5.31-4.41 6.24 1.61.75 4.2 2.72 5.19 6.25h-3.59c-.77-2.37-2.66-4.2-5.19-4.45v4.45h-.42Z"/>
						</svg>
					</a>
					<a
						href="https://t.me/"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Telegram"
						title="Telegram"
					>
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path d="M21.5 4.5 2.8 11.7c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.9 5.8c.2.7.4 1 1 1 .5 0 .7-.2 1-.5l2.5-2.4 5.2 3.8c1 .5 1.7.2 1.9-.9L24 5.9c.3-1.3-.5-1.9-1.5-1.4ZM9 14.3l10.6-6.7c.5-.3 1-.1.6.3l-8.8 8-0.3 3.3L9 14.3Z"/>
						</svg>
					</a>
				</div>
			</div>
		</div>
	</footer>
</template>

<style scoped>
.footer {
	width: 100%;
	background: #fff;
}

.footer-inner {
	display: flex;
	width: 100%;
	max-width: 1200px;
	min-height: 160px;
	margin: 0 auto;
	padding: 28px 0;
	box-sizing: border-box;
	justify-content: space-between;
	border-top: 1px solid #eee;
}

.footer-brand {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 12px;
	min-width: 0;
}

.footer-logo {
	display: inline-flex;
	height: 60px;
	max-width: 100%;
}

.footer-logo img {
	display: block;
	width: auto;
	height: 100%;
	max-width: 100%;
	object-fit: contain;
}

.copyright {
	color: #999;
	font-size: 12px;
	line-height: 1.5;
}

.footer-nav {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 14px 24px;
}

.footer a {
	color: #333;
	text-decoration: none;
	transition: color 0.2s;
}

.footer a:hover {
	color: #E51A24;
}

.footer-nav a,
.footer-contact > a {
	font-size: 14px;
	line-height: 1.5;
}

.footer-contact {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 12px;
	min-width: 0;
}

.socials {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-top: 4px;
}

.socials a {
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border-radius: 8px;
	background: #E51A24;
	color: #fff;
}

.socials a:hover {
	background: #b9152b;
	color: #fff;
}

.socials svg {
	width: 20px;
	height: 20px;
}

@media (max-width: 1240px) {
	.footer-inner {
		width: calc(100% - 40px);
	}
}

@media (max-width: 950px) {
	.footer-inner {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: start;
		gap: 28px;
	}

	.footer-brand {
		grid-column: 1;
		grid-row: 1;
	}

	.footer-contact {
		grid-column: 2;
		grid-row: 1;
		justify-self: end;
	}

	.footer-nav {
		grid-column: 1 / -1;
		grid-row: 2;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px 24px;
	}
}

@media (max-width: 600px) {
	.footer-inner {
		display: grid;
		grid-template-columns: minmax(160px, 1fr) minmax(0, 1.6fr) minmax(170px, 0.8fr);
		grid-template-columns: 1fr;
		gap: 28px;
		padding: 28px 0;
	}

	.footer-brand,
	.footer-nav,
	.footer-contact {
		grid-column: 1;
		grid-row: auto;
	}

	.footer-brand {
		gap: 10px;
	}

	.footer-logo {
		height: 50px;
	}

	.footer-nav {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 18px 16px;
	}

	.footer-nav a,
	.footer-contact > a {
		font-size: 14px;
	}

	.footer-contact {
		justify-self: stretch;
		gap: 14px;
		padding-top: 22px;
		border-top: 1px solid #eee;
	}

	.socials {
		margin-top: 2px;
	}

	.socials a {
		width: 40px;
		height: 40px;
	}
}

@media (max-width: 380px) {
	.footer-inner {
		width: calc(100% - 32px);
	}

	.footer-nav {
		grid-template-columns: 1fr;
		gap: 14px;
	}
}
</style>