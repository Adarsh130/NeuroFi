/**
 * Cryptocurrency icons utility
 * Provides mappings and utilities for cryptocurrency icons
 */

// Comprehensive list of cryptocurrency symbols with their details
export const CRYPTO_LIST = [
  // Major cryptocurrencies
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { symbol: 'BNB', name: 'BNB', color: '#F3BA2F' },
  { symbol: 'XRP', name: 'XRP', color: '#23292F' },
  { symbol: 'ADA', name: 'Cardano', color: '#0033AD' },
  { symbol: 'SOL', name: 'Solana', color: '#9945FF' },
  { symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633' },
  { symbol: 'DOT', name: 'Polkadot', color: '#E6007A' },
  { symbol: 'MATIC', name: 'Polygon', color: '#8247E5' },
  { symbol: 'LTC', name: 'Litecoin', color: '#BFBBBB' },
  
  // Stablecoins
  { symbol: 'USDT', name: 'Tether', color: '#26A17B' },
  { symbol: 'USDC', name: 'USD Coin', color: '#2775CA' },
  { symbol: 'BUSD', name: 'Binance USD', color: '#F0B90B' },
  { symbol: 'DAI', name: 'Dai', color: '#F5AC37' },
  { symbol: 'TUSD', name: 'TrueUSD', color: '#002868' },
  { symbol: 'USDP', name: 'Pax Dollar', color: '#00D4AA' },
  { symbol: 'FRAX', name: 'Frax', color: '#000000' },
  
  // DeFi tokens
  { symbol: 'UNI', name: 'Uniswap', color: '#FF007A' },
  { symbol: 'LINK', name: 'Chainlink', color: '#375BD2' },
  { symbol: 'AAVE', name: 'Aave', color: '#B6509E' },
  { symbol: 'COMP', name: 'Compound', color: '#00D395' },
  { symbol: 'MKR', name: 'Maker', color: '#1AAB9B' },
  { symbol: 'SNX', name: 'Synthetix', color: '#5FCDF9' },
  { symbol: 'CRV', name: 'Curve DAO Token', color: '#FF0000' },
  { symbol: 'YFI', name: 'yearn.finance', color: '#006AE3' },
  { symbol: 'SUSHI', name: 'SushiSwap', color: '#FA52A0' },
  { symbol: '1INCH', name: '1inch', color: '#1F2937' },
  
  // Layer 1 blockchains
  { symbol: 'AVAX', name: 'Avalanche', color: '#E84142' },
  { symbol: 'LUNA', name: 'Terra Luna', color: '#F9D71C' },
  { symbol: 'ATOM', name: 'Cosmos', color: '#2E3148' },
  { symbol: 'NEAR', name: 'NEAR Protocol', color: '#000000' },
  { symbol: 'ALGO', name: 'Algorand', color: '#000000' },
  { symbol: 'VET', name: 'VeChain', color: '#15BDFF' },
  { symbol: 'ICP', name: 'Internet Computer', color: '#29ABE2' },
  { symbol: 'HBAR', name: 'Hedera', color: '#000000' },
  { symbol: 'FIL', name: 'Filecoin', color: '#0090FF' },
  { symbol: 'EOS', name: 'EOS', color: '#000000' },
  { symbol: 'XTZ', name: 'Tezos', color: '#2C7DF7' },
  { symbol: 'FLOW', name: 'Flow', color: '#00EF8B' },
  { symbol: 'KSM', name: 'Kusama', color: '#000000' },
  { symbol: 'NEO', name: 'Neo', color: '#58BF00' },
  { symbol: 'WAVES', name: 'Waves', color: '#0155FF' },
  
  // Gaming & Metaverse
  { symbol: 'SAND', name: 'The Sandbox', color: '#00D4FF' },
  { symbol: 'MANA', name: 'Decentraland', color: '#FF2D55' },
  { symbol: 'AXS', name: 'Axie Infinity', color: '#0055D4' },
  { symbol: 'GALA', name: 'Gala', color: '#000000' },
  { symbol: 'ENJ', name: 'Enjin Coin', color: '#624DBF' },
  { symbol: 'CHZ', name: 'Chiliz', color: '#CD212A' },
  { symbol: 'IMX', name: 'Immutable X', color: '#000000' },
  
  // Meme coins
  { symbol: 'SHIB', name: 'Shiba Inu', color: '#FFA409' },
  { symbol: 'PEPE', name: 'Pepe', color: '#00FF00' },
  { symbol: 'FLOKI', name: 'Floki', color: '#000000' },
  { symbol: 'BABYDOGE', name: 'Baby Doge Coin', color: '#F4A460' },
  
  // Privacy coins
  { symbol: 'XMR', name: 'Monero', color: '#FF6600' },
  { symbol: 'ZEC', name: 'Zcash', color: '#F4B728' },
  { symbol: 'DASH', name: 'Dash', color: '#008CE7' },
  { symbol: 'ZEN', name: 'Horizen', color: '#041742' },
  
  // Exchange tokens
  { symbol: 'FTT', name: 'FTX Token', color: '#02A6C2' },
  { symbol: 'CRO', name: 'Cronos', color: '#103F68' },
  { symbol: 'LEO', name: 'UNUS SED LEO', color: '#000000' },
  { symbol: 'HT', name: 'Huobi Token', color: '#1253FC' },
  { symbol: 'OKB', name: 'OKB', color: '#3075EE' },
  
  // Other altcoins
  { symbol: 'BCH', name: 'Bitcoin Cash', color: '#8DC351' },
  { symbol: 'ETC', name: 'Ethereum Classic', color: '#328332' },
  { symbol: 'XLM', name: 'Stellar', color: '#000000' },
  { symbol: 'TRX', name: 'TRON', color: '#FF0013' },
  { symbol: 'THETA', name: 'Theta Network', color: '#2AB8E6' },
  { symbol: 'IOTA', name: 'IOTA', color: '#000000' },
  { symbol: 'BSV', name: 'Bitcoin SV', color: '#EAB300' },
  { symbol: 'MIOTA', name: 'IOTA', color: '#000000' },
  
  // Newer tokens
  { symbol: 'APT', name: 'Aptos', color: '#000000' },
  { symbol: 'SUI', name: 'Sui', color: '#4DA2FF' },
  { symbol: 'ARB', name: 'Arbitrum', color: '#28A0F0' },
  { symbol: 'OP', name: 'Optimism', color: '#FF0420' },
  { symbol: 'BLUR', name: 'Blur', color: '#FF8700' },
  { symbol: 'LDO', name: 'Lido DAO', color: '#00A3FF' },
  { symbol: 'RPL', name: 'Rocket Pool', color: '#E57147' },
  { symbol: 'GMX', name: 'GMX', color: '#4F60FF' },
  
  // AI & Data tokens
  { symbol: 'FET', name: 'Fetch.ai', color: '#000000' },
  { symbol: 'OCEAN', name: 'Ocean Protocol', color: '#000000' },
  { symbol: 'GRT', name: 'The Graph', color: '#6747ED' },
  { symbol: 'RNDR', name: 'Render Token', color: '#000000' },
  
  // Infrastructure
  { symbol: 'MATIC', name: 'Polygon', color: '#8247E5' },
  { symbol: 'ANKR', name: 'Ankr', color: '#4F5AE6' },
  { symbol: 'LRC', name: 'Loopring', color: '#1C60FF' },
  { symbol: 'CELR', name: 'Celer Network', color: '#000000' },
  
  // Social tokens
  { symbol: 'MASK', name: 'Mask Network', color: '#1C68F3' },
  { symbol: 'RALLY', name: 'Rally', color: '#000000' },
  
  // Yield farming
  { symbol: 'CAKE', name: 'PancakeSwap', color: '#D1884F' },
  { symbol: 'AUTO', name: 'Auto', color: '#000000' },
  { symbol: 'BAKE', name: 'BakeryToken', color: '#000000' },
  
  // Cross-chain
  { symbol: 'RUNE', name: 'THORChain', color: '#00CCAA' },
  { symbol: 'SCRT', name: 'Secret', color: '#000000' },
  { symbol: 'KAVA', name: 'Kava', color: '#FF564F' },
  
  // NFT related
  { symbol: 'LOOKS', name: 'LooksRare', color: '#0CE466' },
  { symbol: 'X2Y2', name: 'X2Y2', color: '#000000' },
  { symbol: 'RARE', name: 'SuperRare', color: '#000000' },
  
  // Derivatives
  { symbol: 'PERP', name: 'Perpetual Protocol', color: '#000000' },
  { symbol: 'DYDX', name: 'dYdX', color: '#6966FF' },
  { symbol: 'INJ', name: 'Injective', color: '#00D2FF' },
  
  // Real World Assets
  { symbol: 'RWA', name: 'Real World Assets', color: '#000000' },
  { symbol: 'ONDO', name: 'Ondo Finance', color: '#000000' },
  
  // Liquid Staking
  { symbol: 'STETH', name: 'Lido Staked Ether', color: '#00A3FF' },
  { symbol: 'RETH', name: 'Rocket Pool ETH', color: '#E57147' },
  { symbol: 'CBETH', name: 'Coinbase Wrapped Staked ETH', color: '#0052FF' },
  
  // Wrapped tokens
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', color: '#F7931A' },
  { symbol: 'WETH', name: 'Wrapped Ether', color: '#627EEA' },
  { symbol: 'WBNB', name: 'Wrapped BNB', color: '#F3BA2F' },
  { symbol: 'WMATIC', name: 'Wrapped Matic', color: '#8247E5' },
  { symbol: 'WAVAX', name: 'Wrapped AVAX', color: '#E84142' }
];

// Create a map for quick lookups
export const CRYPTO_MAP = CRYPTO_LIST.reduce((acc, crypto) => {
  acc[crypto.symbol] = crypto;
  return acc;
}, {});

// Get crypto info by symbol
export const getCryptoInfo = (symbol) => {
  return CRYPTO_MAP[symbol?.toUpperCase()] || null;
};

// Get crypto color by symbol
export const getCryptoColor = (symbol) => {
  const crypto = getCryptoInfo(symbol);
  return crypto?.color || '#6B7280'; // Default gray color
};

// Get crypto name by symbol
export const getCryptoName = (symbol) => {
  const crypto = getCryptoInfo(symbol);
  return crypto?.name || symbol;
};

// Check if crypto icon exists
export const hasCryptoIcon = (symbol) => {
  return !!getCryptoInfo(symbol);
};

// Get all supported crypto symbols
export const getAllCryptoSymbols = () => {
  return CRYPTO_LIST.map(crypto => crypto.symbol);
};

// Get popular cryptocurrencies (top 20)
export const getPopularCryptos = () => {
  return CRYPTO_LIST.slice(0, 20);
};

// Get cryptocurrencies by category
export const getCryptosByCategory = (category) => {
  const categories = {
    major: CRYPTO_LIST.slice(0, 10),
    stablecoins: CRYPTO_LIST.filter(crypto => 
      ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FRAX'].includes(crypto.symbol)
    ),
    defi: CRYPTO_LIST.filter(crypto => 
      ['UNI', 'LINK', 'AAVE', 'COMP', 'MKR', 'SNX', 'CRV', 'YFI', 'SUSHI', '1INCH'].includes(crypto.symbol)
    ),
    layer1: CRYPTO_LIST.filter(crypto => 
      ['AVAX', 'LUNA', 'ATOM', 'NEAR', 'ALGO', 'VET', 'ICP', 'HBAR', 'FIL', 'EOS', 'XTZ', 'FLOW', 'KSM', 'NEO', 'WAVES'].includes(crypto.symbol)
    ),
    gaming: CRYPTO_LIST.filter(crypto => 
      ['SAND', 'MANA', 'AXS', 'GALA', 'ENJ', 'CHZ', 'IMX'].includes(crypto.symbol)
    ),
    meme: CRYPTO_LIST.filter(crypto => 
      ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BABYDOGE'].includes(crypto.symbol)
    ),
    privacy: CRYPTO_LIST.filter(crypto => 
      ['XMR', 'ZEC', 'DASH', 'ZEN'].includes(crypto.symbol)
    )
  };
  
  return categories[category] || [];
};

// Generate image path for crypto icon
export const getCryptoImagePath = (symbol, size = 'medium') => {
  const sizeMap = {
    small: '24',
    medium: '48',
    large: '96'
  };
  
  const pixelSize = sizeMap[size] || '48';
  return `/images/crypto/${symbol?.toLowerCase()}-${pixelSize}.png`;
};

// Generate fallback image path
export const getCryptoFallbackPath = (symbol) => {
  return `/images/crypto/${symbol?.toLowerCase()}.png`;
};

export default {
  CRYPTO_LIST,
  CRYPTO_MAP,
  getCryptoInfo,
  getCryptoColor,
  getCryptoName,
  hasCryptoIcon,
  getAllCryptoSymbols,
  getPopularCryptos,
  getCryptosByCategory,
  getCryptoImagePath,
  getCryptoFallbackPath
};