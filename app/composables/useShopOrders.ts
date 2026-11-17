import type { OrderDetails, OrderSummary, ShopOrder } from '~/types/order'

export const useShopOrders = () => {
	const { token } = useShopAuth()
	const config = useRuntimeConfig()

	const request = async <T>(body: object): Promise<T> => {
		if (!token.value) throw new Error('Войдите в аккаунт')

		const response = await fetch(`${config.public.supabaseUrl}/functions/v1/shop-orders`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token.value}`,
				apikey: String(config.public.supabaseKey),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		})

		const result = await response.json()
		if (!response.ok) {
			throw Object.assign(new Error(result.error || 'Не удалось выполнить запрос'), {
				code: result.code,
				status: response.status
			})
		}
		return result as T
	}

	const createOrder = (details: OrderDetails, items: { id: string; quantity: number }[], expectedTotalCents: number, requestId: string) =>
		request<{ order: OrderSummary }>({
			action: 'create',
			details,
			items,
			expected_total_cents: expectedTotalCents,
			request_id: requestId
		})

	const listOrders = (page = 0) => request<{ orders: ShopOrder[]; hasMore: boolean }>({ action: 'list', page })

	return { createOrder, listOrders }
}
