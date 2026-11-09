import type { CartItem } from '~/types/product'

export const useShop = () => {
	const cart = useState<CartItem[]>('shop-cart', () => [])
	const favorites = useState<string[]>('shop-favorites', () => [])
	const initialized = useState('shop-initialized', () => false)

	const cartCount = computed(() => {
		return cart.value.reduce((sum, item) => sum + item.quantity, 0)
	})

	const favoritesCount = computed(() => favorites.value.length)

	const initialize = () => {
		if (!import.meta.client || initialized.value) return

		try {
			const savedCart: unknown = JSON.parse(
				localStorage.getItem('youmans-cart') || '[]'
			)

			const savedFavorites: unknown = JSON.parse(
				localStorage.getItem('youmans-favorites') || '[]'
			)

			if (Array.isArray(savedCart)) {
				cart.value = savedCart.filter(
					(item): item is CartItem =>
						item !== null &&
						typeof item === 'object' &&
						typeof item.id === 'string' &&
						typeof item.quantity === 'number' &&
						Number.isInteger(item.quantity) &&
						item.quantity > 0
				)
			}

			if (Array.isArray(savedFavorites)) {
				favorites.value = [
					...new Set(
						savedFavorites.filter(
							(id): id is string => typeof id === 'string'
						)
					)
				]
			}
		} catch {
			cart.value = []
			favorites.value = []
		}

		initialized.value = true
	}

	const save = () => {
		if (!import.meta.client) return

		try {
			localStorage.setItem('youmans-cart', JSON.stringify(cart.value))
			localStorage.setItem('youmans-favorites', JSON.stringify(favorites.value))
		} catch {
			return
		}
	}

	const addToCart = (id: string) => {
		initialize()

		const existing = cart.value.find(item => item.id === id)

		if (existing) {
			cart.value = cart.value.map(item =>
				item.id === id
					? { ...item, quantity: item.quantity + 1 }
					: item
			)
		} else {
			cart.value = [...cart.value, { id, quantity: 1 }]
		}

		save()
	}

	const removeFromCart = (id: string) => {
		initialize()
		cart.value = cart.value.filter(item => item.id !== id)
		save()
	}

	const setQuantity = (id: string, quantity: number) => {
		initialize()

		if (!Number.isInteger(quantity)) return

		if (quantity <= 0) {
			removeFromCart(id)
			return
		}

		cart.value = cart.value.map(item =>
			item.id === id ? { ...item, quantity } : item
		)

		save()
	}

	const toggleFavorite = (id: string) => {
		initialize()

		favorites.value = favorites.value.includes(id)
			? favorites.value.filter(item => item !== id)
			: [...favorites.value, id]

		save()
	}

	onMounted(initialize)

	return {
		cart,
		favorites,
		cartCount,
		favoritesCount,
		initialize,
		addToCart,
		removeFromCart,
		setQuantity,
		toggleFavorite
	}
}