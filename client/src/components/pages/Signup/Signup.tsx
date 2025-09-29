import { useAuth } from '../../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../templates'
import { AuthCard, SignupForm } from '../../organisms'

const Signup = () => {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
    await signup({ email, password })
    navigate('/champ-select-admin', { replace: true })
  }

  return (
    <AuthLayout>
      <AuthCard title="Create Administrator Account">
        <SignupForm onSubmit={handleSubmit} />
        <p style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}

export default Signup
