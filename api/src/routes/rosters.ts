import { Router } from 'express'







import { getDb } from '../db'
import { notifyPublicRosterChanged } from '../realtime'







import { requireAuth, type AuthenticatedRequest } from '../middleware/auth'







const router = Router()







const mapChampionRow = (row: any) => ({







  id: row.id as string,







  name: row.name as string,







  imageUrl: row.image_url as string,







  role: row.role ?? null,







  tags: row.tags ? JSON.parse(row.tags) : [],







  isActive: row.is_active === 1,







  position: row.position as number,







})







const fetchRosterWithChampions = async (rosterId: number) => {







  const db = await getDb()







  const roster = await db.get(







    `SELECT id, owner_user_id, name, is_public, created_at, updated_at FROM rosters WHERE id = ?`,







    rosterId,







  )







  if (!roster) {







    return null







  }







  const champions = await db.all(







    `SELECT rc.position, c.id, c.name, c.image_url, c.role, c.tags, c.is_active







     FROM roster_champions rc







     JOIN champions c ON c.id = rc.champion_id







     WHERE rc.roster_id = ?







     ORDER BY rc.position ASC`,







    rosterId,







  )







  return {







    roster,







    champions: champions.map(mapChampionRow),







  }







}







router.get('/public', async (req, res) => {

  const { ownerUserId } = req.query ?? {}



  if (Array.isArray(ownerUserId)) {

    return res.status(400).json({ message: 'ownerUserId must be a single value.' })

  }



  const parsedOwnerId = typeof ownerUserId === 'string' && ownerUserId.trim().length > 0 ? Number(ownerUserId) : null

  if (ownerUserId != null && (Number.isNaN(parsedOwnerId) || !Number.isInteger(parsedOwnerId))) {

    return res.status(400).json({ message: 'ownerUserId must be an integer.' })

  }

  if (parsedOwnerId != null && parsedOwnerId < 1) {

    return res.status(400).json({ message: 'ownerUserId must be a positive integer.' })

  }



  try {

    const db = await getDb()



    const roster = parsedOwnerId != null

      ? await db.get(

          `SELECT id, owner_user_id, name, is_public, created_at, updated_at

           FROM rosters

           WHERE owner_user_id = ? AND is_public = 1

           ORDER BY updated_at DESC

           LIMIT 1`,

          parsedOwnerId,

        )

      : await db.get(

          `SELECT id, owner_user_id, name, is_public, created_at, updated_at

           FROM rosters

           WHERE is_public = 1

           ORDER BY updated_at DESC

           LIMIT 1`,

        )



    if (!roster) {

      return res.status(404).json({ message: 'No public roster found.' })

    }



    const data = await fetchRosterWithChampions(roster.id)

    if (!data) {

      return res.status(404).json({ message: 'No public roster found.' })

    }



    const donation = await db.get(

      `SELECT streamlabs_url, default_amount, currency

       FROM donation_settings

       WHERE owner_user_id = ?`,

      roster.owner_user_id,

    )



    return res.json({

      roster: {

        id: roster.id,

        name: roster.name,

        isPublic: roster.is_public === 1,

        createdAt: roster.created_at,

        updatedAt: roster.updated_at,

      },

      champions: data.champions,

      donationSettings: donation

        ? {

            streamlabsUrl: donation.streamlabs_url,

            defaultAmount: donation.default_amount,

            currency: donation.currency,

          }

        : null,

    })

  } catch (error) {

    console.error('Error fetching public roster', error)

    return res.status(500).json({ message: 'Internal server error' })

  }

})



router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {







  try {







    const db = await getDb()







    const rosters = await db.all(







      `SELECT id, owner_user_id, name, is_public, created_at, updated_at







       FROM rosters







       WHERE owner_user_id = ?







       ORDER BY created_at ASC`,







      req.userId,







    )







    const payload = [] as any[]







    for (const roster of rosters) {







      const data = await fetchRosterWithChampions(roster.id)







      if (data) {







        payload.push({







          id: roster.id,







          name: roster.name,







          isPublic: roster.is_public === 1,







          createdAt: roster.created_at,







          updatedAt: roster.updated_at,







          champions: data.champions,







        })







      }







    }







    return res.json(payload)







  } catch (error) {







    console.error('Error fetching rosters', error)







    return res.status(500).json({ message: 'Internal server error' })







  }







})







router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {







  const { name, championIds = [], isPublic = false } = req.body ?? {}







  if (typeof name !== 'string' || !name.trim()) {







    return res.status(400).json({ message: 'Roster name is required.' })







  }







  if (!Array.isArray(championIds)) {







    return res.status(400).json({ message: 'championIds must be an array.' })







  }







  try {







    const db = await getDb()







    if (isPublic) {







      await db.run('UPDATE rosters SET is_public = 0 WHERE owner_user_id = ?', req.userId)







    }







    const result = await db.run(







      `INSERT INTO rosters (owner_user_id, name, is_public)







       VALUES (?, ?, ?)`,







      req.userId,







      name.trim(),







      isPublic ? 1 : 0,







    )







    const rosterId = result.lastID!







    const insertChampion = await db.prepare(







      `INSERT INTO roster_champions (roster_id, champion_id, position)







       VALUES (?, ?, ?)`,







    )







    let position = 0







    for (const champId of championIds as string[]) {







      if (typeof champId === 'string' && champId.trim()) {







        await insertChampion.run(rosterId, champId.trim().toLowerCase(), position)







        position += 1







      }







    }







    await insertChampion.finalize()







    const data = await fetchRosterWithChampions(rosterId)







        notifyPublicRosterChanged()

    return res.status(201).json({







      id: rosterId,







      name: name.trim(),







      isPublic,







      champions: data?.champions ?? [],







    })







  } catch (error) {







    console.error('Error creating roster', error)







    return res.status(500).json({ message: 'Internal server error' })







  }







})







router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {







  const rosterId = Number(req.params.id)







  const { name, isPublic } = req.body ?? {}







  if (!Number.isInteger(rosterId)) {







    return res.status(400).json({ message: 'Roster id must be an integer.' })







  }







  try {







    const db = await getDb()







    const roster = await db.get(







      'SELECT id, owner_user_id FROM rosters WHERE id = ?',







      rosterId,







    )







    if (!roster || roster.owner_user_id !== req.userId) {







      return res.status(404).json({ message: 'Roster not found.' })







    }







    if (typeof isPublic === 'boolean' && isPublic) {







      await db.run('UPDATE rosters SET is_public = 0 WHERE owner_user_id = ?', req.userId)







    }







    await db.run(







      `UPDATE rosters







       SET







         name = COALESCE(?, name),







         is_public = COALESCE(?, is_public),







         updated_at = CURRENT_TIMESTAMP







       WHERE id = ?`,







      typeof name === 'string' && name.trim() ? name.trim() : null,







      typeof isPublic === 'boolean' ? (isPublic ? 1 : 0) : null,







      rosterId,







    )







    const data = await fetchRosterWithChampions(rosterId)







    if (!data) {







      return res.status(404).json({ message: 'Roster not found.' })







    }







    notifyPublicRosterChanged()
    return res.json({







      id: data.roster.id,







      name: data.roster.name,







      isPublic: data.roster.is_public === 1,







      createdAt: data.roster.created_at,







      updatedAt: data.roster.updated_at,







      champions: data.champions,







    })







  } catch (error) {







    console.error('Error updating roster', error)







    return res.status(500).json({ message: 'Internal server error' })







  }







})







router.put('/:id/order', requireAuth, async (req: AuthenticatedRequest, res) => {







  const rosterId = Number(req.params.id)







  const { championIds } = req.body ?? {}







  if (!Number.isInteger(rosterId)) {







    return res.status(400).json({ message: 'Roster id must be an integer.' })







  }







  if (!Array.isArray(championIds) || championIds.length === 0) {







    return res.status(400).json({ message: 'championIds must be a non-empty array.' })







  }







  try {







    const db = await getDb()







    const roster = await db.get(







      'SELECT id, owner_user_id FROM rosters WHERE id = ?',







      rosterId,







    )







    if (!roster || roster.owner_user_id !== req.userId) {







      return res.status(404).json({ message: 'Roster not found.' })







    }







    const normalizedIds = (championIds as string[]).map((id) => id.trim().toLowerCase())







    const uniqueIds = new Set(normalizedIds)







    if (uniqueIds.size !== normalizedIds.length) {







      return res.status(400).json({ message: 'championIds must not contain duplicates.' })







    }







    const existingRows = (await db.all(







      'SELECT champion_id FROM roster_champions WHERE roster_id = ?',







      rosterId,







    )) as Array<{ champion_id: string }>







    const existingIds = existingRows.map((row) => row.champion_id)







    if (existingIds.length !== normalizedIds.length) {







      return res.status(400).json({ message: 'championIds must include every champion in the roster.' })







    }







    const missing = normalizedIds.filter((id) => !existingIds.includes(id))







    if (missing.length > 0) {







      return res.status(400).json({ message: 'championIds include invalid champions for this roster.' })







    }







    const caseFragments = normalizedIds.map(() => 'WHEN ? THEN ?').join(' ')

    const params: Array<string | number> = normalizedIds.flatMap((id, index) => [id, index])

    params.push(rosterId)



    const savepointName = 'roster_reorder'



    await db.exec(`SAVEPOINT ${savepointName}`)

    try {

      await db.run(

        'UPDATE roster_champions SET position = position + ? WHERE roster_id = ?',

        normalizedIds.length,

        rosterId,

      )



      const sql = `

        UPDATE roster_champions

           SET position = CASE champion_id

             ${caseFragments}

             ELSE position

           END,

               updated_at = CURRENT_TIMESTAMP

         WHERE roster_id = ?

      `

      await db.run(sql, params)



      await db.exec(`RELEASE SAVEPOINT ${savepointName}`)

    } catch (transactionError) {

      await db.exec(`ROLLBACK TO SAVEPOINT ${savepointName}`)

      await db.exec(`RELEASE SAVEPOINT ${savepointName}`)

      throw transactionError

    }







    const data = await fetchRosterWithChampions(rosterId)







        notifyPublicRosterChanged()

    return res.json({







      id: data?.roster.id,







      champions: data?.champions ?? [],







    })







  } catch (error) {







    console.error('Error updating roster order', error)







    return res.status(500).json({ message: 'Internal server error' })







  }







})







router.post('/:id/champions', requireAuth, async (req: AuthenticatedRequest, res) => {







  const rosterId = Number(req.params.id)







  const { championId, position } = req.body ?? {}







  if (!Number.isInteger(rosterId)) {







    return res.status(400).json({ message: 'Roster id must be an integer.' })







  }







  if (typeof championId !== 'string' || !championId.trim()) {







    return res.status(400).json({ message: 'championId is required.' })







  }







  try {







    const db = await getDb()







    const roster = await db.get('SELECT id, owner_user_id FROM rosters WHERE id = ?', rosterId)







    if (!roster || roster.owner_user_id !== req.userId) {







      return res.status(404).json({ message: 'Roster not found.' })







    }







    const champion = await db.get('SELECT id FROM champions WHERE id = ?', championId.trim().toLowerCase())







    if (!champion) {







      return res.status(404).json({ message: 'Champion not found.' })







    }







    const currentMax = await db.get(







      'SELECT MAX(position) as maxPosition FROM roster_champions WHERE roster_id = ?',







      rosterId,







    )







    const nextPosition = Number.isInteger(position)







      ? Number(position)







      : typeof currentMax?.maxPosition === 'number'







        ? currentMax.maxPosition + 1







        : 0







    await db.run(







      `INSERT INTO roster_champions (roster_id, champion_id, position)







       VALUES (?, ?, ?)`,







      rosterId,







      championId.trim().toLowerCase(),







      nextPosition,







    )







    const data = await fetchRosterWithChampions(rosterId)







        notifyPublicRosterChanged()

    return res.status(201).json({ champions: data?.champions ?? [] })







  } catch (error) {







    console.error('Error adding champion to roster', error)







    return res.status(500).json({ message: 'Internal server error' })







  }







})







router.delete('/:id/champions/:championId', requireAuth, async (req: AuthenticatedRequest, res) => {







  const rosterId = Number(req.params.id)







  const { championId } = req.params







  if (!Number.isInteger(rosterId)) {







    return res.status(400).json({ message: 'Roster id must be an integer.' })







  }







  try {







    const db = await getDb()







    const roster = await db.get('SELECT id, owner_user_id FROM rosters WHERE id = ?', rosterId)







    if (!roster || roster.owner_user_id !== req.userId) {







      return res.status(404).json({ message: 'Roster not found.' })







    }







    await db.run(







      'DELETE FROM roster_champions WHERE roster_id = ? AND champion_id = ?',







      rosterId,







      championId,







    )







    const data = await fetchRosterWithChampions(rosterId)







        notifyPublicRosterChanged()

    return res.json({ champions: data?.champions ?? [] })







  } catch (error) {







    console.error('Error removing champion from roster', error)







    return res.status(500).json({ message: 'Internal server error' })







  }







})







router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {







  const rosterId = Number(req.params.id)







  if (!Number.isInteger(rosterId)) {







    return res.status(400).json({ message: 'Roster id must be an integer.' })







  }







  try {







    const db = await getDb()







    const roster = await db.get('SELECT id, owner_user_id FROM rosters WHERE id = ?', rosterId)







    if (!roster || roster.owner_user_id !== req.userId) {







      return res.status(404).json({ message: 'Roster not found.' })







    }







    await db.run('DELETE FROM rosters WHERE id = ?', rosterId)

    notifyPublicRosterChanged()

    return res.status(204).end()







  } catch (error) {







    console.error('Error deleting roster', error)







    return res.status(500).json({ message: 'Internal server error' })







  }







})







export default router
