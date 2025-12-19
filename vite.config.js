import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseApi = env.VITE_BASE_API || '/dev-api'

  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: 'css' })],
        dts: 'src/auto-imports.d.ts'
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'css', directives: true })],
        dts: 'src/components.d.ts'
      }),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
        symbolId: 'icon-[name]'
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    server: {
      port: 9527,
      open: false,
      proxy: {
        [baseApi]: {
          target: 'https://nrlptt.com/',
          changeOrigin: true,
          rewrite: (pathValue) => pathValue.replace(new RegExp(`^${baseApi}`), '')
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api']
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('/xlsx/')) return 'xlsx'
              if (id.includes('/element-plus/')) return 'element-plus'
              if (id.includes('/echarts/')) return 'echarts'
              if (id.includes('/codemirror/')) return 'codemirror'
              return 'vendor'
            }
            return undefined
          }
        }
      },
      chunkSizeWarningLimit: 800
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['tests/setup.js']
    }
  }
})
