import { Router } from 'express'
import { getDb } from '../db'
import { notifyPublicRosterChanged } from '../realtime'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth'

const router = Router()

router.get('/donation', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const db = await getDb()
    const row = await db.get(
      `SELECT streamlabs_url, default_amount, currency
       FROM donation_settings
       WHERE owner_user_id = ?`,
      req.userId,
    )

    if (!row) {
      return res.json({ streamlabsUrl: null, defaultAmount: null, currency: 'USD' })
    }

    return res.json({
      streamlabsUrl: row.streamlabs_url,
      defaultAmount: row.default_amount,
      currency: row.currency,
    })
  } catch (error) {
    console.error('Error fetching donation settings', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.put('/donation', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { streamlabsUrl, defaultAmount, currency } = req.body ?? {}

  if (streamlabsUrl != null && typeof streamlabsUrl !== 'string') {
    return res.status(400).json({ message: 'streamlabsUrl must be a string or null.' })
  }
  if (defaultAmount != null && Number.isNaN(Number(defaultAmount))) {
    return res.status(400).json({ message: 'defaultAmount must be a number or null.' })
  }
  if (currency != null && typeof currency !== 'string') {
    return res.status(400).json({ message: 'currency must be a string.' })
  }

  try {
    const db = await getDb()
    await db.run(
      `INSERT INTO donation_settings (owner_user_id, streamlabs_url, default_amount, currency)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(owner_user_id) DO UPDATE SET
         streamlabs_url = excluded.streamlabs_url,
         default_amount = excluded.default_amount,
         currency = excluded.currency,
         updated_at = CURRENT_TIMESTAMP`,
      req.userId,
      streamlabsUrl ?? null,
      defaultAmount != null ? Number(defaultAmount) : null,
      currency ?? 'USD',
    )

    const row = await db.get(
      `SELECT streamlabs_url, default_amount, currency
       FROM donation_settings
       WHERE owner_user_id = ?`,
      req.userId,
    )

    notifyPublicRosterChanged()
    return res.json({
      streamlabsUrl: row.streamlabs_url,
      defaultAmount: row.default_amount,
      currency: row.currency,
    })
  } catch (error) {
    console.error('Error updating donation settings', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/streamlabs', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const db = await getDb()
    const row = await db.get(
      `SELECT token_expires_at FROM streamlabs_credentials WHERE owner_user_id = ?`,
      req.userId,
    )
    return res.json({
      hasCredentials: Boolean(row),
      tokenExpiresAt: row?.token_expires_at ?? null,
    })
  } catch (error) {
    console.error('Error fetching streamlabs credentials', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.put('/streamlabs', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { accessToken, refreshToken, tokenExpiresAt } = req.body ?? {}

  if (typeof accessToken !== 'string' || !accessToken.trim()) {
    return res.status(400).json({ message: 'accessToken is required.' })
  }
  if (refreshToken != null && typeof refreshToken !== 'string') {
    return res.status(400).json({ message: 'refreshToken must be a string or null.' })
  }
  if (tokenExpiresAt != null && typeof tokenExpiresAt !== 'string') {
    return res.status(400).json({ message: 'tokenExpiresAt must be an ISO date string or null.' })
  }

  try {
    const db = await getDb()
    await db.run(
      `INSERT INTO streamlabs_credentials (owner_user_id, access_token, refresh_token, token_expires_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(owner_user_id) DO UPDATE SET
         access_token = excluded.access_token,
         refresh_token = excluded.refresh_token,
         token_expires_at = excluded.token_expires_at,
         updated_at = CURRENT_TIMESTAMP`,
      req.userId,
      accessToken.trim(),
      refreshToken ?? null,
      tokenExpiresAt ?? null,
    )

    return res.json({ hasCredentials: true, tokenExpiresAt: tokenExpiresAt ?? null })
  } catch (error) {
    console.error('Error updating streamlabs credentials', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.delete('/streamlabs', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const db = await getDb()
    await db.run('DELETE FROM streamlabs_credentials WHERE owner_user_id = ?', req.userId)
    return res.status(204).end()
  } catch (error) {
    console.error('Error deleting streamlabs credentials', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
