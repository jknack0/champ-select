import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth'
import { getDb } from './db'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

const app = express()

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
)
app.use(cookieParser())
app.use(express.json())

app.use('/auth', authRouter)

app.get('/', (_req, res) => {
  res.json({ message: 'API is running' })
})

const start = async () => {
  await getDb()
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
