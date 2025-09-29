import styles from './FormField.module.css'
import { TextInput, InlineError } from '../../atoms'

export type FormFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  error?: string | null
}

const FormField = ({ id, label, value, onChange, type = 'text', error }: FormFieldProps) => {
  const describedBy = error ? `${id}-error` : undefined
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <TextInput
        id={id}
        label=""
        value={value}
        onChange={onChange}
        type={type}
        ariaInvalid={Boolean(error)}
        ariaDescribedBy={describedBy}
      />
      {error ? (
        <div className={styles.errorWrapper}>
          <InlineError id={describedBy!}>{error}</InlineError>
        </div>
      ) : null}
    </div>
  )
}

export default FormField

