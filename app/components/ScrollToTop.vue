<script setup lang="ts">
const visible = ref(false)

const handleScroll = () => {
	visible.value = window.scrollY > 300
}

const scrollToTop = () => {
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	})
}

onMounted(() => {
	handleScroll()
	window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
	window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
	<Transition name="scroll">
		<button
			v-if="visible"
			type="button"
			class="scroll-top"
			aria-label="Вернуться наверх"
			@click="scrollToTop"
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
				<path d="M12 19V5M5 12l7-7 7 7" />
			</svg>
		</button>
	</Transition>
</template>

<style scoped>
.scroll-top {
	position: fixed;
	right: 30px;
	bottom: 30px;
	z-index: 90;
	width: 52px;
	height: 52px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #D71920;
	color: #fff;
	border: none;
	border-radius: 50%;
	cursor: pointer;
	transition: background 0.2s, transform 0.2s;
}

.scroll-top:hover {
	background: #b9152b;
	transform: translateY(-4px);
}

.scroll-top svg {
	width: 24px;
	height: 24px;
}

.scroll-enter-active,
.scroll-leave-active {
	transition: opacity 0.2s, transform 0.2s;
}

.scroll-enter-from,
.scroll-leave-to {
	opacity: 0;
	transform: translateY(15px);
}

@media (max-width: 600px) {
	.scroll-top {
		right: 16px;
		bottom: 16px;
		width: 44px;
		height: 44px;
	}

	.scroll-top svg {
		width: 20px;
		height: 20px;
	}
}
</style>