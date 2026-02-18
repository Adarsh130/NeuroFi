
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import aiohttp
import pandas as pd

logger = logging.getLogger(__name__)

class DataFetcher:
    def __init__(self):
        self.session = None
        self.ready = False
        
        # Binance API configuration
        self.binance_base_url = "https://api.binance.com/api/v3"
        
        # Rate limiting
        self.rate_limit_delay = 0.1  # 100ms between requests
        self.last_request_time = 0

    async def initialize(self):
        """Initialize the data fetcher"""
        try:
            self.session = aiohttp.ClientSession()
            self.ready = True
            logger.info("Data fetcher initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing data fetcher: {e}")
            raise

    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()

    def is_ready(self) -> bool:
        """Check if the service is ready"""
        return self.ready

    async def _rate_limit(self):
        """Implement rate limiting"""
        current_time = asyncio.get_event_loop().time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.rate_limit_delay:
            await asyncio.sleep(self.rate_limit_delay - time_since_last)
        
        self.last_request_time = asyncio.get_event_loop().time()

    async def get_current_price(self, symbol: str) -> Dict[str, Any]:
        """Get current price for a symbol"""
        try:
            await self._rate_limit()
            
            url = f"{self.binance_base_url}/ticker/price"
            params = {"symbol": symbol.upper()}
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "symbol": data["symbol"],
                        "price": float(data["price"]),
                        "timestamp": datetime.utcnow()
                    }
                else:
                    raise Exception(f"API request failed with status {response.status}")
                    
        except Exception as e:
            logger.error(f"Error getting current price for {symbol}: {e}")
            raise

    async def get_ticker_24hr(self, symbol: str = None) -> List[Dict[str, Any]]:
        """Get 24hr ticker statistics"""
        try:
            await self._rate_limit()
            
            url = f"{self.binance_base_url}/ticker/24hr"
            params = {"symbol": symbol.upper()} if symbol else {}
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Ensure data is a list
                    if not isinstance(data, list):
                        data = [data]
                    
                    result = []
                    for ticker in data:
                        result.append({
                            "symbol": ticker["symbol"],
                            "price": float(ticker["lastPrice"]),
                            "change": float(ticker["priceChange"]),
                            "changePercent": float(ticker["priceChangePercent"]),
                            "volume": float(ticker["volume"]),
                            "quoteVolume": float(ticker["quoteVolume"]),
                            "high": float(ticker["highPrice"]),
                            "low": float(ticker["lowPrice"]),
                            "openPrice": float(ticker["openPrice"]),
                            "count": int(ticker["count"]),
                            "openTime": int(ticker["openTime"]),
                            "closeTime": int(ticker["closeTime"])
                        })
                    
                    return result
                else:
                    raise Exception(f"API request failed with status {response.status}")
                    
        except Exception as e:
            logger.error(f"Error getting 24hr ticker: {e}")
            raise

    async def get_klines(self, symbol: str, interval: str = "1h", limit: int = 100,
                        start_time: Optional[int] = None, end_time: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get kline/candlestick data"""
        try:
            await self._rate_limit()
            
            url = f"{self.binance_base_url}/klines"
            params = {
                "symbol": symbol.upper(),
                "interval": interval,
                "limit": min(limit, 1000)  # Binance limit is 1000
            }
            
            if start_time:
                params["startTime"] = start_time
            if end_time:
                params["endTime"] = end_time
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    result = []
                    for kline in data:
                        result.append({
                            "openTime": int(kline[0]),
                            "open": float(kline[1]),
                            "high": float(kline[2]),
                            "low": float(kline[3]),
                            "close": float(kline[4]),
                            "volume": float(kline[5]),
                            "closeTime": int(kline[6]),
                            "quoteAssetVolume": float(kline[7]),
                            "numberOfTrades": int(kline[8]),
                            "takerBuyBaseAssetVolume": float(kline[9]),
                            "takerBuyQuoteAssetVolume": float(kline[10])
                        })
                    
                    return result
                else:
                    raise Exception(f"API request failed with status {response.status}")
                    
        except Exception as e:
            logger.error(f"Error getting klines for {symbol}: {e}")
            raise

    async def get_order_book(self, symbol: str, limit: int = 100) -> Dict[str, Any]:
        """Get order book depth"""
        try:
            await self._rate_limit()
            
            url = f"{self.binance_base_url}/depth"
            params = {
                "symbol": symbol.upper(),
                "limit": min(limit, 5000)  # Binance limit is 5000
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    return {
                        "lastUpdateId": data["lastUpdateId"],
                        "bids": [[float(bid[0]), float(bid[1])] for bid in data["bids"]],
                        "asks": [[float(ask[0]), float(ask[1])] for ask in data["asks"]]
                    }
                else:
                    raise Exception(f"API request failed with status {response.status}")
                    
        except Exception as e:
            logger.error(f"Error getting order book for {symbol}: {e}")
            raise

    async def get_recent_trades(self, symbol: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent trades"""
        try:
            await self._rate_limit()
            
            url = f"{self.binance_base_url}/trades"
            params = {
                "symbol": symbol.upper(),
                "limit": min(limit, 1000)  # Binance limit is 1000
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    result = []
                    for trade in data:
                        result.append({
                            "id": int(trade["id"]),
                            "price": float(trade["price"]),
                            "qty": float(trade["qty"]),
                            "quoteQty": float(trade["quoteQty"]),
                            "time": int(trade["time"]),
                            "isBuyerMaker": trade["isBuyerMaker"],
                            "isBestMatch": trade["isBestMatch"]
                        })
                    
                    return result
                else:
                    raise Exception(f"API request failed with status {response.status}")
                    
        except Exception as e:
            logger.error(f"Error getting recent trades for {symbol}: {e}")
            raise

    async def get_exchange_info(self) -> Dict[str, Any]:
        """Get exchange information"""
        try:
            await self._rate_limit()
            
            url = f"{self.binance_base_url}/exchangeInfo"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Filter and simplify the response
                    return {
                        "timezone": data["timezone"],
                        "serverTime": data["serverTime"],
                        "symbols": [
                            {
                                "symbol": symbol["symbol"],
                                "status": symbol["status"],
                                "baseAsset": symbol["baseAsset"],
                                "quoteAsset": symbol["quoteAsset"],
                                "baseAssetPrecision": symbol["baseAssetPrecision"],
                                "quotePrecision": symbol["quotePrecision"]
                            }
                            for symbol in data["symbols"]
                            if symbol["status"] == "TRADING"
                        ]
                    }
                else:
                    raise Exception(f"API request failed with status {response.status}")
                    
        except Exception as e:
            logger.error(f"Error getting exchange info: {e}")
            raise

    async def get_top_symbols(self, quote_asset: str = "USDT", limit: int = 50) -> List[Dict[str, Any]]:
        """Get top trading symbols by volume"""
        try:
            # Get all 24hr tickers
            tickers = await self.get_ticker_24hr()
            
            # Filter by quote asset and sort by volume
            filtered_tickers = [
                ticker for ticker in tickers
                if ticker["symbol"].endswith(quote_asset.upper())
            ]
            
            # Sort by quote volume (descending)
            sorted_tickers = sorted(
                filtered_tickers,
                key=lambda x: x["quoteVolume"],
                reverse=True
            )
            
            return sorted_tickers[:limit]
            
        except Exception as e:
            logger.error(f"Error getting top symbols: {e}")
            raise

    async def get_historical_data_bulk(self, symbols: List[str], interval: str = "1h",
                                     days: int = 30) -> Dict[str, List[Dict[str, Any]]]:
        """Get historical data for multiple symbols"""
        try:
            # Calculate start time
            start_time = int((datetime.utcnow() - timedelta(days=days)).timestamp() * 1000)
            
            results = {}
            
            # Process symbols in batches to avoid rate limiting
            batch_size = 5
            for i in range(0, len(symbols), batch_size):
                batch = symbols[i:i + batch_size]
                
                # Create tasks for concurrent execution
                tasks = []
                for symbol in batch:
                    task = self.get_klines(
                        symbol=symbol,
                        interval=interval,
                        limit=1000,
                        start_time=start_time
                    )
                    tasks.append(task)
                
                # Execute batch
                batch_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Process results
                for symbol, result in zip(batch, batch_results):
                    if isinstance(result, Exception):
                        logger.warning(f"Error getting data for {symbol}: {result}")
                        results[symbol] = []
                    else:
                        results[symbol] = result
                
                # Small delay between batches
                await asyncio.sleep(0.5)
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting bulk historical data: {e}")
            raise

    async def get_market_summary(self) -> Dict[str, Any]:
        """Get market summary statistics"""
        try:
            # Get all 24hr tickers
            tickers = await self.get_ticker_24hr()
            
            # Filter USDT pairs
            usdt_pairs = [ticker for ticker in tickers if ticker["symbol"].endswith("USDT")]
            
            if not usdt_pairs:
                return {}
            
            # Calculate statistics
            total_volume = sum(ticker["quoteVolume"] for ticker in usdt_pairs)
            gainers = [ticker for ticker in usdt_pairs if ticker["changePercent"] > 0]
            losers = [ticker for ticker in usdt_pairs if ticker["changePercent"] < 0]
            
            # Top gainers and losers
            top_gainer = max(usdt_pairs, key=lambda x: x["changePercent"])
            top_loser = min(usdt_pairs, key=lambda x: x["changePercent"])
            
            # Most active by volume
            most_active = max(usdt_pairs, key=lambda x: x["quoteVolume"])
            
            return {
                "total_pairs": len(usdt_pairs),
                "total_volume_usdt": total_volume,
                "gainers_count": len(gainers),
                "losers_count": len(losers),
                "unchanged_count": len(usdt_pairs) - len(gainers) - len(losers),
                "top_gainer": {
                    "symbol": top_gainer["symbol"],
                    "price": top_gainer["price"],
                    "change_percent": top_gainer["changePercent"]
                },
                "top_loser": {
                    "symbol": top_loser["symbol"],
                    "price": top_loser["price"],
                    "change_percent": top_loser["changePercent"]
                },
                "most_active": {
                    "symbol": most_active["symbol"],
                    "price": most_active["price"],
                    "volume": most_active["quoteVolume"]
                },
                "timestamp": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error getting market summary: {e}")
            raise

    async def validate_symbol(self, symbol: str) -> bool:
        """Validate if a symbol exists and is tradeable"""
        try:
            exchange_info = await self.get_exchange_info()
            
            valid_symbols = [s["symbol"] for s in exchange_info["symbols"]]
            return symbol.upper() in valid_symbols
            
        except Exception as e:
            logger.error(f"Error validating symbol {symbol}: {e}")
            return False

    def get_supported_intervals(self) -> List[str]:
        """Get list of supported kline intervals"""
        return [
            "1m", "3m", "5m", "15m", "30m",
            "1h", "2h", "4h", "6h", "8h", "12h",
            "1d", "3d", "1w", "1M"
        ]