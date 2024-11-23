require('dotenv').config(); // Load environment variables from .env file
const axios = require('axios'); // For making HTTP requests
const crypto = require('crypto'); // For generating the HMAC SHA256 signature
const { placeStopLossAndTakeProfit } = require('./stopLossTakeProfit'); // Import the new module

// Load API key and secret from environment variables
const apiKey = `${process.env.BINANCE_API_KEY}`;
const secretKey = `${process.env.BINANCE_SECRET_KEY}`;

/**
 * Place a Binance order with stop loss and take profit
 * @param {Object} params - Parameters for the order
 * @param {string} params.symbol - The trading pair (e.g., BTCUSDT)
 * @param {string} params.side - BUY or SELL
 * @param {number} params.qty - Quantity to trade
 * @param {number} params.stopLossPercent - Stop loss percentage
 * @param {number} params.takeProfitPercent - Take profit percentage
 */
const placeBinanceOrder = async ({ symbol, side, qty, stopLoss, takeProfit }) => {
  try {
    const baseUrl = 'https://testnet.binancefuture.com'; // Base URL for Binance testnet
    const endpoint = '/fapi/v1/order'; // API endpoint for placing orders

    // Step 1: Fetch the current market price
    const priceEndpoint = '/fapi/v1/ticker/price';
    const { data: priceData } = await axios.get(`${baseUrl}${priceEndpoint}?symbol=${symbol}`);
    const currentPrice = parseFloat(priceData.price);

    // Validate the market price
    if (isNaN(currentPrice)) {
      throw new Error(`Invalid current price: ${priceData.price}`);
    }
    console.log(`Market Price: ${currentPrice}`);

    // Step 2: Calculate Stop Loss and Take Profit prices
    const stopLossPrice = stopLoss.toFixed(2);
    const takeProfitPrice = takeProfit.toFixed(2);

    console.log(`Stop Loss: ${stopLossPrice}, Take Profit: ${takeProfitPrice}`);

    console.log('quantiy',qty)
    // Step 3: Prepare order parameters
    const params = {
      symbol, // Trading pair
      side, // Order side (BUY or SELL)
      type: 'MARKET', // Order type (MARKET)
      quantity: qty, // Order quantity
      timestamp: Date.now(), // Current timestamp
    };

    // Step 4: Create the query string
    const queryString = new URLSearchParams(params).toString();

    // Step 5: Generate the HMAC SHA256 signature
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest('hex');

    // Add the signature to the query parameters
    params.signature = signature;

    // Step 6: Make the API request to place the order
    const response = await axios.post(`${baseUrl}${endpoint}`, null, {
      headers: {
        'X-MBX-APIKEY': apiKey, // Binance API key
      },
      params, // Send query parameters including the signature
    });

    // Log the order response
    console.log('Order Response:', response.data);

    // Place Stop Loss and Take Profit Orders
    await placeStopLossAndTakeProfit({
      symbol,
      side,
      qty,
      stopLossPrice,
      takeProfitPrice,
    });

  } catch (error) {
    // Log any errors, including server responses if available
    console.error('Error:', error.response?.data || error.message);
  }
};

// Export the function for use in other modules
module.exports = { placeBinanceOrder };
