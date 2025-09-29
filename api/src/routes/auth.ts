import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getDb } from '../db'
import { signToken, requireAuth, type AuthenticatedRequest } from '../middleware/auth'

const router = Router()

const COOKIE_NAME = 'token'
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

router.post('/signup', async (req, res) => {
  const { email, password } = req.body ?? {}

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Email is invalid.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' })
  }

  try {
    const db = await getDb()
    const existing = await db.get('SELECT id FROM users WHERE email = ?', normalizedEmail)
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', normalizedEmail, passwordHash)
    const userId = result.lastID
    const token = signToken(userId!)

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    return res.status(201).json({ id: userId, email: normalizedEmail })
  } catch (error) {
    console.error('Signup error', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const db = await getDb()
    const user = await db.get('SELECT id, password_hash FROM users WHERE email = ?', email.trim().toLowerCase())
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const token = signToken(user.id)
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    return res.json({ id: user.id, email: email.trim().toLowerCase() })
  } catch (error) {
    console.error('Login error', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  return res.status(204).end()
})

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const db = await getDb()
    const user = await db.get('SELECT id, email FROM users WHERE id = ?', req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.json(user)
  } catch (error) {
    console.error('Me error', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
