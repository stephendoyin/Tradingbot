// app.js
const express = require('express');
const bodyParser = require('body-parser');
const { placeOrder: placeBybitOrder } = require('./bybitClient');
const { placeBuyOrder: placeBybitBuyOrder } = require('./bybitBuyClient'); // Import Bybit Spot trading logic

const app = express();
app.use(bodyParser.json());

// Define the / route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Test JSON response',
    status: 'success',
    data: {
      test: 'This is a test response'
    }
  });
});

app.post('/webhook', async (req, res) => {
  try {
    const { symbol, side, price, quantity } = req.body;

    // Parse price as a number
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Invalid price format' });
    }

    const parsedQty = parseFloat(quantity);


    if (side === 'Buy') {
      console.log('Processing Buy order on Bybit Sub account...');
      // Calculate 4% profit and 8% loss
      const takeProfit = parsedPrice * 1.04; // 4% above price
      const stopLoss = parsedPrice * 0.92;  // 8% below price

      await placeBybitBuyOrder({
        symbol,
        side,
        qty: parsedQty,
        price: `${parsedPrice}`,
        stopLoss,
        takeProfit,
      });
    } else if (side === 'Sell') {
      console.log('Processing Sell order on Bybit...');
      // Calculate 4% profit and 8% loss for Sell
      // Calculate 4% profit and 8% loss for Sell
      const takeProfit = parsedPrice * 0.96; // 4% below price
      const stopLoss = parsedPrice * 1.08;  // 8% above price
      console.log(takeProfit, stopLoss, parsedPrice);
      await placeBybitOrder({
        symbol,
        side,
        qty: parsedQty,
        price: `${parsedPrice}`,
        stopLoss,
        takeProfit,
      });
    } else {
      throw new Error('Invalid side provided');
    }

    console.log(req.body);
    res.status(200).json({ message: `Order placed successfully for side: ${side}` });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Error processing order', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening for TradingView signals on port ${PORT}`));
