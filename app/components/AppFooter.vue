<template>
	<footer class="footer">
		<div class="footer-inner">
			<div class="footer-brand">
				<NuxtLink to="/store" class="footer-logo" aria-label="Главная">
					<img src="/images/logo.png" alt="Логотип магазина" />
				</NuxtLink>
				<span class="copyright">© 2026 Все права защищены</span>
			</div>
			<nav class="footer-nav" aria-label="Навигация по магазину">
				<NuxtLink to="/store/catalog">Каталог</NuxtLink>
				<NuxtLink to="/store/delivery">Доставка и оплата</NuxtLink>
				<NuxtLink to="/store/contacts">Контакты</NuxtLink>
				<NuxtLink to="/store/about">О магазине</NuxtLink>
				<NuxtLink to="/store/privacy">Политика конфиденциальности</NuxtLink>
			</nav>
			<div class="footer-contact">
				<a href="mailto:email@1c.ru">email@1c.ru</a>
				<a href="tel:+79999999999">+7 (999) 999-99-99</a>
				<div class="socials">
					<a href="https://vk.com/" target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте" title="ВКонтакте">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path d="M12.79 17.49C5.93 17.49 2.02 12.79 1.86 5h3.46c.11 5.72 2.63 8.15 4.63 8.65V5h3.26v4.94c1.97-.21 4.04-2.47 4.74-4.94h3.26c-.54 3.05-2.8 5.31-4.41 6.24 1.61.75 4.2 2.72 5.19 6.25h-3.59c-.77-2.37-2.66-4.2-5.19-4.45v4.45h-.42Z"/>
						</svg>
					</a>
					<a href="https://t.me/" target="_blank" rel="noopener noreferrer" aria-label="Telegram" title="Telegram">
						<svg viewBox="0 0 24 24" fill="currentColor">
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
	min-height: 160px;
	background: #fff;
}

.footer-inner {
	max-width: 1200px;
	min-height: 160px;
	margin: auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 40px;
    border-top: 1px solid #eee;
}

.footer-brand {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 12px;
}

.footer-logo {
	height: 60px;
}

.footer-logo img {
	height: 100%;
	width: auto;
	display: block;
}

.copyright {
	color: #999;
	font-size: 12px;
	white-space: nowrap;
}

.footer-nav {
	display: grid;
	grid-template-columns: repeat(2, max-content);
	gap: 12px 30px;
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
.footer-contact a {
	font-size: 14px;
}

.footer-contact {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 10px;
}

.socials {
	display: flex;
	gap: 12px;
}

.socials a {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
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
		margin: 0 20px;
	}
}

@media (max-width: 850px) {
	.footer-inner {
		padding: 24px 0;
		flex-wrap: wrap;
		gap: 24px;
	}

	.footer-nav {
		gap: 12px 20px;
	}
}

@media (max-width: 550px) {
	.footer-inner {
		align-items: flex-start;
		flex-direction: column;
	}

	.footer-nav {
		grid-template-columns: 1fr;
	}

	.footer-contact {
		gap: 12px;
	}
}
</style>