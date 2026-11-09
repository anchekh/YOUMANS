type ShopRole = 'user' | 'admin'

type ShopUser = {
	id: string
	username: string
	role: ShopRole
}

type AuthResponse = {
	user?: ShopUser
	token?: string
	error?: string
}

export const useShopAuth = () => {
	const user = useState<ShopUser | null>('shop-auth-user', () => null)
	const token = useState<string | null>('shop-auth-token', () => null)
	const initialized = useState('shop-auth-initialized', () => false)

	const config = useRuntimeConfig()
	const endpoint = `${config.public.supabaseUrl}/functions/v1/shop-auth`

	const request = async (body: Record<string, unknown>) => {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		})

		const data = await response.json() as AuthResponse

		if (!response.ok) {
			throw new Error(data.error || 'Ошибка авторизации')
		}

		return data
	}

	const saveSession = (data: AuthResponse) => {
		if (!data.user || !data.token) {
			throw new Error('Не удалось создать сессию')
		}

		user.value = data.user
		token.value = data.token

		sessionStorage.setItem('youmans-session', data.token)
		initialized.value = true
	}

	const clearSession = () => {
		user.value = null
		token.value = null

		if (import.meta.client) {
			sessionStorage.removeItem('youmans-session')
		}
	}

	const initialize = async () => {
		if (!import.meta.client || initialized.value) return

		const savedToken = sessionStorage.getItem('youmans-session')

		if (savedToken) {
			try {
				const data = await request({
					action: 'me',
					token: savedToken
				})

				user.value = data.user ?? null
				token.value = savedToken
			} catch {
				clearSession()
			}
		}

		initialized.value = true
	}

	const register = async (username: string, password: string) => {
		const data = await request({
			action: 'register',
			username,
			password
		})

		saveSession(data)

		return data.user!
	}

	const login = async (username: string, password: string) => {
		const data = await request({
			action: 'login',
			username,
			password
		})

		saveSession(data)

		return data.user!
	}

	const logout = async () => {
		const currentToken = token.value

		clearSession()

		if (currentToken) {
			try {
				await request({
					action: 'logout',
					token: currentToken
				})
			} catch (error) {
				console.error('Ошибка выхода:', error)
			}
		}
	}

	return {
		user,
		token,
		initialized,
		initialize,
		register,
		login,
		logout
	}
}