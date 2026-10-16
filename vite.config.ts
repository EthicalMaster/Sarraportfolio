import build from '@hono/vite-build/vercel'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Read server-only settings locally; do not expose them as VITE_* variables.
  const local = loadEnv(mode, process.cwd(), '')
  for (const key of ['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','STUDIO_ALLOWED_USER_IDS','STUDIO_PUBLIC_ORIGIN','STUDIO_ANALYTICS_KEY']) {
    if (!process.env[key] && local[key]) process.env[key] = local[key]
  }
  return {
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
  }
})
