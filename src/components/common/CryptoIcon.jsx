import React from 'react';
import { Bitcoin, Coins } from 'lucide-react';

/**
 * Cryptocurrency icon component with fallback support
 * @param {Object} props - Component props
 * @param {string} props.symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @param {number} props.size - Icon size in pixels
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} CryptoIcon component
 */
const CryptoIcon = ({ 
  symbol, 
  size = 24, 
  className = '',
  fallback = true,
  ...props 
}) => {
  const symbolUpper = symbol?.toUpperCase();
  
  // Try to load the PNG image first
  const imagePath = `/images/crypto/${symbolUpper?.toLowerCase()}.png`;
  
  // Fallback SVG icons for major cryptocurrencies
  const svgIcons = {
    BTC: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#F7931A"/>
        <path d="M17.154 8.681c.133-.93-.569-1.431-1.538-1.766l.314-1.258-1.267-.316-.306 1.227c-.333-.083-.675-.161-1.014-.239l.308-1.235-1.267-.316-.314 1.258c-.276-.063-.547-.125-.809-.191v-.004l-1.748-.436-.337 1.353s.938.215.918.228c.512.128.605.467.589.736l-.589 2.359c.035.009.081.022.131.042l-.131-.033-.826 3.312c-.062.155-.221.389-.578.3.013.018-.918-.229-.918-.229l-.628 1.448 1.651.412c.307.077.608.158.903.234l-.317 1.27 1.267.315.314-1.258c.343.093.676.178 1.002.261l-.313 1.249 1.267.316.317-1.27c1.312.248 2.297.148 2.711-.104.334-.203.537-.71.537-1.291 0-.581-.354-1.195-.537-1.291.537-.124.94-.477.94-1.195 0-.718-.403-1.071-.94-1.195z" fill="white"/>
      </svg>
    ),
    ETH: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#627EEA"/>
        <path d="M12.373 3v6.652l5.623 2.513L12.373 3z" fill="white" fillOpacity="0.602"/>
        <path d="M6.75 12.165l5.623-2.513V3L6.75 12.165z" fill="white"/>
        <path d="M12.373 16.652v4.348L18 13.212l-5.627 3.44z" fill="white" fillOpacity="0.602"/>
        <path d="M12.373 21v-4.348L6.75 13.212 12.373 21z" fill="white"/>
        <path d="M12.373 15.645l5.623-3.44-5.623-2.513v5.953z" fill="white" fillOpacity="0.2"/>
        <path d="M6.75 12.205l5.623 3.44v-5.953L6.75 12.205z" fill="white" fillOpacity="0.602"/>
      </svg>
    ),
    BNB: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#F3BA2F"/>
        <path d="M8.814 10.5l3.186-3.186 3.186 3.186 1.854-1.854L12 3.606 6.96 8.646l1.854 1.854zm-2.814 1.5L7.854 10.146 6 8.292 4.146 10.146 6 12l1.854 1.854L6 15.708l1.854 1.854L10.146 15.708 12 17.562l1.854-1.854L16.292 18 18.146 16.146 16.292 14.292 18 12.438l-1.854-1.854L14.292 12l1.854-1.854L14.292 8.292 12 10.146 9.708 8.292 7.854 10.146 6 12z" fill="white"/>
      </svg>
    ),
    ADA: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#0033AD"/>
        <path d="M12 3.5c-4.694 0-8.5 3.806-8.5 8.5s3.806 8.5 8.5 8.5 8.5-3.806 8.5-8.5-3.806-8.5-8.5-8.5zm0 15.5c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7z" fill="white"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    ),
    SOL: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#9945FF"/>
        <path d="M6.5 17.5h11c.276 0 .5-.224.5-.5s-.224-.5-.5-.5h-11c-.276 0-.5.224-.5.5s.224.5.5.5zm0-5h11c.276 0 .5-.224.5-.5s-.224-.5-.5-.5h-11c-.276 0-.5.224-.5.5s.224.5.5.5zm0-5h11c.276 0 .5-.224.5-.5s-.224-.5-.5-.5h-11c-.276 0-.5.224-.5.5s.224.5.5.5z" fill="white"/>
      </svg>
    ),
    XRP: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#23292F"/>
        <path d="M6.5 7.5l3.5 3.5-3.5 3.5h2.5l3.5-3.5 3.5 3.5h2.5l-3.5-3.5 3.5-3.5h-2.5l-3.5 3.5-3.5-3.5h-2.5z" fill="white"/>
      </svg>
    ),
    DOT: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#E6007A"/>
        <circle cx="12" cy="8" r="2" fill="white"/>
        <circle cx="8" cy="16" r="2" fill="white"/>
        <circle cx="16" cy="16" r="2" fill="white"/>
      </svg>
    ),
    LINK: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#375BD2"/>
        <path d="M12 6l-6 6 6 6 6-6-6-6zm0 2.5l3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5z" fill="white"/>
      </svg>
    ),
    USDT: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#26A17B"/>
        <path d="M12.5 8v2h3v1h-3v1.5c1.5.1 2.5.4 2.5.9s-1 .8-2.5.9v3.6h-1v-3.6c-1.5-.1-2.5-.4-2.5-.9s1-.8 2.5-.9V12h-3v-1h3V8h-3V7h7v1h-3z" fill="white"/>
      </svg>
    ),
    USDC: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#2775CA"/>
        <path d="M12.5 8v2h3v1h-3v1.5c1.5.1 2.5.4 2.5.9s-1 .8-2.5.9v3.6h-1v-3.6c-1.5-.1-2.5-.4-2.5-.9s1-.8 2.5-.9V12h-3v-1h3V8h-3V7h7v1h-3z" fill="white"/>
      </svg>
    ),
    DOGE: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#C2A633"/>
        <path d="M8.5 8v8h2c2.5 0 4.5-2 4.5-4s-2-4-4.5-4h-2zm1.5 1.5h.5c1.5 0 3 1 3 2.5s-1.5 2.5-3 2.5H10v-5z" fill="white"/>
      </svg>
    ),
    MATIC: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#8247E5"/>
        <path d="M12 3l9 5.196v10.608L12 24l-9-5.196V8.196L12 3z" fill="white"/>
      </svg>
    ),
    AVAX: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#E84142"/>
        <path d="M12 6l6 10H6l6-10z" fill="white"/>
      </svg>
    ),
    SHIB: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#FFA409"/>
        <path d="M8 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-6 4c0 2.2 2.7 4 6 4s6-1.8 6-4" fill="white"/>
      </svg>
    ),
    LTC: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#BFBBBB"/>
        <path d="M10.427 4.004v6.57l-1.44.606v1.41l1.44-.606v5.016h6.594v-1.594h-4.594v-3.422l1.44-.606v-1.41l-1.44.606v-6.57h-1.594z" fill="white"/>
      </svg>
    ),
    BCH: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#8DC351"/>
        <path d="M17.154 8.681c.133-.93-.569-1.431-1.538-1.766l.314-1.258-1.267-.316-.306 1.227c-.333-.083-.675-.161-1.014-.239l.308-1.235-1.267-.316-.314 1.258c-.276-.063-.547-.125-.809-.191v-.004l-1.748-.436-.337 1.353s.938.215.918.228c.512.128.605.467.589.736l-.589 2.359c.035.009.081.022.131.042l-.131-.033-.826 3.312c-.062.155-.221.389-.578.3.013.018-.918-.229-.918-.229l-.628 1.448 1.651.412c.307.077.608.158.903.234l-.317 1.27 1.267.315.314-1.258c.343.093.676.178 1.002.261l-.313 1.249 1.267.316.317-1.27c1.312.248 2.297.148 2.711-.104.334-.203.537-.71.537-1.291 0-.581-.354-1.195-.537-1.291.537-.124.94-.477.94-1.195 0-.718-.403-1.071-.94-1.195z" fill="white"/>
      </svg>
    ),
    UNI: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#FF007A"/>
        <path d="M12 3c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z" fill="white"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    ),
    ATOM: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#2E3148"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
        <ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="white" strokeWidth="1"/>
        <ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="white" strokeWidth="1" transform="rotate(60 12 12)"/>
        <ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="white" strokeWidth="1" transform="rotate(120 12 12)"/>
      </svg>
    ),
    FTT: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#02A6C2"/>
        <path d="M8 8h8v2H8V8zm0 3h8v2H8v-2zm0 3h6v2H8v-2z" fill="white"/>
      </svg>
    ),
    NEAR: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#000000"/>
        <path d="M12 3l9 9-9 9-9-9 9-9z" fill="white"/>
      </svg>
    ),
    ALGO: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#000000"/>
        <path d="M8 16l4-8 4 8h-2l-1-2h-2l-1 2H8zm3-4h2l-1-2-1 2z" fill="white"/>
      </svg>
    ),
    VET: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#15BDFF"/>
        <path d="M8 8l4 8 4-8h-2l-2 4-2-4H8z" fill="white"/>
      </svg>
    ),
    ICP: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#29ABE2"/>
        <path d="M12 6c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6zm0 2c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="white"/>
      </svg>
    ),
    HBAR: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#000000"/>
        <path d="M8 8v8h1v-3h6v3h1V8h-1v3H9V8H8z" fill="white"/>
      </svg>
    ),
    FIL: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#0090FF"/>
        <path d="M12 6l6 6-6 6-6-6 6-6z" fill="white"/>
      </svg>
    ),
    SAND: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#00D4FF"/>
        <path d="M8 8h8v8H8V8zm2 2v4h4v-4h-4z" fill="white"/>
      </svg>
    ),
    MANA: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#FF2D55"/>
        <path d="M12 6l6 10H6l6-10z" fill="white"/>
      </svg>
    ),
    AXS: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#0055D4"/>
        <path d="M8 16l4-8 4 8h-2l-1-2h-2l-1 2H8zm3-4h2l-1-2-1 2z" fill="white"/>
      </svg>
    ),
    THETA: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#2AB8E6"/>
        <path d="M12 6c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6zm0 2c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="white"/>
      </svg>
    ),
    AAVE: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#B6509E"/>
        <path d="M8 16l4-8 4 8h-2l-1-2h-2l-1 2H8zm3-4h2l-1-2-1 2z" fill="white"/>
      </svg>
    ),
    EOS: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#000000"/>
        <path d="M12 6l6 10H6l6-10z" fill="white"/>
      </svg>
    ),
    XTZ: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#2C7DF7"/>
        <path d="M12 6l6 6-6 6-6-6 6-6z" fill="white"/>
      </svg>
    ),
    FLOW: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#00EF8B"/>
        <path d="M8 8h8v8H8V8zm2 2v4h4v-4h-4z" fill="white"/>
      </svg>
    ),
    KSM: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#000000"/>
        <circle cx="12" cy="8" r="2" fill="white"/>
        <circle cx="8" cy="16" r="2" fill="white"/>
        <circle cx="16" cy="16" r="2" fill="white"/>
      </svg>
    ),
    NEO: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#58BF00"/>
        <path d="M8 8h8v8H8V8zm2 2v4h4v-4h-4z" fill="white"/>
      </svg>
    ),
    WAVES: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#0155FF"/>
        <path d="M6 12c2-2 4-2 6 0s4 2 6 0" stroke="white" strokeWidth="2" fill="none"/>
      </svg>
    ),
    COMP: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#00D395"/>
        <path d="M12 6c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6zm0 2c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="white"/>
      </svg>
    ),
    ZEC: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#F4B728"/>
        <path d="M8 8h8l-6 4h6v2H8l6-4H8V8z" fill="white"/>
      </svg>
    ),
    DASH: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#008CE7"/>
        <path d="M8 10h8v4H8v-4z" fill="white"/>
      </svg>
    ),
    XMR: (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...props}>
        <circle cx="12" cy="12" r="12" fill="#FF6600"/>
        <path d="M12 6l6 6v6h-2v-4l-4-4-4 4v4H6v-6l6-6z" fill="white"/>
      </svg>
    )
  };

  // Handle image loading with fallback
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // If we have an SVG icon and either image failed or fallback is disabled
  if (svgIcons[symbolUpper] && (imageError || !fallback)) {
    return svgIcons[symbolUpper];
  }

  // Try to render the PNG image
  if (!imageError && symbolUpper) {
    return (
      <div className={`inline-block ${className}`} style={{ width: size, height: size }}>
        <img
          src={imagePath}
          alt={`${symbolUpper} icon`}
          width={size}
          height={size}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ 
            display: imageLoaded ? 'block' : 'none',
            width: size,
            height: size,
            objectFit: 'contain'
          }}
          {...props}
        />
        {!imageLoaded && !imageError && (
          <div 
            className="bg-gray-200 animate-pulse rounded-full flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <Coins size={size * 0.6} className="text-gray-400" />
          </div>
        )}
        {imageError && svgIcons[symbolUpper] && svgIcons[symbolUpper]}
        {imageError && !svgIcons[symbolUpper] && (
          <div 
            className="bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ width: size, height: size }}
          >
            {symbolUpper?.slice(0, 3) || '?'}
          </div>
        )}
      </div>
    );
  }

  // Final fallback
  return (
    <div 
      className={`bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {symbolUpper?.slice(0, 3) || '?'}
    </div>
  );
};

export default CryptoIcon;