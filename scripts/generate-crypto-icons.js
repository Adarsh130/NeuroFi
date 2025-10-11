#!/usr/bin/env node

/**
 * Script to generate cryptocurrency icon placeholders
 * This script creates placeholder files and provides instructions for obtaining real icons
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Popular cryptocurrencies that should have icons
const PRIORITY_CRYPTOS = [
  'btc', 'eth', 'bnb', 'xrp', 'ada', 'sol', 'doge', 'dot', 'matic', 'ltc',
  'usdt', 'usdc', 'busd', 'dai', 'uni', 'link', 'aave', 'comp', 'avax', 'atom',
  'near', 'algo', 'vet', 'icp', 'hbar', 'fil', 'sand', 'mana', 'axs', 'shib',
  'xmr', 'zec', 'dash', 'ftt', 'bch', 'etc', 'xlm', 'trx', 'theta', 'apt',
  'sui', 'arb', 'op', 'blur', 'ldo', 'grt', 'mkr', 'snx', 'crv', 'yfi'
];

// Create directories
const publicCryptoDir = path.join(__dirname, '../public/images/crypto');
const srcCryptoDir = path.join(__dirname, '../src/assets/images/crypto');

// Ensure directories exist
if (!fs.existsSync(publicCryptoDir)) {
  fs.mkdirSync(publicCryptoDir, { recursive: true });
}

if (!fs.existsSync(srcCryptoDir)) {
  fs.mkdirSync(srcCryptoDir, { recursive: true });
}

console.log('🚀 Generating cryptocurrency icon placeholders...\n');

// Create placeholder files and instructions
const instructions = [];
let createdCount = 0;

PRIORITY_CRYPTOS.forEach(symbol => {
  const filename = `${symbol}.png`;
  const publicPath = path.join(publicCryptoDir, filename);
  const srcPath = path.join(srcCryptoDir, filename);
  
  // Create placeholder files if they don't exist
  if (!fs.existsSync(publicPath)) {
    // Create a simple text file as placeholder
    const placeholder = `# Placeholder for ${symbol.toUpperCase()} icon
# Replace this file with actual ${symbol.toUpperCase()} PNG icon
# Recommended size: 48x48px or 64x64px
# Format: PNG with transparent background
`;
    
    fs.writeFileSync(publicPath.replace('.png', '.placeholder'), placeholder);
    createdCount++;
  }
  
  // Add to instructions
  instructions.push({
    symbol: symbol.toUpperCase(),
    filename,
    publicPath: `public/images/crypto/${filename}`,
    srcPath: `src/assets/images/crypto/${filename}`,
    downloadUrl: `https://cryptoicons.org/api/icon/${symbol}/200`, // Example API
    alternativeUrl: `https://assets.coingecko.com/coins/images/1/large/${symbol}.png`
  });
});

// Generate download script
const downloadScript = `#!/bin/bash

# Cryptocurrency Icons Download Script
# This script downloads cryptocurrency icons from various sources

echo "📥 Downloading cryptocurrency icons..."

# Create directories
mkdir -p public/images/crypto
mkdir -p src/assets/images/crypto

# Function to download icon with fallback
download_icon() {
    local symbol=$1
    local filename="${symbol}.png"
    local output_path="public/images/crypto/${filename}"
    
    echo "Downloading ${symbol}..."
    
    # Try primary source (CryptoIcons.org)
    if curl -s "https://cryptoicons.org/api/icon/${symbol}/200" -o "${output_path}"; then
        echo "✅ Downloaded ${symbol} from CryptoIcons.org"
    # Try secondary source (CoinGecko)
    elif curl -s "https://assets.coingecko.com/coins/images/1/large/${symbol}.png" -o "${output_path}"; then
        echo "✅ Downloaded ${symbol} from CoinGecko"
    # Try tertiary source (CoinMarketCap)
    elif curl -s "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png" -o "${output_path}"; then
        echo "⚠️  Downloaded generic icon for ${symbol}"
    else
        echo "❌ Failed to download ${symbol}"
        rm -f "${output_path}"
    fi
    
    # Copy to src directory if download was successful
    if [ -f "${output_path}" ]; then
        cp "${output_path}" "src/assets/images/crypto/${filename}"
    fi
}

# Download priority cryptocurrencies
${PRIORITY_CRYPTOS.map(symbol => `download_icon "${symbol}"`).join('\n')}

echo "🎉 Download complete! Check public/images/crypto/ for icons."
echo "💡 Tip: You may need to manually download some icons if the APIs are unavailable."
`;

// Write download script
fs.writeFileSync(path.join(__dirname, 'download-crypto-icons.sh'), downloadScript);
fs.chmodSync(path.join(__dirname, 'download-crypto-icons.sh'), '755');

// Generate README with instructions
const readme = `# Cryptocurrency Icons

This directory contains cryptocurrency icons for the NeuroFi application.

## Quick Setup

1. **Automated Download (Recommended)**:
   \`\`\`bash
   cd scripts
   ./download-crypto-icons.sh
   \`\`\`

2. **Manual Download**:
   Download icons manually from the sources listed below.

## Icon Requirements

- **Format**: PNG with transparent background
- **Size**: 48x48px or 64x64px (will be resized automatically)
- **Naming**: Use lowercase symbol (e.g., \`btc.png\`, \`eth.png\`)

## Priority Icons Needed

${PRIORITY_CRYPTOS.map(symbol => `- ${symbol.toUpperCase()}: \`${symbol}.png\``).join('\n')}

## Icon Sources

### Free Sources
1. **CryptoIcons.org**: https://cryptoicons.org/
2. **CoinGecko API**: https://www.coingecko.com/en/api/documentation
3. **CoinMarketCap**: https://coinmarketcap.com/
4. **Cryptocurrency Icons (GitHub)**: https://github.com/spothq/cryptocurrency-icons

### Premium Sources
1. **Iconify**: https://iconify.design/
2. **Flaticon**: https://www.flaticon.com/
3. **Icons8**: https://icons8.com/

## Usage in Components

\`\`\`jsx
import CryptoIcon from '../components/common/CryptoIcon';

// Basic usage
<CryptoIcon symbol="BTC" size={24} />

// With custom styling
<CryptoIcon 
  symbol="ETH" 
  size={48} 
  className="rounded-full border-2 border-gray-300" 
/>

// Disable fallback to SVG
<CryptoIcon symbol="DOGE" size={32} fallback={false} />
\`\`\`

## File Structure

\`\`\`
public/images/crypto/
├── btc.png
├── eth.png
├── bnb.png
└── ...

src/assets/images/crypto/
├── btc.png
├── eth.png
├── bnb.png
└── ...
\`\`\`

## Adding New Icons

1. Download the icon in PNG format
2. Resize to 48x48px or 64x64px
3. Save with lowercase symbol name (e.g., \`newcoin.png\`)
4. Place in both \`public/images/crypto/\` and \`src/assets/images/crypto/\`
5. Add to \`src/utils/cryptoIcons.js\` if it's a new cryptocurrency

## Troubleshooting

### Icon Not Displaying
1. Check if the file exists in \`public/images/crypto/\`
2. Verify the filename matches the symbol (lowercase)
3. Ensure the file is a valid PNG
4. Check browser console for 404 errors

### Fallback Icon Showing
1. The PNG file might be missing or corrupted
2. Check the file path and naming convention
3. Verify the image loads correctly in a browser

### Performance Issues
1. Optimize PNG files using tools like TinyPNG
2. Consider using WebP format for better compression
3. Implement lazy loading for large lists

## License

Icons should be used according to their respective licenses. Most cryptocurrency projects provide official icons that can be used freely for applications that display their tokens.
`;

fs.writeFileSync(path.join(publicCryptoDir, 'README.md'), readme);

// Generate icon manifest
const manifest = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  totalIcons: PRIORITY_CRYPTOS.length,
  icons: instructions.map(icon => ({
    symbol: icon.symbol,
    filename: icon.filename,
    path: icon.publicPath,
    status: 'placeholder'
  }))
};

fs.writeFileSync(path.join(publicCryptoDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

// Summary
console.log(`📊 Summary:`);
console.log(`   Created ${createdCount} placeholder files`);
console.log(`   Generated download script: scripts/download-crypto-icons.sh`);
console.log(`   Created README: public/images/crypto/README.md`);
console.log(`   Created manifest: public/images/crypto/manifest.json`);
console.log(`\n🎯 Next Steps:`);
console.log(`   1. Run: cd scripts && ./download-crypto-icons.sh`);
console.log(`   2. Or manually download icons from the sources listed in the README`);
console.log(`   3. Replace placeholder files with actual PNG icons`);
console.log(`\n💡 The CryptoIcon component will automatically fall back to SVG icons if PNG files are missing.`);