import { describe, expect, it } from 'vitest'
import { beverages, createOrder, dessertSauces, dessertToppings, desserts, dishes, sides } from '../data/catalog'
import { beverageOptionDelta, calculateOrder } from './calculate'
import type { Dish } from './model'

function dishNamed(name: string): Dish {
  const dish = dishes.find((item) => item.name === name)
  if (!dish) throw new Error(`Missing fixture ${name}`)
  return dish
}

describe('calculateOrder', () => {
  const burger = dishNamed('Classic Cheeseburger')

  it('starts every dish at its advertised base, with zero deltas', () => {
    for (const dish of dishes) {
      expect(calculateOrder(createOrder(dish))).toEqual({
        price: dish.basePrice, calories: dish.baseCalories, priceDelta: 0, calorieDelta: 0,
      })
    }
  })

  it('scales quantity deltas, extras and wholegrain with the main portion', () => {
    const order = createOrder(burger)
    order.quantities['protein-beef'] = 2
    order.extraIds = ['extra-avocado', 'extra-avocado']
    order.bread = 'Wholegrain'
    order.portionId = 'large'
    const price = (burger.basePrice + 4.5 + 1.8 + 0.5) * 1.5
    const calories = (burger.baseCalories + 240 + 120 + 10) * 1.5
    expect(calculateOrder(order)).toEqual({
      price: 30.45, calories, priceDelta: Number((price - burger.basePrice).toFixed(2)), calorieDelta: calories - burger.baseCalories,
    })
  })

  it('replaces only the primary protein at its selected quantity', () => {
    const order = createOrder(burger)
    order.quantities['protein-beef'] = 2
    order.substitutionId = 'sub-tofu'
    const totals = calculateOrder(order)
    expect(totals.price).toBe(14)
    expect(totals.calories).toBe(720)
    order.quantities['protein-beef'] = 0
    expect(calculateOrder(order).price).toBe(burger.basePrice - 4.5)
    expect(calculateOrder(order).calories).toBe(burger.baseCalories - 240)
  })

  it('removes bread and cheese without changing other ingredients', () => {
    const order = createOrder(burger)
    order.bread = 'Lettuce wrap'
    order.cheese = 'No cheese'
    expect(calculateOrder(order)).toEqual({ price: 10.6, calories: 400, priceDelta: -2.9, calorieDelta: -320 })
  })

  it('charges one fixed combo side rather than the individual side as well', () => {
    const order = createOrder(burger)
    order.side = 'salad'
    order.combo = true
    expect(calculateOrder(order)).toEqual({ price: 17, calories: 1040, priceDelta: 0, calorieDelta: 0 })
    expect(sides.find((side) => side.id === 'combo')?.price).toBe(3.5)
  })

  it('keeps main-only deltas stable when sides, drinks and desserts are added', () => {
    const order = createOrder(burger)
    order.portionId = 'large'
    order.extraIds = ['extra-avocado']
    const main = calculateOrder(order)
    order.side = 'salad'
    order.beverageId = 'cola'
    order.beverageSize = 'XL'
    order.dessertId = 'cheesecake'
    order.dessertOffer = true
    const complete = calculateOrder(order)
    expect(complete.price).toBeGreaterThan(main.price)
    expect(complete.calories).toBeGreaterThan(main.calories)
    expect(complete.priceDelta).toBe(main.priceDelta)
    expect(complete.calorieDelta).toBe(main.calorieDelta)
    expect(main.priceDelta).toBe(9.45)
    expect(main.calorieDelta).toBe(540)
  })

  it('prices the selected beverage size and only its valid options', () => {
    const order = createOrder(burger)
    order.beverageId = 'taro-boba'
    order.beverageSize = 'XL'
    order.beverageOptions = { toppings: 'Tapioca pearls', sweetness: 'Extra sweet', syrup: 'Vanilla', imaginary: 'paid', toString: 'ignored' }
    const drink = beverages.find((item) => item.id === order.beverageId)
    expect(drink).toBeDefined()
    expect(calculateOrder(order).price).toBe(Number((burger.basePrice + (drink?.sizes.XL.price ?? 0) + 0.85 + 0.25).toFixed(2)))
    expect(calculateOrder(order).calories).toBe(burger.baseCalories + (drink?.sizes.XL.calories ?? 0) + 100 + 35)
    expect(calculateOrder(order).priceDelta).toBe(0)
    expect(calculateOrder(order).calorieDelta).toBe(0)
    expect(beverageOptionDelta('not-a-key', 'bad')).toEqual({ price: 0, calories: 0 })
    expect(beverageOptionDelta('toString', 'bad')).toEqual({ price: 0, calories: 0 })
    expect(beverageOptionDelta('syrup', 'toString')).toEqual({ price: 0, calories: 0 })
  })

  it('keeps zero-calorie drinks nonnegative with unsweetened options', () => {
    const order = createOrder(burger)
    order.beverageId = 'black-tea'
    order.beverageSize = 'Small'
    order.beverageOptions = { sweetness: 'Unsweetened' }
    expect(calculateOrder(order).calories).toBe(burger.baseCalories)
  })

  it('scales dessert toppings and sauce, with an explicit price-only offer', () => {
    const order = createOrder(burger)
    const dessert = desserts[0]!
    const topping = dessertToppings[0]!
    const sauce = dessertSauces[0]!
    order.dessertId = dessert.id
    order.dessertTopping = topping.id
    order.dessertSauce = sauce.id
    order.dessertSauceQuantity = 2
    order.dessertPortion = 1.5
    order.dessertOffer = true
    expect(calculateOrder(order).price).toBe(Number((burger.basePrice + ((dessert.price * 0.9) + topping.price + sauce.price * 2) * 1.5).toFixed(2)))
    expect(calculateOrder(order).calories).toBe(burger.baseCalories + Math.round((dessert.calories + topping.calories + sauce.calories * 2) * 1.5))
    expect(calculateOrder(order).priceDelta).toBe(0)
    expect(calculateOrder(order).calorieDelta).toBe(0)
  })

  it('supports half a serving of sauce without discounting dessert additions', () => {
    const order = createOrder(burger)
    order.dessertId = 'tiramisu'
    order.dessertSauce = 'chocolate'
    order.dessertSauceQuantity = 0.5
    order.dessertOffer = true
    expect(calculateOrder(order).price).toBe(20.18)
    expect(calculateOrder(order).calories).toBe(1108)
  })

  it('ignores dessert customization without a dessert and does not mutate input', () => {
    const order = createOrder(burger)
    order.dessertTopping = 'berries'
    order.dessertSauce = 'chocolate'
    order.dessertOffer = true
    const before = structuredClone(order)
    expect(calculateOrder(order).price).toBe(burger.basePrice)
    expect(order).toEqual(before)
  })

  it('caps quantities at metadata choices and ignores unknown ids', () => {
    const order = createOrder(burger)
    order.quantities['protein-beef'] = 999
    order.extraIds = ['missing']
    order.substitutionId = 'missing'
    expect(calculateOrder(order).price).toBe(burger.basePrice + 9)
    order.quantities['protein-beef'] = Number.NaN
    expect(calculateOrder(order).price).toBe(burger.basePrice)
    expect(calculateOrder({ ...order, dishId: 'missing' })).toEqual({ price: 0, calories: 0, priceDelta: 0, calorieDelta: 0 })
  })
})
