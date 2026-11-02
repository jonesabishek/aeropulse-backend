# AeroPulse Backend

Express API and Socket.IO server for the AeroPulse wind monitoring platform.

## Local development

```bash
npm install
npm start
```

The API listens on port `5000` by default. Copy `.env.example` to `.env` to configure MongoDB and the JWT signing secret locally. Keep `.env` out of Git.

## Deploy to Render

The included `render.yaml` configures a Node web service and health check at `/health`.

1. Create a Render Web Service from the `aeropulse-backend` GitHub repository and use the repository root.
2. Apply the Blueprint settings from `render.yaml`, or set the build command to `npm install` and the start command to `npm start`.
3. Set `MONGODB_URI` to your database connection string and `JWT_SECRET` to a long, unique secret. Never commit either value.
4. Wait for the service to become healthy, then use its HTTPS URL as `VITE_API_URL` in the frontend deployment.

## Push to GitHub

After creating an empty repository named `aeropulse-backend`:

```bash
git remote add origin https://github.com/YOUR_USERNAME/aeropulse-backend.git
git branch -M main
git push -u origin main
```
