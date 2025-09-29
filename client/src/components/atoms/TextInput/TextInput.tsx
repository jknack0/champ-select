import type { ChangeEvent, InputHTMLAttributes } from 'react'
import styles from './TextInput.module.css'

type TextInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
  ariaInvalid?: boolean
  ariaDescribedBy?: string
}

const TextInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  ariaInvalid,
  ariaDescribedBy,
}: TextInputProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={ariaInvalid ? 'true' : undefined}
        aria-describedby={ariaDescribedBy}
        className={styles.field}
      />
    </div>
  )
}

export default TextInput
