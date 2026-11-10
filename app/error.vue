<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
	error: NuxtError
}>()

const isNotFound = computed(() => props.error.statusCode === 404)
const imageSrc = `${useRuntimeConfig().app.baseURL}images/404.png`

useHead({
	title: computed(() => isNotFound.value ? '404 — Страница не найдена' : 'Произошла ошибка')
})

const goToCatalog = () => clearError({ redirect: '/store/catalog' })

const pencilSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M23 3 29 9 9 29 2 30 3 23Z" fill="#FFDD00" stroke="#222" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 30 3 23 9 29Z" fill="#F0C5A0" stroke="#222" stroke-width="1.3"/><path d="M2 30 3 26 6 29Z" fill="#222"/></svg>`

const pencilCursor = `url("data:image/svg+xml,${encodeURIComponent(pencilSvg)}") 2 30, crosshair`

type DrawingPoint = {
	x: number
	y: number
}

const drawingArea = ref<HTMLElement | null>(null)
const drawingCanvas = ref<HTMLCanvasElement | null>(null)

const strokes: DrawingPoint[][] = []

let activeStroke: DrawingPoint[] | null = null
let resizeObserver: ResizeObserver | null = null

const getPoint = (event: PointerEvent): DrawingPoint => {
	const rect = drawingCanvas.value!.getBoundingClientRect()

	return {
		x: (event.clientX - rect.left) / rect.width,
		y: (event.clientY - rect.top) / rect.height
	}
}

const drawSegment = (start: DrawingPoint, end: DrawingPoint) => {
	const canvas = drawingCanvas.value
	const context = canvas?.getContext('2d')

	if (!canvas || !context) return

	const width = canvas.clientWidth
	const height = canvas.clientHeight

	const startX = start.x * width
	const startY = start.y * height
	const endX = end.x * width
	const endY = end.y * height

	context.strokeStyle = '#D71920'
	context.fillStyle = '#D71920'
	context.lineWidth = 4
	context.lineCap = 'round'
	context.lineJoin = 'round'

	context.beginPath()

	if (start === end) {
		context.arc(startX, startY, 2, 0, Math.PI * 2)
		context.fill()
		return
	}

	context.moveTo(startX, startY)
	context.lineTo(endX, endY)
	context.stroke()
}

const redraw = () => {
	const canvas = drawingCanvas.value
	const context = canvas?.getContext('2d')

	if (!canvas || !context) return

	context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)

	for (const stroke of strokes) {
		if (!stroke.length) continue

		drawSegment(stroke[0]!, stroke[0]!)

		for (let i = 1; i < stroke.length; i++) {
			drawSegment(stroke[i - 1]!, stroke[i]!)
		}
	}
}

const resizeCanvas = () => {
	const canvas = drawingCanvas.value

	if (!canvas) return

	const rect = canvas.getBoundingClientRect()
	const ratio = window.devicePixelRatio || 1

	canvas.width = Math.round(rect.width * ratio)
	canvas.height = Math.round(rect.height * ratio)

	const context = canvas.getContext('2d')

	if (!context) return

	context.setTransform(ratio, 0, 0, ratio, 0, 0)

	redraw()
}

const startDrawing = (event: PointerEvent) => {
	if (event.pointerType === 'mouse' && event.button !== 0) return

	const canvas = event.currentTarget as HTMLCanvasElement
	canvas.setPointerCapture(event.pointerId)

	const point = getPoint(event)

	activeStroke = [point]
	strokes.push(activeStroke)

	drawSegment(point, point)
}

const draw = (event: PointerEvent) => {
	if (!activeStroke) return

	if (event.pointerType === 'mouse' && !(event.buttons & 1)) {
		activeStroke = null
		return
	}

	const previous = activeStroke[activeStroke.length - 1]
	const point = getPoint(event)

	activeStroke.push(point)

	if (previous) {
		drawSegment(previous, point)
	}
}

const stopDrawing = (event: PointerEvent) => {
	activeStroke = null

	const canvas = event.currentTarget as HTMLCanvasElement

	if (canvas.hasPointerCapture(event.pointerId)) {
		canvas.releasePointerCapture(event.pointerId)
	}
}

onMounted(() => {
	resizeCanvas()

	if (drawingArea.value) {
		resizeObserver = new ResizeObserver(resizeCanvas)
		resizeObserver.observe(drawingArea.value)
	}
})

onBeforeUnmount(() => {
	resizeObserver?.disconnect()
})
</script>

<template>
	<div class="page">
		<main ref="drawingArea" class="error-page">
            <canvas
                ref="drawingCanvas"
                class="drawing-canvas"
                :style="{ cursor: pencilCursor }"
                aria-label="Область для рисования"
                @pointerdown="startDrawing"
                @pointermove="draw"
                @pointerup="stopDrawing"
                @pointercancel="stopDrawing"
            />
			<div class="error-container">
				<div class="error-content">
					<span class="error-code">{{ error.statusCode }}</span>
					<h1>
						{{ isNotFound
							? 'Страница не найдена'
							: 'Что-то пошло не так'
						}}
					</h1>
					<p>
						{{ isNotFound
							? 'Похоже, мы ещё не успели создать эту страницу. Загляните позже, а пока можете посмотреть наш каталог товаров.'
							: 'Произошла ошибка. Попробуйте вернуться в каталог.'
						}}
					</p>
					<button
						type="button"
						class="back-button"
						@click="goToCatalog"
					>
						Перейти в каталог
						<span aria-hidden="true">→</span>
					</button>
				</div>
				<div class="error-image">
					<img :src="imageSrc" alt="" />
				</div>
			</div>
		</main>
	</div>
</template>

<style scoped>
.page {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

.error-page {
	position: relative;
	isolation: isolate;
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	padding: 60px 20px;
	box-sizing: border-box;
	background: #fff;
	overflow: hidden;
}

.drawing-canvas {
	position: absolute;
	inset: 0;
	z-index: 1;
	display: block;
	width: 100%;
	height: 100%;
	touch-action: none;
}

.error-container {
	position: relative;
	z-index: 2;
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: center;
	gap: 40px;
	width: 100%;
	max-width: 1200px;
	margin: 0 auto;
	pointer-events: none;
}

.error-content {
	max-width: 540px;
	pointer-events: none;
}

.error-content > * {
	pointer-events: none;
}

.error-code {
	display: block;
	width: fit-content;
	color: #222;
	font-size: clamp(100px, 15vw, 180px);
	font-weight: 800;
	line-height: 1;
	letter-spacing: -8px;
}

.error-content h1 {
	width: fit-content;
	margin: 24px 0 16px;
	color: #222;
	font-size: clamp(28px, 4vw, 40px);
	font-weight: 800;
	line-height: 1.2;
}

.error-content p {
	width: fit-content;
	margin: 0;
	color: #444;
	font-size: 16px;
	line-height: 1.7;
}

.back-button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 14px;
	min-height: 54px;
	margin-top: 32px;
	padding: 0 28px;
	background: #E51A24;
	border: none;
	border-radius: 12px;
	color: #fff;
	font: inherit;
	font-size: 15px;
	font-weight: 700;
	cursor: pointer;
	pointer-events: auto;
	transition: background 0.2s;
}

.back-button:hover {
	background: #b9152b;
}

.error-image {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	min-height: 320px;
	pointer-events: none;
}

.error-image img {
	display: block;
	width: 100%;
	max-width: 520px;
	max-height: 480px;
	object-fit: contain;
	pointer-events: none;
	user-select: none;
	-webkit-user-drag: none;
}

@media (max-width: 760px) {
	.error-page {
		padding: 50px 20px;
	}

	.error-container {
		grid-template-columns: 1fr;
		gap: 30px;
	}

	.error-content {
		max-width: 100%;
		text-align: center;
	}

	.error-code,
	.error-content h1,
	.error-content p {
		margin-left: auto;
		margin-right: auto;
	}

	.error-code {
		font-size: clamp(90px, 22vw, 140px);
		letter-spacing: -4px;
	}

	.error-content h1 {
		font-size: 28px;
	}

	.error-image {
		min-height: 200px;
	}

	.error-image img {
		max-height: 300px;
	}
}

@media (max-width: 400px) {
	.error-content p {
		font-size: 14px;
	}

	.back-button {
		width: 100%;
	}

	.error-image img {
		max-height: 240px;
	}
}
</style>