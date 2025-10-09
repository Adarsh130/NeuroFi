#!/usr/bin/env node

// Comprehensive project fix script for NeuroFi
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

console.log('🔧 NeuroFi Project Fix Script');
console.log('==============================\n');

try {
  console.log('📦 Installing missing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n✅ Dependencies installed successfully!');
  
  // Update Tailwind config to include the animate plugin
  console.log('🎨 Updating Tailwind configuration...');
  const tailwindConfig = readFileSync('tailwind.config.js', 'utf8');
  const updatedConfig = tailwindConfig.replace(
    'plugins: [],',
    'plugins: [require("tailwindcss-animate")],'
  );
  writeFileSync('tailwind.config.js', updatedConfig);
  
  // Update utils.js to use clsx
  console.log('🔧 Updating utility functions...');
  const utilsContent = `import { clsx } from "clsx";

export function cn(...inputs) {
  return clsx(inputs);
}`;
  writeFileSync('src/lib/utils.js', utilsContent);
  
  // Restore original store files
  console.log('🗄️ Restoring store files...');
  if (existsSync('src/store/sentimentStore-original.js')) {
    const originalSentiment = readFileSync('src/store/sentimentStore-original.js', 'utf8');
    writeFileSync('src/store/sentimentStore.js', originalSentiment);
  }
  
  if (existsSync('src/store/aiStore-original.js')) {
    const originalAi = readFileSync('src/store/aiStore-original.js', 'utf8');
    writeFileSync('src/store/aiStore.js', originalAi);
  }
  
  if (existsSync('src/store/marketStore-original.js')) {
    const originalMarket = readFileSync('src/store/marketStore-original.js', 'utf8');
    writeFileSync('src/store/marketStore.js', originalMarket);
  }
  
  // Restore original dashboard components
  console.log('📊 Restoring dashboard components...');
  if (existsSync('src/components/dashboard/SentimentWidget-original.jsx')) {
    const originalWidget = readFileSync('src/components/dashboard/SentimentWidget-original.jsx', 'utf8');
    writeFileSync('src/components/dashboard/SentimentWidget.jsx', originalWidget);
  }
  
  // Update App.jsx to use the full Home component
  console.log('🏠 Updating main components...');
  const appContent = readFileSync('src/App.jsx', 'utf8');
  if (appContent.includes('Home-fallback')) {
    const updatedApp = appContent.replace(
      "import Home from './pages/Home-fallback';",
      "import Home from './pages/Home';"
    );
    writeFileSync('src/App.jsx', updatedApp);
  }
  
  console.log('\n🎉 Project fixed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:5173');
  console.log('\n✨ All features should now work correctly!');
  
} catch (error) {
  console.error('❌ Fix failed:', error.message);
  console.log('\n🔧 Manual steps required:');
  console.log('1. Run: npm install');
  console.log('2. Update tailwind.config.js plugins');
  console.log('3. Update src/lib/utils.js');
  console.log('4. Restore original store files');
  console.log('5. Update src/App.jsx');
}