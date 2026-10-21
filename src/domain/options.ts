export interface Adjustment { price: number; calories: number }

/** Additive options, per drink. "Standard" is already included in the size price. */
export const beverageOptionPrices: Record<string, Record<string, Adjustment>> = {
  ice: { Regular: { price: 0, calories: 0 }, Less: { price: 0, calories: 0 }, 'No ice': { price: 0, calories: 0 } },
  sweetness: {
    Standard: { price: 0, calories: 0 },
    Unsweetened: { price: 0, calories: -20 },
    'Extra sweet': { price: 0.25, calories: 35 },
  },
  syrup: { None: { price: 0, calories: 0 }, Vanilla: { price: 0.65, calories: 40 }, Caramel: { price: 0.65, calories: 45 } },
  toppings: {
    None: { price: 0, calories: 0 },
    'Tapioca pearls': { price: 0.85, calories: 100 },
    'Coconut jelly': { price: 0.85, calories: 65 },
    'Chia seeds': { price: 0.75, calories: 55 },
  },
  lemon: { None: { price: 0, calories: 0 }, Slice: { price: 0.15, calories: 2 } },
  milk: {
    None: { price: 0, calories: 0 },
    'Whole milk': { price: 0.5, calories: 30 },
    'Oat milk': { price: 0.65, calories: 25 },
  },
  temperature: { Hot: { price: 0, calories: 0 }, Iced: { price: 0, calories: 0 } },
}

/** Milk options add a splash; milk already in a latte/lassi remains included. */
export const pricing = {
  wholegrain: { price: 0.5, calories: 10 },
  dessertOfferDiscount: 0.1,
}

/** Bread servings, not breadcrumbs used as a coating. Shared with the UI. */
export const isBread = (id: string, name = ''): boolean => /\b(bread|bun|tortillas?|pita|flatbread)\b/i.test(`${id} ${name}`)
export const isCheese = (id: string, name = ''): boolean => /cheese/i.test(`${id} ${name}`)

/** Snap untrusted values to the nearest advertised choice; ties prefer the lower choice. */
export function validQuantity(value: number | undefined, choices: number[], fallback = 1): number {
  if (value === undefined || !Number.isFinite(value)) return fallback
  return choices.reduce((best, choice) => Math.abs(choice - value) < Math.abs(best - value) ? choice : best, choices[0] ?? fallback)
}
