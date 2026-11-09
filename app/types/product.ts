export type Product = {
	id: string
	slug: string
	name: string
	description: string | null
	price: number
	image_url: string | null
}

export type CartItem = {
	id: string
	quantity: number
}