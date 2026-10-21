import { beverages, dessertPortions, dessertSauceQuantities, dessertSauces, dessertToppings, desserts, dishes, sides } from '../data/catalog'
import type { Order, Totals } from './model'
import { beverageOptionPrices, isBread, pricing, validQuantity } from './options'
import type { Adjustment } from './options'
import { resolveOrder } from './rules'

export { beverageOptionPrices, pricing } from './options'

export function beverageOptionDelta(key: string, value: string): Adjustment {
  const choices = Object.hasOwn(beverageOptionPrices, key) ? beverageOptionPrices[key] : undefined
  const adjustment = choices && Object.hasOwn(choices, value) ? choices[value] : undefined
  return adjustment ? { ...adjustment } : { price: 0, calories: 0 }
}

const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

/**
 * Base includes one of every listed ingredient. Quantity deltas, extras and a
 * substitution all scale with the selected portion. A substitution replaces the
 * first protein-* ingredient at its selected quantity (zero means no replacement).
 * Bread/cheese removals are resolved before pricing; wholegrain adds its published
 * delta per remaining bread unit. Cooking is free. Sides/drinks/desserts do not
 * scale with the main portion. Combo charges its one fixed side, never two sides.
 * Dessert toppings and sauce quantities scale with dessert portion; the offer
 * discounts only the base dessert portion price by 10%, never additions/calories.
 * Deltas compare only the modified main (including extras and portion) with the
 * unmodified regular base dish. Sides, drinks and desserts never affect deltas.
 * Unsupported IDs/options are ignored, quantities snap to advertised choices.
 */
export function calculateOrder(input: Order): Totals {
  const { order } = resolveOrder(input)
  const dish = dishes.find((item) => item.id === order.dishId)
  if (!dish) return { price: 0, calories: 0, priceDelta: 0, calorieDelta: 0 }
  const multiplier = dish.portions.find((portion) => portion.id === order.portionId)?.multiplier ?? 1
  let mainPrice = dish.basePrice
  let mainCalories = dish.baseCalories
  for (const item of dish.ingredients) {
    const quantity = validQuantity(order.quantities[item.id], item.quantities)
    mainPrice += (quantity - 1) * item.price
    mainCalories += (quantity - 1) * item.calories
    if (order.bread === 'Wholegrain' && isBread(item.id, item.name)) {
      mainPrice += quantity * pricing.wholegrain.price
      mainCalories += quantity * pricing.wholegrain.calories
    }
  }
  const primary = dish.ingredients.find((item) => item.id.startsWith('protein-'))
  const substitution = dish.substitutions.find((item) => item.id === order.substitutionId)
  if (primary && substitution) {
    const quantity = validQuantity(order.quantities[primary.id], primary.quantities)
    mainPrice += (substitution.price - primary.price) * quantity
    mainCalories += (substitution.calories - primary.calories) * quantity
  }
  for (const id of new Set(order.extraIds)) {
    const extra = dish.extras.find((item) => item.id === id)
    if (extra) { mainPrice += extra.price; mainCalories += extra.calories }
  }
  let price = Math.max(0, mainPrice) * multiplier
  let calories = Math.max(0, mainCalories) * multiplier
  const priceDelta = roundMoney(price - dish.basePrice)
  const calorieDelta = Math.round(calories) - dish.baseCalories
  const side = sides.find((item) => item.id === order.side)
  if (side) { price += side.price; calories += side.calories }
  const beverage = beverages.find((item) => item.id === order.beverageId)
  if (beverage) {
    const size = beverage.sizes[order.beverageSize] ?? beverage.sizes.Medium
    let beveragePrice = size.price
    let beverageCalories = size.calories
    for (const [key, value] of Object.entries(order.beverageOptions)) {
      const allowed = beverage.options[key as keyof typeof beverage.options]
      if (!Array.isArray(allowed) || !allowed.includes(value)) continue
      const delta = beverageOptionDelta(key, value)
      beveragePrice += delta.price
      beverageCalories += delta.calories
    }
    price += Math.max(0, beveragePrice)
    calories += Math.max(0, beverageCalories)
  }
  const dessert = desserts.find((item) => item.id === order.dessertId)
  if (dessert) {
    const portion = validQuantity(order.dessertPortion, dessertPortions)
    const topping = dessertToppings.find((item) => item.id === order.dessertTopping)
    const sauce = dessertSauces.find((item) => item.id === order.dessertSauce)
    const sauceQuantity = validQuantity(order.dessertSauceQuantity, dessertSauceQuantities)
    const dessertPrice = (dessert.price + (topping?.price ?? 0) + (sauce?.price ?? 0) * sauceQuantity) * portion
    const dessertCalories = (dessert.calories + (topping?.calories ?? 0) + (sauce?.calories ?? 0) * sauceQuantity) * portion
    price += dessertPrice - (order.dessertOffer ? dessert.price * portion * pricing.dessertOfferDiscount : 0)
    calories += dessertCalories
  }
  const finalPrice = roundMoney(price)
  const finalCalories = Math.round(calories)
  return { price: finalPrice, calories: finalCalories, priceDelta, calorieDelta }
}
