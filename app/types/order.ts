export type PaymentMethod = 'card_on_delivery' | 'cash_on_delivery'
export type OrderStatus = 'new' | 'confirmed' | 'assembling' | 'shipping' | 'completed' | 'cancelled'

export type OrderDetails = {
	full_name: string
	phone: string
	email: string
	city: string
	address: string
	comment: string
	payment_method: PaymentMethod
}

export type OrderItem = {
	id: string
	product_name: string
	image_url: string | null
	unit_price: number
	quantity: number
	line_total: number
}

export type OrderSummary = {
	id: string
	order_number: number
	total: number
}

export type ShopOrder = OrderSummary & {
	status: OrderStatus
	payment_method: PaymentMethod
	created_at: string
	city: string
	address: string
	shop_order_items: OrderItem[]
}

export const orderStatusLabels: Record<OrderStatus, string> = {
	new: 'Новый',
	confirmed: 'Подтверждён',
	assembling: 'В сборке',
	shipping: 'В доставке',
	completed: 'Выполнен',
	cancelled: 'Отменён'
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
	card_on_delivery: 'Картой при получении',
	cash_on_delivery: 'Наличными при получении'
}

export const formatOrderPrice = (value: number) => new Intl.NumberFormat('ru-RU', {
	style: 'currency',
	currency: 'RUB',
	maximumFractionDigits: 2,
	minimumFractionDigits: 0
}).format(value)
