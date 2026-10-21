import { beverages, dishes } from '../data/catalog'
import type { BeverageSize, Dish, Order } from './model'
import { isBread, isCheese, validQuantity } from './options'

export interface Conflict { id: string; message: string; step: string }
export interface OrderRule {
  id: string
  step: 'customize' | 'sides'
  apply: (order: Order, dish: Dish) => string | null
}

/** Mutable configuration: callers may replace or append rules before resolving. */
export const rules: OrderRule[] = [
  {
    id: 'bread-choice', step: 'customize',
    apply(order, dish) {
      if (order.bread !== 'Lettuce wrap' && order.bread !== 'No bread') return null
      const active = dish.ingredients.filter((item) => isBread(item.id, item.name) && (order.quantities[item.id] ?? 1) > 0)
      if (!active.length) return null
      active.forEach((item) => { order.quantities[item.id] = 0 })
      return `${order.bread} removes the bread ingredient. Revisit customization to review quantities; other ingredients are preserved.`
    },
  },
  {
    id: 'cheese-choice', step: 'customize',
    apply(order, dish) {
      if (order.cheese !== 'No cheese') return null
      const active = dish.ingredients.filter((item) => isCheese(item.id, item.name) && (order.quantities[item.id] ?? 1) > 0)
      const cheeseExtraIds = dish.extras.filter((item) => isCheese(item.id, item.name)).map((item) => item.id)
      const hasCheeseExtra = order.extraIds.some((id) => cheeseExtraIds.includes(id))
      if (!active.length && !hasCheeseExtra) return null
      active.forEach((item) => { order.quantities[item.id] = 0 })
      order.extraIds = order.extraIds.filter((id) => !cheeseExtraIds.includes(id))
      return 'No cheese removes base cheese ingredients and cheese extras. Revisit customization to review quantities and extras.'
    },
  },
  {
    id: 'substitution-extras', step: 'customize',
    apply(order, dish) {
      if (!dish.substitutions.some((item) => item.id === order.substitutionId)) return null
      const incompatible = substitutionIncompatibilities[order.substitutionId] ?? []
      const removed = order.extraIds.filter((id) => incompatible.includes(id))
      if (!removed.length) return null
      order.extraIds = order.extraIds.filter((id) => !incompatible.includes(id))
      return 'Your protein substitution removed incompatible extras. Revisit customization to choose compatible extras.'
    },
  },
  {
    id: 'combo-side', step: 'sides',
    apply(order) {
      if (order.combo && order.side !== 'combo') {
        order.side = 'combo'
        return 'Combo replaces the individual side with included combo fries. Revisit sides to review the fixed side.'
      }
      if (!order.combo && order.side === 'combo') {
        order.side = ''
        return 'Combo was removed, so its included fries were cleared. Revisit sides to choose an individual side.'
      }
      return null
    },
  },
]

export const substitutionIncompatibilities: Record<string, string[]> = {
  'sub-tofu': ['extra-chicken'],
  'sub-chicken': ['extra-tofu'],
}

/** Pure resolution: input objects and catalog records are never mutated. */
export function resolveOrder(input: Order): { order: Order; conflicts: Conflict[] } {
  const order: Order = { ...input, quantities: { ...input.quantities }, extraIds: [...input.extraIds], beverageOptions: { ...input.beverageOptions } }
  const dish = dishes.find((item) => item.id === order.dishId)
  if (!dish) return { order, conflicts: [] }
  dish.ingredients.forEach((item) => {
    order.quantities[item.id] = validQuantity(order.quantities[item.id], item.quantities)
  })
  const conflicts: Conflict[] = []
  for (const rule of rules) {
    const message = rule.apply(order, dish)
    if (message) conflicts.push({ id: rule.id, message, step: rule.step })
  }
  return { order, conflicts }
}

export function beverageSuggestion(order: Order): { message: string; targetSize: BeverageSize } | null {
  const beverage = beverages.find((item) => item.id === order.beverageId)
  if (!beverage || !beverage.sizes[order.beverageSize]) return null
  const targetSize = order.beverageSize === 'Small' || order.beverageSize === 'Medium' ? 'Large' : 'Small'
  const current = beverage.sizes[order.beverageSize]
  const target = beverage.sizes[targetSize]
  const difference = Math.abs(target.price - current.price).toFixed(2)
  return {
    targetSize,
    message: targetSize === 'Large'
      ? `Make your ${beverage.name} Large for $${difference} more (${target.calories} kcal, up from ${current.calories}).`
      : `Choose a Small ${beverage.name} to save $${difference} and ${current.calories - target.calories} kcal.`,
  }
}
