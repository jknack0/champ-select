import { useAuth } from '../../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../templates'
import { AuthCard, LoginForm } from '../../organisms'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
    await login({ email, password })
    navigate('/champ-select-admin', { replace: true })
  }

  return (
    <AuthLayout>
      <AuthCard title="Administrator Login">
        <LoginForm onSubmit={handleSubmit} />
        <p style={{ textAlign: 'center' }}>
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}

export default Login

