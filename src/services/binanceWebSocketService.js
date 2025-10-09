/**
 * Binance WebSocket Service for real-time market data
 * Handles WebSocket connections to Binance Stream API
 */

class BinanceWebSocketService {
  constructor() {
    this.baseUrl = 'wss://stream.binance.com:9443/ws/';
    this.connections = new Map();
    this.subscriptions = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Subscribe to real-time ticker data for a symbol
   * @param {string} symbol - Trading pair symbol (e.g., 'btcusdt')
   * @param {Function} callback - Callback function to handle data
   * @returns {string} Subscription ID
   */
  subscribeTicker(symbol, callback) {
    const stream = `${symbol.toLowerCase()}@ticker`;
    return this.subscribe(stream, callback);
  }

  /**
   * Subscribe to real-time kline/candlestick data
   * @param {string} symbol - Trading pair symbol (e.g., 'btcusdt')
   * @param {string} interval - Kline interval (1m, 5m, 1h, 1d, etc.)
   * @param {Function} callback - Callback function to handle data
   * @returns {string} Subscription ID
   */
  subscribeKline(symbol, interval, callback) {
    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    return this.subscribe(stream, callback);
  }

  /**
   * Subscribe to real-time trade data
   * @param {string} symbol - Trading pair symbol (e.g., 'btcusdt')
   * @param {Function} callback - Callback function to handle data
   * @returns {string} Subscription ID
   */
  subscribeTrade(symbol, callback) {
    const stream = `${symbol.toLowerCase()}@trade`;
    return this.subscribe(stream, callback);
  }

  /**
   * Subscribe to real-time order book depth data
   * @param {string} symbol - Trading pair symbol (e.g., 'btcusdt')
   * @param {string} level - Depth level (@depth5, @depth10, @depth20)
   * @param {Function} callback - Callback function to handle data
   * @returns {string} Subscription ID
   */
  subscribeDepth(symbol, level = '@depth10', callback) {
    const stream = `${symbol.toLowerCase()}${level}`;
    return this.subscribe(stream, callback);
  }

  /**
   * Subscribe to multiple streams
   * @param {Array<string>} streams - Array of stream names
   * @param {Function} callback - Callback function to handle data
   * @returns {string} Subscription ID
   */
  subscribeMultiple(streams, callback) {
    const streamString = streams.join('/');
    return this.subscribe(streamString, callback);
  }

  /**
   * Generic subscribe method
   * @param {string} stream - Stream name
   * @param {Function} callback - Callback function
   * @returns {string} Subscription ID
   */
  subscribe(stream, callback) {
    const subscriptionId = this.generateSubscriptionId();
    const url = `${this.baseUrl}${stream}`;

    // Store subscription info
    this.subscriptions.set(subscriptionId, {
      stream,
      callback,
      url,
      active: true
    });

    // Create WebSocket connection
    this.createConnection(subscriptionId, url, callback);

    return subscriptionId;
  }

  /**
   * Create WebSocket connection
   * @param {string} subscriptionId - Subscription ID
   * @param {string} url - WebSocket URL
   * @param {Function} callback - Callback function
   */
  createConnection(subscriptionId, url, callback) {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log(`WebSocket connected: ${url}`);
        this.reconnectAttempts.set(subscriptionId, 0);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data, callback);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket closed: ${url}`, event.code, event.reason);
        this.handleReconnect(subscriptionId, url, callback);
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error: ${url}`, error);
      };

      // Store connection
      this.connections.set(subscriptionId, ws);

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   * @param {Object} data - Parsed message data
   * @param {Function} callback - Callback function
   */
  handleMessage(data, callback) {
    try {
      // Transform data based on stream type
      let transformedData = data;

      if (data.e === '24hrTicker') {
        // 24hr ticker data
        transformedData = {
          type: 'ticker',
          symbol: data.s,
          price: parseFloat(data.c),
          change: parseFloat(data.P),
          changePercent: parseFloat(data.P),
          volume: parseFloat(data.v),
          quoteVolume: parseFloat(data.q),
          high: parseFloat(data.h),
          low: parseFloat(data.l),
          openPrice: parseFloat(data.o),
          timestamp: data.E
        };
      } else if (data.e === 'kline') {
        // Kline/candlestick data
        const kline = data.k;
        transformedData = {
          type: 'kline',
          symbol: kline.s,
          interval: kline.i,
          openTime: kline.t,
          closeTime: kline.T,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
          quoteVolume: parseFloat(kline.q),
          numberOfTrades: kline.n,
          isClosed: kline.x,
          timestamp: data.E
        };
      } else if (data.e === 'trade') {
        // Trade data
        transformedData = {
          type: 'trade',
          symbol: data.s,
          price: parseFloat(data.p),
          quantity: parseFloat(data.q),
          timestamp: data.T,
          isBuyerMaker: data.m,
          tradeId: data.t
        };
      } else if (data.lastUpdateId) {
        // Depth/order book data
        transformedData = {
          type: 'depth',
          symbol: data.s || 'unknown',
          bids: data.bids?.map(bid => ({
            price: parseFloat(bid[0]),
            quantity: parseFloat(bid[1])
          })) || [],
          asks: data.asks?.map(ask => ({
            price: parseFloat(ask[0]),
            quantity: parseFloat(ask[1])
          })) || [],
          lastUpdateId: data.lastUpdateId
        };
      }

      callback(transformedData);
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  /**
   * Handle reconnection logic
   * @param {string} subscriptionId - Subscription ID
   * @param {string} url - WebSocket URL
   * @param {Function} callback - Callback function
   */
  handleReconnect(subscriptionId, url, callback) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || !subscription.active) {
      return;
    }

    const attempts = this.reconnectAttempts.get(subscriptionId) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, attempts);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${attempts + 1}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.reconnectAttempts.set(subscriptionId, attempts + 1);
        this.createConnection(subscriptionId, url, callback);
      }, delay);
    } else {
      console.error(`Max reconnection attempts reached for ${url}`);
      this.unsubscribe(subscriptionId);
    }
  }

  /**
   * Unsubscribe from a stream
   * @param {string} subscriptionId - Subscription ID
   */
  unsubscribe(subscriptionId) {
    const connection = this.connections.get(subscriptionId);
    const subscription = this.subscriptions.get(subscriptionId);

    if (subscription) {
      subscription.active = false;
    }

    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.close();
    }

    this.connections.delete(subscriptionId);
    this.subscriptions.delete(subscriptionId);
    this.reconnectAttempts.delete(subscriptionId);
  }

  /**
   * Unsubscribe from all streams
   */
  unsubscribeAll() {
    const subscriptionIds = Array.from(this.subscriptions.keys());
    subscriptionIds.forEach(id => this.unsubscribe(id));
  }

  /**
   * Get connection status
   * @param {string} subscriptionId - Subscription ID
   * @returns {string} Connection status
   */
  getConnectionStatus(subscriptionId) {
    const connection = this.connections.get(subscriptionId);
    if (!connection) return 'disconnected';
    
    switch (connection.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }

  /**
   * Get all active subscriptions
   * @returns {Array} Active subscriptions
   */
  getActiveSubscriptions() {
    return Array.from(this.subscriptions.entries())
      .filter(([_, subscription]) => subscription.active)
      .map(([id, subscription]) => ({
        id,
        stream: subscription.stream,
        status: this.getConnectionStatus(id)
      }));
  }

  /**
   * Generate unique subscription ID
   * @returns {string} Subscription ID
   */
  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if WebSocket is supported
   * @returns {boolean} WebSocket support status
   */
  isWebSocketSupported() {
    return typeof WebSocket !== 'undefined';
  }
}

// Create and export singleton instance
const binanceWebSocketService = new BinanceWebSocketService();
export default binanceWebSocketService;