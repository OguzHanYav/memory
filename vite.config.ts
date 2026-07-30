import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Plugin zum Kopieren der Karten-Assets
function copyCardAssets() {
  return {
    name: 'copy-card-assets',
    writeBundle() {
      const srcDir = resolve(__dirname, 'src/assets/cards');
      const destDir = resolve(__dirname, 'dist/assets');
      
      if (!fs.existsSync(srcDir)) return;
      
      // Kopiere alle Theme-Ordner (code, games, da, food)
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