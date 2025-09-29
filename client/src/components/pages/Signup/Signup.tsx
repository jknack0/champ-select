import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import styles from './Signup.module.css'

const Signup = () => {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await signup({ email, password })
      navigate('/champ-select-admin', { replace: true })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to sign up. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.pageContainer}>
      <h1 className={styles.heading}>Create Administrator Account</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            className={styles.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            className={styles.input}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <div className={styles.error}>{error}</div> : null}
        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>
      <p className={styles.footer}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </section>
  )
}

export default Signup


