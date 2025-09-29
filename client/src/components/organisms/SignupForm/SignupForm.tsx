import styles from './SignupForm.module.css'
import { useState } from 'react'
import FormField from '../../molecules/FormField'
import AuthActions from '../../molecules/AuthActions'

export type SignupFormValues = { email: string; password: string }

export type SignupFormProps = {
  onSubmit: (values: SignupFormValues) => Promise<void> | void
  submitting?: boolean
  error?: string | null
}

const SignupForm = ({ onSubmit, submitting, error }: SignupFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async () => {
    await onSubmit({ email, password })
  }

  return (
    <div className={styles.form}>
      <FormField id="signup-email" label="Email" value={email} onChange={setEmail} type="email" />
      <FormField id="signup-password" label="Password" value={password} onChange={setPassword} type="password" />
      {error ? <div className={styles.error}>{error}</div> : null}
      <AuthActions submitting={submitting} primaryText="Sign Up" onSubmit={handleSubmit} />
    </div>
  )
}

export default SignupForm
