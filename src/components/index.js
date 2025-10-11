// Common Components
export { default as Navbar } from './common/Navbar';
export { default as Footer } from './common/Footer';
export { default as Sidebar } from './common/Sidebar';
export { default as DashboardNavbar } from './common/DashboardNavbar';
export { default as Loader } from './common/Loader';
export { default as ThemeToggle } from './common/ThemeToggle';
export { default as ProtectedRoute } from './common/ProtectedRoute';
export { default as ErrorBoundary } from './common/ErrorBoundary';
export { SimpleNotificationProvider as NotificationProvider, useNotification } from './common/SimpleNotificationSystem';

// Dashboard Components
export { default as DashboardMarketOverview } from './dashboard/MarketOverview';
export { default as SentimentWidget } from './dashboard/SentimentWidget';
export { default as AiRecommendations } from './dashboard/AiRecommendations';
export { default as RiskGauge } from './dashboard/RiskGauge';
export { default as PerformanceChart } from './dashboard/PerformanceChart';

// Chart Components
export { default as PieChart } from './charts/PieChart';
export { default as LineChart } from './charts/LineChart';
export { default as CandlestickChart } from './charts/CandlestickChart';

// Market Components
export { default as PriceTicker, PriceTickerGrid, CompactPriceTicker } from './market/PriceTicker';
export { default as MarketOverview } from './market/MarketOverview';