import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export type AuthenticatedRequest = Request & { userId?: number }

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number }
    req.userId = payload.userId
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}

export const signToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}
