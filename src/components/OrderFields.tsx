import { useEffect } from 'react'
import { beverages, desserts, dessertToppings, dessertSauces } from '../data/catalog'
import type { BeverageSize, Dish, Order } from '../domain/model'
import { beverageOptionDelta } from '../domain/calculate'
import { isBread, isCheese } from '../domain/options'
import { SelectField } from './Fields'

type Update = (patch: Partial<Order>, field: string) => void
const quantities: Record<number, string> = { 0: 'None', 0.5: 'Less', 1: 'Normal', 1.5: 'Extra', 2: 'Double', 3: 'Triple' }
const money = (value: number) => `${value >= 0 ? '+' : '−'}$${Math.abs(value).toFixed(2)}`

export function Customization({ order, dish, detailed, impossible, onChange }: { order: Order; dish: Dish; detailed: boolean; impossible: boolean; onChange: Update }) {
  const bread = dish.ingredients.some(item => isBread(item.id))
  const cheese = dish.ingredients.some(item => isCheese(item.id))
  return <div className="field-stack">
    {!detailed && <div className="panel field-stack"><SelectField label="Meal portion" value={order.portionId} options={dish.portions.map(portion => ({ value: portion.id, label: `${portion.name} · ${portion.multiplier}× meal price & calories` }))} onChange={value => onChange({ portionId: value }, 'portionId')} />
      {impossible && bread && <SelectField label="Bread preference" value={order.bread} options={[{ value: 'Standard', label: 'Standard' }, { value: 'Wholegrain', label: 'Wholegrain · +$0.50 / +10 kcal per bread unit' }, 'Lettuce wrap', 'No bread']} onChange={value => onChange({ bread: value }, 'bread')} />}
      {impossible && cheese && <SelectField label="Cheese preference" value={order.cheese} options={['Standard', 'No cheese']} onChange={value => onChange({ cheese: value }, 'cheese')} />}
      {impossible && <SelectField label="Preparation preference" value={order.cooking} options={['Chef recommended', 'Lightly cooked', 'Medium', 'Well done']} onChange={value => onChange({ cooking: value }, 'cooking')} help="A simulated preference only; never cooking or food-safety advice." />}
      <p className="muted">Allergens: {dish.allergens.join(', ') || 'None listed; not a safety guarantee'}. {dish.dietary.join(' · ')}.</p>
      {dish.restrictions.length > 0 && <p className="muted">Customization notes: {dish.restrictions.join(' · ')}</p>}
    </div>}
    {detailed && <><div className="panel"><h2>Ingredient by ingredient.</h2><p className="muted">Changes below are before the meal portion multiplier. All nutrition is illustrative.</p><div className="ingredient-list">{dish.ingredients.map(item => {
      const disabled = (order.bread === 'Lettuce wrap' || order.bread === 'No bread') && isBread(item.id) || order.cheese === 'No cheese' && isCheese(item.id)
      const quantity = order.quantities[item.id] ?? 1
      return <SelectField key={item.id} label={item.name} value={String(quantity)} disabled={disabled} options={item.quantities.map(value => ({ value: String(value), label: `${quantities[value] ?? `${value}×`} · ${money((value - 1) * item.price)} · ${Math.round((value - 1) * item.calories)} kcal Δ` }))} onChange={value => onChange({ quantities: { ...order.quantities, [item.id]: Number(value) } }, 'quantities')} help={disabled ? 'Disabled by your bread or cheese preference. Change it in Make it yours.' : item.allergens.length ? `Contains ${item.allergens.join(', ')}` : undefined} />
    })}</div></div>
      <div className="panel field-stack"><SelectField label="Protein substitution" value={order.substitutionId} options={[{ value: '', label: 'Keep original ingredients' }, ...dish.substitutions.map(item => ({ value: item.id, label: `${item.name} · $${item.price.toFixed(2)} · ~${item.calories} kcal` }))]} onChange={value => onChange({ substitutionId: value }, 'substitutionId')} help="Replaces the dish’s primary protein; incompatible extras are removed with a clear message." /><fieldset><legend>Optional extras</legend>{dish.extras.map(extra => <label className="checkbox-field" key={extra.id}><input type="checkbox" checked={order.extraIds.includes(extra.id)} onChange={event => onChange({ extraIds: event.target.checked ? [...order.extraIds, extra.id] : order.extraIds.filter(id => id !== extra.id) }, 'extraIds')} /><span>{extra.name} · +${extra.price.toFixed(2)} · ~{extra.calories} kcal{extra.allergens.length ? ` · ${extra.allergens.join(', ')}` : ''}</span></label>)}</fieldset></div></>}
  </div>
}

export function BeverageFields({ order, detailed, simple, onChange, onPresent }: { order: Order; detailed: boolean; simple: boolean; onChange: Update; onPresent: (key: string, count: number) => void }) {
  const drink = beverages.find(item => item.id === order.beverageId)
  useEffect(() => {
    if (drink) onPresent(drink.id, detailed ? Object.values(drink.options).reduce((sum, options) => sum + (options?.length ?? 0), 0) : 4)
  }, [drink, detailed, onPresent])
  return <div className="panel field-stack">
    {!detailed && <SelectField label="Beverage" value={order.beverageId} onChange={value => onChange({ beverageId: value, beverageOptions: {} }, 'beverageId')} options={[{ value: '', label: 'No beverage' }, ...beverages.map(item => ({ value: item.id, label: `${item.name} · from $${item.sizes.Small.price.toFixed(2)}` }))]} />}
    {drink && (!detailed || simple) && <SelectField label="Beverage size" value={order.beverageSize} options={(Object.keys(drink.sizes) as BeverageSize[]).map(size => ({ value: size, label: `${size} · $${drink.sizes[size].price.toFixed(2)} · ~${drink.sizes[size].calories} kcal` }))} onChange={value => onChange({ beverageSize: value as BeverageSize }, 'beverageSize')} />}
    {detailed && drink && <><h2>{drink.name}</h2><div className="ingredient-list">{Object.entries(drink.options).map(([key, values]) => <SelectField key={key} label={`Drink ${key === 'milk' ? 'milk addition' : key}`} value={order.beverageOptions[key] ?? values?.[0] ?? ''} help={key === 'milk' ? 'Adds a splash; does not remove any milk already in the drink. Not an allergy-safe substitution.' : undefined} options={(values ?? []).map(value => {
      const delta = beverageOptionDelta(key, value)
      return { value, label: `${value} · ${money(delta.price)} · ${delta.calories} kcal Δ` }
    })} onChange={value => onChange({ beverageOptions: { ...order.beverageOptions, [key]: value } }, 'beverageOptions')} />)}</div></>}
    {detailed && !drink && <p>No beverage selected. Continue, or go back to choose one.</p>}
  </div>
}

export function DessertFields({ order, detailed, simple, category, onCategory, onChange, onPresent }: { order: Order; detailed: boolean; simple: boolean; category: string; onCategory: (value: string) => void; onChange: Update; onPresent: (key: string, count: number) => void }) {
  const dessert = desserts.find(item => item.id === order.dessertId)
  const categories = [...new Set(desserts.map(item => item.category))]
  const visibleDesserts = desserts.filter(item => simple || !category || item.category === category || item.id === order.dessertId)
  useEffect(() => {
    if (!detailed) onPresent(`items:${simple ? 'simple' : category}`, visibleDesserts.length + 1 + (simple ? 0 : categories.length + 1))
    else if (dessert) {
      onPresent(`details:${dessert.id}`, dessertToppings.length + dessertSauces.length + 7)
      if (order.dessertSauce) onPresent(`sauce-quantity:${dessert.id}`, 4)
    }
  }, [dessert, detailed, simple, category, visibleDesserts.length, categories.length, order.dessertSauce, onPresent])
  return <div className="panel field-stack">
    {!detailed && <>
      {!simple && <SelectField label="Dessert category" value={category} options={[{ value: '', label: 'All categories' }, ...categories]} onChange={onCategory} />}
      <SelectField label="Dessert" value={order.dessertId} options={[{ value: '', label: 'No dessert' }, ...visibleDesserts.map(item => ({ value: item.id, label: `${item.name} · $${item.price.toFixed(2)} · ~${item.calories} kcal` }))]} onChange={value => onChange({ dessertId: value }, 'dessertId')} />
    </>}
    {detailed && dessert && <><h2>{dessert.name}</h2><p className="muted">Contains: {dessert.allergens.join(', ') || 'No listed allergens; not a safety guarantee'}.</p><SelectField label="Dessert portion" value={String(order.dessertPortion)} options={[{ value: '0.5', label: 'Tasting · 0.5×' }, { value: '1', label: 'Regular · 1×' }, { value: '1.5', label: 'Sharing · 1.5×' }]} onChange={value => onChange({ dessertPortion: Number(value) }, 'dessertPortion')} />
      <SelectField label="Dessert topping" value={order.dessertTopping} options={[{ value: '', label: 'No topping' }, ...dessertToppings.map(item => ({ value: item.id, label: `${item.name} · +$${item.price.toFixed(2)} · ~${item.calories} kcal` }))]} onChange={value => onChange({ dessertTopping: value }, 'dessertTopping')} />
      <SelectField label="Dessert sauce" value={order.dessertSauce} options={[{ value: '', label: 'No sauce' }, ...dessertSauces.map(item => ({ value: item.id, label: `${item.name} · +$${item.price.toFixed(2)} · ~${item.calories} kcal per portion` }))]} onChange={value => onChange({ dessertSauce: value }, 'dessertSauce')} />
      {order.dessertSauce && <SelectField label="Sauce quantity" value={String(order.dessertSauceQuantity)} options={[{ value: '0.5', label: 'Less · 0.5×' }, { value: '1', label: 'Normal · 1×' }, { value: '2', label: 'Double · 2×' }, { value: '3', label: 'Triple · 3×' }]} onChange={value => onChange({ dessertSauceQuantity: Number(value) }, 'dessertSauceQuantity')} />}
      <label className="checkbox-field"><input type="checkbox" checked={order.dessertOffer} onChange={event => onChange({ dessertOffer: event.target.checked }, 'dessertOffer')} /><span>Combine with meal offer: 10% off the dessert base portion. No extra item added.</span></label>
    </>}
    {detailed && !dessert && <p>No dessert selected. You can continue without one.</p>}
  </div>
}
