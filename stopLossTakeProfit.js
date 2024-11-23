require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto'); // For generating the HMAC SHA256 signature

// Extract API credentials from environment variables
const apiKey = process.env.BINANCE_API_KEY;
const secretKey = process.env.BINANCE_SECRET_KEY;

// Function to place Stop Loss and Take Profit orders
const placeStopLossAndTakeProfit = async ({ symbol, side, qty, stopLossPrice, takeProfitPrice }) => {
  try {
    const baseUrl = 'https://testnet.binancefuture.com';
    const endpoint = '/fapi/v1/order';

    // Place Stop Loss Order
    const stopLossParams = {
      symbol,
      side: side === 'BUY' ? 'SELL' : 'BUY', // Reverse the side
      type: 'STOP_MARKET',
      stopPrice: stopLossPrice,
      quantity: qty,
      timestamp: Date.now(),
    };

    const stopLossQueryString = new URLSearchParams(stopLossParams).toString();
    stopLossParams.signature = crypto
      .createHmac('sha256', secretKey)
      .update(stopLossQueryString)
      .digest('hex');

    const stopLossResponse = await axios.post(`${baseUrl}${endpoint}`, null, {
      headers: { 'X-MBX-APIKEY': apiKey },
      params: stopLossParams,
    });

    console.log('Stop Loss Order Response:', stopLossResponse.data);

    // Place Take Profit Order
    const takeProfitParams = {
      symbol,
      side: side === 'BUY' ? 'SELL' : 'BUY', // Reverse the side
      type: 'TAKE_PROFIT',
      price: takeProfitPrice,
      stopPrice: takeProfitPrice,
      quantity: qty,
      timestamp: Date.now(),
    };

    const takeProfitQueryString = new URLSearchParams(takeProfitParams).toString();
    takeProfitParams.signature = crypto
      .createHmac('sha256', secretKey)
      .update(takeProfitQueryString)
      .digest('hex');

    const takeProfitResponse = await axios.post(`${baseUrl}${endpoint}`, null, {
      headers: { 'X-MBX-APIKEY': apiKey },
      params: takeProfitParams,
    });

    console.log('Take Profit Order Response:', takeProfitResponse.data);
  } catch (error) {
    console.error('Error in Stop Loss / Take Profit:', error.response?.data || error.message);
  }
};

module.exports = { placeStopLossAndTakeProfit };
