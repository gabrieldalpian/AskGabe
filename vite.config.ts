import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// On Vercel, api/chat.ts runs as a serverless function. This serves the same
// handler from the dev server so `npm run dev` works without the Vercel CLI.
function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk)
          const { POST } = await server.ssrLoadModule('/api/chat.ts')
          const response: Response = await POST(
            new Request('http://localhost/api/chat', { method: 'POST', body: Buffer.concat(chunks) }),
          )
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          if (response.body) for await (const chunk of response.body) res.write(chunk)
          res.end()
        } catch (err) {
          server.config.logger.error(`/api/chat failed: ${err}`)
          res.statusCode = 500
          res.end()
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_* vars to the browser; the API key stays server-side.
  const apiKey = loadEnv(mode, process.cwd(), '').ANTHROPIC_API_KEY
  if (apiKey) process.env.ANTHROPIC_API_KEY = apiKey
  return {
    plugins: [react(), devApi()],
  }
})
