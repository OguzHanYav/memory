import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const base = mode === 'ftp' ? '/Memory/' : '/';
  
  return {
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    publicDir: 'public',
  };
});