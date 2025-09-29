import express, { Request, Response } from 'express';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
