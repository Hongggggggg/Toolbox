import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 启用 HMR
    hmr: true,
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/App.tsx',
        './src/main.tsx',
        './src/components/layout/Navbar.tsx',
        './src/components/layout/Footer.tsx',
      ],
    },
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.baidu.com;
        style-src 'self' 'unsafe-inline' https://cdn.bootcdn.net;
        font-src 'self' https://cdn.bootcdn.net data: https://cdn.bootcdn.net/ajax/libs/font-awesome/;
        img-src 'self' data: blob: https://*.baidu.com;
        connect-src 'self' ws: wss: https://*.baidu.com;
        frame-src 'self' https://*.baidu.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        manifest-src 'self';
        worker-src 'self' blob:;
      `.replace(/\s+/g, ' ').trim()
    }
  },
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 禁用源码映射
    sourcemap: false,
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 分块策略
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
        },
        // 优化分块策略
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 设置块大小警告限制
    chunkSizeWarningLimit: 1000,
    // 压缩大型输出文件
    reportCompressedSize: true,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    // 强制预构建这些依赖
    force: true,
  },
  // 性能优化
  esbuild: {
    // 删除生产环境下的 console 和 debugger
    drop: ['console', 'debugger'],
    // 压缩空格
    minifyWhitespace: true,
    // 压缩标识符
    minifyIdentifiers: true,
    // 压缩语法
    minifySyntax: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
