export type Mode = 'simple' | 'impossible'

export interface Ingredient {
  id: string
  name: string
  price: number
  calories: number
  allergens: string[]
  quantities: number[]
}

export interface Portion {
  id: string
  name: string
  multiplier: number
}

export interface Dish {
  id: string
  name: string
  description: string
  cuisine: string
  category: string
  basePrice: number
  baseCalories: number
  ingredients: Ingredient[]
  substitutions: Ingredient[]
  extras: Ingredient[]
  portions: Portion[]
  restrictions: string[]
  dietary: string[]
  allergens: string[]
}

export type BeverageSize = 'Small' | 'Medium' | 'Large' | 'XL'

export interface Beverage {
  id: string
  name: string
  category: string
  sizes: Record<BeverageSize, { price: number; calories: number }>
  options: {
    ice?: string[]
    sweetness?: string[]
    syrup?: string[]
    toppings?: string[]
    lemon?: string[]
    milk?: string[]
    temperature?: string[]
  }
}

export interface Dessert {
  id: string
  name: string
  category: string
  price: number
  calories: number
  allergens: string[]
}

export interface Order {
  dishId: string
  portionId: string
  quantities: Record<string, number>
  extraIds: string[]
  substitutionId: string
  bread: string
  cheese: string
  cooking: string
  side: string
  combo: boolean
  beverageId: string
  beverageSize: BeverageSize
  beverageOptions: Record<string, string>
  dessertId: string
  dessertPortion: number
  dessertTopping: string
  dessertSauce: string
  dessertSauceQuantity: number
  dessertOffer: boolean
}

export interface Totals {
  price: number
  calories: number
  priceDelta: number
  calorieDelta: number
}
