import styles from './LoginForm.module.css'
import { useState } from 'react'
import FormField from '../../molecules/FormField'
import AuthActions from '../../molecules/AuthActions'

export type LoginFormValues = { email: string; password: string }

export type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => Promise<void> | void
  submitting?: boolean
  error?: string | null
}

const LoginForm = ({ onSubmit, submitting, error }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async () => {
    await onSubmit({ email, password })
  }

  return (
    <div className={styles.form}>
      <FormField id="login-email" label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
      <FormField
        id="login-password"
        label="Password"
        value={password}
        onChange={setPassword}
        type="password"
        
      />
      {error ? <div className={styles.error}>{error}</div> : null}
      <AuthActions submitting={submitting} primaryText="Sign In" onSubmit={handleSubmit} />
    </div>
  )
}

export default LoginForm

