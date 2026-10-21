import { describe, expect, it } from 'vitest'
import { beverages, createOrder, dishes } from '../data/catalog'
import { beverageSuggestion, resolveOrder, rules } from './rules'
import { isBread, isCheese } from './options'

describe('order rules', () => {
  const burger = dishes.find((dish) => dish.id === 'classic-cheeseburger')!

  it('removes only actual bread and cheese and reports revisit steps', () => {
    const input = createOrder(burger)
    input.bread = 'Lettuce wrap'
    input.cheese = 'No cheese'
    const result = resolveOrder(input)
    expect(result.order.quantities['bread-bun']).toBe(0)
    expect(result.order.quantities.cheese).toBe(0)
    expect(result.order.quantities['protein-beef']).toBe(1)
    expect(result.order.quantities.greens).toBe(1)
    expect(result.conflicts.map((conflict) => conflict.step)).toEqual(['customize', 'customize'])
    expect(input.quantities['bread-bun']).toBe(1)
    expect(input.quantities.cheese).toBe(1)
    expect(resolveOrder(result.order)).toEqual({ order: result.order, conflicts: [] })
  })

  it('does not invent bread or cheese ingredients on unrelated dishes', () => {
    const dish = dishes.find((item) => item.id === 'chana-masala')!
    const input = createOrder(dish)
    input.bread = 'No bread'
    input.cheese = 'No cheese'
    expect(resolveOrder(input)).toEqual({ order: input, conflicts: [] })
  })

  it('also removes cheese extras while preserving non-cheese extras', () => {
    const input = createOrder(burger)
    input.cheese = 'No cheese'
    input.extraIds = ['extra-cheese', 'extra-avocado']
    const result = resolveOrder(input)
    expect(result.order.extraIds).toEqual(['extra-avocado'])
    expect(result.order.quantities.cheese).toBe(0)
    expect(result.conflicts).toHaveLength(1)
    expect(resolveOrder(result.order).conflicts).toEqual([])
  })

  it('removes cheese extras even on dishes without a base cheese ingredient', () => {
    const input = createOrder(dishes.find((item) => item.id === 'chana-masala')!)
    input.cheese = 'No cheese'
    input.extraIds = ['extra-cheese']
    const result = resolveOrder(input)
    expect(result.order.extraIds).toEqual([])
    expect(result.order.quantities).toEqual(input.quantities)
    expect(result.conflicts).toHaveLength(1)
  })

  it('shares bread and cheese detection without treating breadcrumbs as bread', () => {
    expect(isBread('breadcrumbs', 'Golden breadcrumbs')).toBe(false)
    expect(isBread('bread-bun', 'Brioche bun')).toBe(true)
    expect(isBread('bread-flour-tortilla', 'Flour tortilla')).toBe(true)
    expect(isBread('bread-pita', 'Pita bread')).toBe(true)
    expect(isCheese('cheese-feta', 'Feta')).toBe(true)
    const input = createOrder(dishes.find((item) => item.id === 'chicken-katsu-sando')!)
    input.bread = 'Lettuce wrap'
    const result = resolveOrder(input)
    expect(result.order.quantities.bread).toBe(0)
    expect(result.order.quantities.breadcrumbs).toBe(1)
  })

  it('deactivates incompatible extras while preserving all other extras', () => {
    const input = createOrder(burger)
    input.substitutionId = 'sub-tofu'
    input.extraIds = ['extra-chicken', 'extra-avocado', 'extra-tofu']
    const result = resolveOrder(input)
    expect(result.order.extraIds).toEqual(['extra-avocado', 'extra-tofu'])
    expect(result.conflicts).toHaveLength(1)
    expect(input.extraIds).toContain('extra-chicken')
    expect(resolveOrder(result.order).conflicts).toEqual([])
  })

  it('replaces individual sides in combos and clears only stale combo sides', () => {
    const input = createOrder(burger)
    input.combo = true
    input.side = 'salad'
    const result = resolveOrder(input)
    expect(result.order.side).toBe('combo')
    expect(result.conflicts[0]?.step).toBe('sides')
    expect(resolveOrder(result.order).conflicts).toEqual([])
    expect(resolveOrder({ ...result.order, combo: false }).order.side).toBe('')
    expect(resolveOrder({ ...input, combo: false }).order.side).toBe('salad')
  })

  it('supports configured rules without mutating the caller', () => {
    const rule = { id: 'test-rule', step: 'customize' as const, apply: (order: ReturnType<typeof createOrder>) => {
      if (order.cooking !== 'Test') return null
      order.cooking = 'Chef recommended'
      return 'Review cooking.'
    } }
    rules.push(rule)
    try {
      const input = { ...createOrder(burger), cooking: 'Test' }
      expect(resolveOrder(input).conflicts).toContainEqual({ id: 'test-rule', step: 'customize', message: 'Review cooking.' })
      expect(input.cooking).toBe('Test')
    } finally {
      rules.splice(rules.indexOf(rule), 1)
    }
  })
})

describe('beverage suggestions', () => {
  it('uses actual size prices and calories for every beverage', () => {
    const order = createOrder(dishes[0]!)
    for (const drink of beverages) {
      order.beverageId = drink.id
      for (const size of ['Small', 'Medium', 'Large', 'XL'] as const) {
        order.beverageSize = size
        const suggestion = beverageSuggestion(order)
        const target = size === 'Small' || size === 'Medium' ? 'Large' : 'Small'
        expect(suggestion?.targetSize).toBe(target)
        expect(suggestion?.message).toContain(Math.abs(drink.sizes[target].price - drink.sizes[size].price).toFixed(2))
      }
    }
    order.beverageId = ''
    expect(beverageSuggestion(order)).toBeNull()
  })
})
