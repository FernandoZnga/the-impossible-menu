import { describe, expect, it } from 'vitest'
import { beverages, createOrder, cuisines, dessertSauces, dessertToppings, desserts, dishes, sides } from './catalog'
import { beverageOptionPrices } from '../domain/options'

describe('catalog integrity', () => {
  it('provides at least ten unique dishes per each of twelve cuisines', () => {
    expect(cuisines).toHaveLength(12)
    expect(cuisines).toEqual([
      'American', 'Mexican', 'Italian', 'Japanese', 'Chinese', 'Korean',
      'Indian', 'Thai', 'Mediterranean', 'Honduran / Central American', 'French', 'Middle Eastern',
    ])
    expect(new Set(cuisines).size).toBe(12)
    expect(dishes.length).toBeGreaterThanOrEqual(120)
    expect(new Set(dishes.map((dish) => dish.id)).size).toBe(dishes.length)
    expect(new Set(dishes.map((dish) => dish.name)).size).toBe(dishes.length)
    for (const cuisine of cuisines) {
      const localDishes = dishes.filter((dish) => dish.cuisine === cuisine)
      expect(localDishes.length).toBeGreaterThanOrEqual(10)
      expect(new Set(localDishes.map((dish) => dish.category)).size).toBeGreaterThanOrEqual(2)
    }
  })

  it('provides complete ingredient metadata, valid default quantities and realistic nutrition', () => {
    for (const dish of dishes) {
      expect(dish.description.length).toBeGreaterThan(30)
      expect(dish.ingredients.length).toBeGreaterThanOrEqual(3)
      expect(dish.basePrice).toBeGreaterThan(0)
      expect(dish.baseCalories).toBeGreaterThan(0)
      expect(dish.portions.some((portion) => portion.id === createOrder(dish).portionId)).toBe(true)
      expect(new Set(dish.ingredients.map((item) => item.id)).size).toBe(dish.ingredients.length)
      for (const item of [...dish.ingredients, ...dish.substitutions, ...dish.extras]) {
        expect(item.quantities).toContain(1)
        expect(item.quantities.every((quantity) => Number.isFinite(quantity) && quantity >= 0 && quantity <= 3)).toBe(true)
        expect(item.price).toBeGreaterThanOrEqual(0)
        expect(item.calories).toBeGreaterThanOrEqual(0)
      }
      expect([...dish.allergens].sort()).toEqual([...new Set(dish.ingredients.flatMap((item) => item.allergens))].sort())
      expect(Object.values(createOrder(dish).quantities).every((quantity) => quantity === 1)).toBe(true)
      expect(createOrder(dish).beverageId).toBe('')
      expect(createOrder(dish).dessertId).toBe('')
    }
  })

  it('keeps the American cheeseburger discoverable under Handhelds with clear ingredient labels', () => {
    const burger = dishes.find((dish) => dish.name === 'Classic Cheeseburger')
    expect(burger?.cuisine).toBe('American')
    expect(burger?.category).toBe('Handhelds')
    expect(burger?.ingredients.find((item) => item.id === 'bread-bun')?.name).toBe('Brioche bun')
    expect(burger?.ingredients.find((item) => item.id === 'tomato')?.name).toBe('Tomatoes')
  })

  it('has twenty beverages with distinct, increasing prices and calories in all four sizes', () => {
    expect(beverages.length).toBeGreaterThanOrEqual(20)
    for (const beverage of beverages) {
      const values = ['Small', 'Medium', 'Large', 'XL'].map((size) => beverage.sizes[size as keyof typeof beverage.sizes])
      expect(new Set(values.map((size) => size.price)).size).toBe(4)
      expect(new Set(values.map((size) => size.calories)).size).toBe(4)
      for (let index = 1; index < values.length; index++) {
        expect(values[index]!.price).toBeGreaterThan(values[index - 1]!.price)
        expect(values[index]!.calories).toBeGreaterThan(values[index - 1]!.calories)
      }
      for (const [key, options] of Object.entries(beverage.options)) {
        for (const value of options) expect(beverageOptionPrices[key]?.[value]).toBeDefined()
        expect(beverageOptionPrices[key]?.[options[0]!]).toEqual({ price: 0, calories: 0 })
      }
    }
    expect(beverages.find((drink) => drink.id === 'diet-cola')?.sizes.Small.calories).toBe(0)
  })

  it('has twenty desserts and unique ids in every catalog collection', () => {
    expect(desserts.length).toBeGreaterThanOrEqual(20)
    for (const collection of [beverages, desserts, sides, dessertToppings, dessertSauces]) {
      expect(new Set(collection.map((item) => item.id)).size).toBe(collection.length)
      expect(collection.every((item) => item.name.length > 0)).toBe(true)
    }
  })
})
