import { Router } from 'express'
import { getDb } from '../db'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth'

const router = Router()

const mapChampionRow = (row: any) => ({
  id: row.id as string,
  name: row.name as string,
  imageUrl: row.image_url as string,
  role: row.role ?? null,
  tags: row.tags ? JSON.parse(row.tags) : [],
  isActive: row.is_active === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

router.get('/', async (_req, res) => {
  try {
    const db = await getDb()
    const champions = await db.all(`
      SELECT id, name, image_url, role, tags, is_active, created_at, updated_at
      FROM champions
      WHERE is_active = 1
      ORDER BY name ASC
    `)
    return res.json(champions.map(mapChampionRow))
  } catch (error) {
    console.error('Error fetching champions', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id, name, imageUrl, role, tags } = req.body ?? {}

  if (typeof id !== 'string' || !id.trim()) {
    return res.status(400).json({ message: 'Champion id is required.' })
  }
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Champion name is required.' })
  }
  if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return res.status(400).json({ message: 'Champion imageUrl is required.' })
  }

  const normalizedId = id.trim().toLowerCase()

  try {
    const db = await getDb()
    const existing = await db.get('SELECT id FROM champions WHERE id = ?', normalizedId)
    if (existing) {
      return res.status(409).json({ message: 'Champion already exists.' })
    }

    await db.run(
      `INSERT INTO champions (id, name, image_url, role, tags) VALUES (?, ?, ?, ?, ?)`
        ,
      normalizedId,
      name.trim(),
      imageUrl.trim(),
      typeof role === 'string' && role.trim() ? role.trim() : null,
      Array.isArray(tags) && tags.length > 0 ? JSON.stringify(tags) : null,
    )

    const inserted = await db.get(
      `SELECT id, name, image_url, role, tags, is_active, created_at, updated_at FROM champions WHERE id = ?`,
      normalizedId,
    )

    return res.status(201).json(mapChampionRow(inserted))
  } catch (error) {
    console.error('Error creating champion', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params
  const { name, imageUrl, role, tags, isActive } = req.body ?? {}

  if (!id) {
    return res.status(400).json({ message: 'Champion id is required.' })
  }

  try {
    const db = await getDb()
    const existing = await db.get('SELECT id FROM champions WHERE id = ?', id)
    if (!existing) {
      return res.status(404).json({ message: 'Champion not found.' })
    }

    await db.run(
      `UPDATE champions
       SET
         name = COALESCE(?, name),
         image_url = COALESCE(?, image_url),
         role = COALESCE(?, role),
         tags = CASE WHEN ? IS NULL THEN tags ELSE ? END,
         is_active = COALESCE(?, is_active),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      typeof name === 'string' && name.trim() ? name.trim() : null,
      typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null,
      typeof role === 'string' && role.trim() ? role.trim() : null,
      Array.isArray(tags) ? JSON.stringify(tags) : null,
      Array.isArray(tags) ? JSON.stringify(tags) : null,
      typeof isActive === 'boolean' ? (isActive ? 1 : 0) : null,
      id,
    )

    const updated = await db.get(
      `SELECT id, name, image_url, role, tags, is_active, created_at, updated_at FROM champions WHERE id = ?`,
      id,
    )

    return res.json(mapChampionRow(updated))
  } catch (error) {
    console.error('Error updating champion', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params
  if (!id) {
    return res.status(400).json({ message: 'Champion id is required.' })
  }

  try {
    const db = await getDb()
    const result = await db.run('UPDATE champions SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', id)
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Champion not found.' })
    }
    return res.status(204).end()
  } catch (error) {
    console.error('Error deleting champion', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

