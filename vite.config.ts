import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const base = mode === 'ftp' ? '/Memory/' : '/';
  
  return {
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
        },
      },
    },
    publicDir: 'public',
    server: {
      port: 3000,
    },
  };
});