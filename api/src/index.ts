import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth'
import championsRouter from './routes/champions'
import rostersRouter from './routes/rosters'
import settingsRouter from './routes/settings'
import { initRealtime } from './realtime'
import { getDb } from './db'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

const app = express()
const server = createServer(app)

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
)
app.use(cookieParser())
app.use(express.json())

app.use('/auth', authRouter)
app.use('/champions', championsRouter)
app.use('/rosters', rostersRouter)
app.use('/settings', settingsRouter)

app.get('/', (_req, res) => {
  res.json({ message: 'API is running' })
})

const start = async () => {
  await getDb()
  initRealtime(server, CLIENT_ORIGIN)
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
