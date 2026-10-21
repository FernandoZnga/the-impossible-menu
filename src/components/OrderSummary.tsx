import { ShoppingBag } from 'lucide-react'
import { beverages, dishes, desserts, sides, dessertToppings, dessertSauces } from '../data/catalog'
import { calculateOrder } from '../domain/calculate'
import type { Order } from '../domain/model'

export function OrderSummary({ order, expanded = false }: { order: Order; expanded?: boolean }) {
  const dish = dishes.find(item => item.id === order.dishId)
  const drink = beverages.find(item => item.id === order.beverageId)
  const dessert = desserts.find(item => item.id === order.dessertId)
  const totals = calculateOrder(order)
  const delta = (value: number, suffix: string) => `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(suffix === 'kcal' ? 0 : 2)} ${suffix}`
  return <div className="panel cart-panel"><div className="cart-title"><h2>Your table for one.</h2><ShoppingBag size={19} /></div>
    <div className="cart-item"><strong>{dish?.name ?? 'Your meal'}</strong><span>{dish?.portions.find(item => item.id === order.portionId)?.name} portion</span></div>
    {order.side && <div className="cart-item"><strong>{order.combo ? 'Combo with included side' : sides.find(item => item.id === order.side)?.name}</strong></div>}
    {drink && <div className="cart-item"><strong>{drink.name}</strong><span>{order.beverageSize}</span>{expanded && Object.entries(order.beverageOptions).map(([key, value]) => <small key={key}>{key}: {value}</small>)}</div>}
    {dessert && <div className="cart-item"><strong>{dessert.name}</strong><span>{order.dessertPortion}× portion{order.dessertOffer ? ' · meal offer' : ''}</span>{order.dessertTopping && <small>{dessertToppings.find(item => item.id === order.dessertTopping)?.name}</small>}{order.dessertSauce && <small>{dessertSauces.find(item => item.id === order.dessertSauce)?.name} · {order.dessertSauceQuantity}× sauce</small>}</div>}
    {expanded && dish && <div className="cart-item"><strong>Meal configuration</strong><small>Bread: {order.bread} · Cheese: {order.cheese} · Preparation: {order.cooking}</small>{dish.ingredients.map(item => <small key={item.id}>{item.name}: {order.quantities[item.id] ?? 1}×</small>)}{order.substitutionId && <small>Substitution: {dish.substitutions.find(item => item.id === order.substitutionId)?.name}</small>}{order.extraIds.map(id => <small key={id}>Extra: {dish.extras.find(item => item.id === id)?.name}</small>)}</div>}
    <div className="cart-total" aria-live="polite" aria-atomic="true"><div><span>Estimated total</span><strong>${totals.price.toFixed(2)}</strong></div><div><span>Illustrative energy</span><span>~{Math.round(totals.calories)} kcal</span></div></div>
    <div className="cart-deltas"><small>Ingredient / portion price Δ: {delta(totals.priceDelta, 'USD')}</small><small>Ingredient / portion energy Δ: {delta(totals.calorieDelta, 'kcal')}</small></div>
    <p className="nutrition-note">Mock prices in USD. Nutrition is an illustrative estimate, not medical precision or allergy advice. No real orders or charges.</p>
  </div>
}
