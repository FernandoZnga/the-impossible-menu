import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SelectField } from './Fields'

describe('SelectField', () => {
  it('has a programmatic label and reports selected values', () => {
    const change = vi.fn()
    render(<SelectField label="Portion" value="regular" options={['regular', 'large']} onChange={change} help="Choose a size." />)
    const select = screen.getByRole('combobox', { name: 'Portion' })
    expect(select).toHaveAccessibleDescription('Choose a size.')
    fireEvent.change(select, { target: { value: 'large' } })
    expect(change).toHaveBeenCalledWith('large')
  })

  it('allows disabling a dependent option without removing its explanation', () => {
    render(<SelectField label="Cheese quantity" value="0" options={['0', '1']} onChange={() => {}} disabled help="Disabled by no cheese." />)
    expect(screen.getByLabelText('Cheese quantity')).toBeDisabled()
    expect(screen.getByLabelText('Cheese quantity')).toHaveAccessibleDescription('Disabled by no cheese.')
  })
})
