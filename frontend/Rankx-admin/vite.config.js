    import { defineConfig } from 'vite'
    import tailwindcss from '@tailwindcss/vite'
    import react from '@vitejs/plugin-react'

    export default defineConfig({
      plugins: [react(), tailwindcss()],
      server: {
        proxy: {
                '/api': {
                  // Use the gateway service name (for docker-compose) or your ALB domain
                  target: env.VITE_API_GATEWAY_URL || 'http://localhost:8080',
                  changeOrigin: true,
                  secure: false,
                }
        },
      },
    }) 

