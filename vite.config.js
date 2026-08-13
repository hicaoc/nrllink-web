import { defineConfig, loadEnv, lazyPlugins } from 'vite-plus'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import createSvgSpritePlugin from 'vite-plugin-svg-sprite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseApi = env.VITE_BASE_API || '/dev-api'
  const generateDts = mode !== 'production'
  // API 代理目标(可用 VITE_PROXY_TARGET 覆盖)
  const proxyTarget = env.VITE_PROXY_TARGET || 'https://js.nrlptt.com/'

  return {
    fmt: {
      singleQuote: true,
      semi: false,
      trailingComma: 'es5',
      ignorePatterns: [
        'docs/**',
        'serial-tool/**',
        'public/**',
        'dist/**',
        '*.md',
        'src/assets/custom-theme/**',
        'src/auto-imports.d.ts',
        'src/components.d.ts',
      ],
    },
    lint: {
      jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
      rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
      options: { typeAware: true, typeCheck: true },
    },
    staged: {
      '*.{js,ts,tsx,vue}': 'vp check --fix',
    },
    plugins: lazyPlugins(() => [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: 'css' })],
        dts: generateDts ? 'src/auto-imports.d.ts' : false,
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'css', directives: true })],
        dts: generateDts ? 'src/components.d.ts' : false,
      }),
      createSvgSpritePlugin({
        symbolId: 'icon-[name]',
        include: '**/src/icons/svg/*.svg',
      }),
    ]),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 9527,
      open: false,
      proxy: {
        [baseApi]: {
          target: proxyTarget,
          ws: true,
          changeOrigin: true,
          rewrite: (pathValue) => pathValue.replace(new RegExp(`^${baseApi}`), ''),
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: false,
      rollupOptions: {
        onwarn(warning, warn) {
          // 屏蔽 node_modules 中 Rolldown 无法识别的 #__PURE__ 注释位置警告(第三方库写法问题,不影响产物)
          if (warning.code === 'INVALID_ANNOTATION') return
          warn(warning)
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('/three/')) return 'three'
              if (id.includes('/xlsx/')) return 'xlsx'
              if (id.includes('/element-plus/')) return 'element-plus'
              if (id.includes('/echarts/')) return 'echarts'
              if (id.includes('/codemirror/')) return 'codemirror'
              return 'vendor'
            }
            return undefined
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['tests/setup.js'],
    },
  }
})
