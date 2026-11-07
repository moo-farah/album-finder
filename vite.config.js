import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getSpotifyAppToken } from './server/spotifyToken.js'

function spotifyTokenDevApi(env) {
  return {
    name: 'spotify-token-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/token') {
          next()
          return
        }

        if (req.method !== 'GET' && req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Allow', 'GET, POST')
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const clientId = env.SPOTIFY_CLIENT_ID
        const clientSecret = env.SPOTIFY_CLIENT_SECRET
        if (!clientId || !clientSecret) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Spotify credentials are not configured' }))
          return
        }

        try {
          const token = await getSpotifyAppToken({ clientId, clientSecret })
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(token))
        } catch (error) {
          console.error('Spotify token error:', error.message)
          res.statusCode = error.status || 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Could not get a Spotify access token' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), spotifyTokenDevApi(env)],
  }
})
