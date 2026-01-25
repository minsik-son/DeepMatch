import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import compareRouter from './routes/compare';
const whitelist = [
  'https://make-it-cheaper.vercel.app',
  'https://make-it-cheaper-git-featur-5ccc15-minsik-sons-projects-d87de25c.vercel.app',
  'http://localhost:3000',
  'chrome-extension://kcgkbfchonnemoehcooaojbmhnecgghk'
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // 1. origin이 없거나 (서버 간 통신)
    // 2. 크롬 익스텐션 요청이거나
    // 3. whitelist에 포함되어 있거나
    // 4. Vercel 프리뷰 주소 (*.vercel.app) 인 경우 허용
    const isExtension = origin && origin.startsWith('chrome-extension://');
    const isWhitelisted = origin && whitelist.indexOf(origin) !== -1;
    const isVercelPreview = origin && origin.endsWith('.vercel.app');

    if (
      !origin ||
      isExtension ||
      isWhitelisted ||
      isVercelPreview
    ) {
      callback(null, true);
    } else {
      console.error('CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Explicitly handle preflight requests
app.use(express.json());

app.use('/api/compare', compareRouter);

app.get('/', (req, res) => {
  res.send('MakeItCheaper Backend is running');
});
// Export for Vercel
export default app;

// Only start server if not running in Vercel (serverless)
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
