import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

/**
 * Vite plugin that copies card assets to the build directory.
 * @returns A Vite plugin object
 */
function copyCardAssets() {
  return {
    name: 'copy-card-assets',
    writeBundle() {
      const srcDir = resolve(__dirname, 'src/assets/cards');
      const destDir = resolve(__dirname, 'dist/assets');
      
      if (!fs.existsSync(srcDir)) return;
      
      const themes = ['code', 'games', 'da', 'food'];
      for (const theme of themes) {
        const srcThemeDir = resolve(srcDir, theme);
        const destThemeDir = resolve(destDir, theme);
        
        if (fs.existsSync(srcThemeDir)) {
          if (!fs.existsSync(destThemeDir)) {
            fs.mkdirSync(destThemeDir, { recursive: true });
          }
          fs.cpSync(srcThemeDir, destThemeDir, { recursive: true });
        }
      }
      
      console.log('✅ Card assets copied to dist/assets/');
    },
  };
}

/**
 * Vite configuration for the Memory Game project.
 * @param mode - The build mode ('development', 'production', 'ftp', 'vercel')
 * @returns Vite configuration object
 */
export default defineConfig(({ mode }) => {
  const base = mode === 'ftp' ? '/Memory/' : '/';
  
  return {
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    publicDir: 'public',
    plugins: [copyCardAssets()],
    server: {
      port: 3000,
    },
  };
});