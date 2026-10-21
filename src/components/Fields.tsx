import type { ReactNode } from 'react'
import { useId } from 'react'

interface Option { value: string; label: string }
export function SelectField({ label, value, options, onChange, help, disabled = false }: {
  label: string; value: string; options: (string | Option)[]; onChange: (value: string) => void; help?: ReactNode; disabled?: boolean
}) {
  const id = useId()
  return <div className="field"><label htmlFor={id}>{label}</label><select id={id} value={value} disabled={disabled} onChange={event => onChange(event.target.value)} aria-describedby={help ? `${id}-help` : undefined}>{options.map(option => {
    const item = typeof option === 'string' ? { value: option, label: option } : option
    return <option key={item.value} value={item.value}>{item.label}</option>
  })}</select>{help && <small id={`${id}-help`} className="muted">{help}</small>}</div>
}
