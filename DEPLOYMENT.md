# Local + Render Deployment

## Local

Backend:
1. `cd backend`
2. `npm ci`
3. Copy `.env.example` to `.env` and fill MongoDB/JWT/Google values.
4. `npm run seed:streak`
5. `npm run dev`

Frontend:
1. `cd frontend`
2. `npm ci`
3. Copy `.env.example` to `.env`.
4. Keep `VITE_API_URL=http://localhost:5000/api`.
5. Set `VITE_GOOGLE_CLIENT_ID` if Google login is enabled.
6. `npm run dev`

The backend allows localhost origins automatically. `FRONTEND_URLS` is used for deployed browser origins.

## Render

### Backend Web Service
- Root directory: `backend`
- Build: `npm ci`
- Start: `npm start`
- Health check: `/api/health`
- Environment: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URLS`, `GOOGLE_CLIENT_ID`

`FRONTEND_URLS` can be comma-separated, e.g.:
`https://your-frontend.onrender.com`

### Frontend Static Site
- Root directory: `frontend`
- Build: `npm ci && npm run build`
- Publish directory: `dist`
- `VITE_API_URL=https://your-backend.onrender.com/api`
- `VITE_GOOGLE_CLIENT_ID=your_google_web_client_id`

### Google OAuth
In Google Cloud Console, add both local and production JavaScript origins:
- `http://localhost:5173`
- `https://your-frontend.onrender.com`

The Google client ID must match the backend `GOOGLE_CLIENT_ID` and frontend `VITE_GOOGLE_CLIENT_ID`.

### MongoDB Atlas
Allow the deployed Render backend to reach Atlas. For an internship/demo deployment, Atlas Network Access can temporarily use `0.0.0.0/0`; for production, use a restricted policy where possible.

Never commit `.env` files or real secrets.

## Direct demo/bypass URL

The frontend also exposes `/demo`. It calls `POST /api/auth/demo`, receives a normal backend JWT, and redirects to `/daily-streak`. This means the login screen can be skipped while all protected streak APIs remain authenticated and server-authoritative.

The frontend intentionally pins Vite 6 instead of Vite 8/Rolldown so Render does not depend on platform-specific Rolldown native optional packages.
