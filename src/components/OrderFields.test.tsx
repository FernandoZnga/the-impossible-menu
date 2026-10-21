import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createOrder, dishes } from '../data/catalog'
import { BeverageFields, Customization, DessertFields } from './OrderFields'

describe('ordering controls', () => {
  const dish = dishes.find(item => item.id === 'classic-cheeseburger')!

  it('keeps simple customization small and does not expose overload controls', () => {
    render(<Customization dish={dish} order={createOrder(dish)} detailed={false} impossible={false} onChange={vi.fn()} />)
    expect(screen.getAllByRole('combobox')).toHaveLength(1)
    expect(screen.getByLabelText('Meal portion')).toBeInTheDocument()
    expect(screen.queryByLabelText('Bread preference')).not.toBeInTheDocument()
  })

  it('disables dependent ingredients but preserves other quantity choices', () => {
    const order = createOrder(dish)
    order.bread = 'Lettuce wrap'
    order.quantities['bread-bun'] = 0
    const update = vi.fn()
    render(<Customization dish={dish} order={order} detailed impossible onChange={update} />)
    expect(screen.getByLabelText('Brioche bun')).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Tomatoes'), { target: { value: '2' } })
    expect(update).toHaveBeenCalledWith({ quantities: { ...order.quantities, tomato: 2 } }, 'quantities')
  })

  it('counts real beverage size alternatives only when a beverage is selected', () => {
    const onPresent = vi.fn()
    const order = { ...createOrder(dish), beverageId: 'cola' }
    render(<BeverageFields order={order} detailed={false} simple onChange={vi.fn()} onPresent={onPresent} />)
    expect(screen.getByLabelText('Beverage size').querySelectorAll('option')).toHaveLength(4)
    expect(onPresent).toHaveBeenCalledWith('cola', 4)
  })

  it('counts sauce quantity alternatives only after revealing that control', () => {
    const order = { ...createOrder(dish), dessertId: 'tiramisu' }
    const onPresent = vi.fn()
    const { rerender } = render(<DessertFields order={order} detailed simple={false} category="" onCategory={vi.fn()} onChange={vi.fn()} onPresent={onPresent} />)
    expect(screen.queryByLabelText('Sauce quantity')).not.toBeInTheDocument()
    expect(onPresent).not.toHaveBeenCalledWith('sauce-quantity:tiramisu', 4)
    rerender(<DessertFields order={{ ...order, dessertSauce: 'chocolate' }} detailed simple={false} category="" onCategory={vi.fn()} onChange={vi.fn()} onPresent={onPresent} />)
    expect(screen.getByLabelText('Sauce quantity')).toBeInTheDocument()
    expect(onPresent).toHaveBeenCalledWith('sauce-quantity:tiramisu', 4)
  })
})
