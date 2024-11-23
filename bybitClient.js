// bybitClient.js
require('dotenv').config();
const { RestClientV5 } = require('bybit-api');
const { v4: uuidv4 } = require('uuid');

const client = new RestClientV5({
    key: process.env.BYBIT_API_KEY,
    secret: process.env.BYBIT_API_SECRET,
    testnet: true,
    demo: true,
    baseUrl: 'https://api-demo.bybit.com'
});

const placeOrder = async ({ symbol, side, qty, price, stopLoss, takeProfit }) => {
    const orderLinkedID = uuidv4(); // Generates a unique ID each time
    console.log(takeProfit, stopLoss, side);

    client
        .submitOrder({
            category: 'linear',
            symbol,
            side,
            orderType: 'Market',
            isLeverage: 0,
            qty: '1',
            price,
            orderLinkId: orderLinkedID,
            marketUnit: 'quoteCoin',
        })
        .then((response) => {
            console.log(response);

            // Check if the order was successful
            if (response.retCode === 0) {
                console.log('Order placed successfully. Setting stop loss and take profit...');

                // Call a function to update stop loss and take profit (example function below)
                setStopLossAndTakeProfit(response.result.orderId, symbol, stopLoss, takeProfit);
            } else {
                console.error('Order failed:', response.retMsg);
            }
        })
        .catch((error) => {
            console.error('Error placing order:', error);
        });
};

// Example function to set stop loss and take profit on an existing order
const setStopLossAndTakeProfit = (orderId, symbol, stopLoss, takeProfit) => {
    client
        .setTradingStop({
            category: 'linear',
            symbol,
            stopLoss: `${stopLoss}`,
            takeProfit: `${takeProfit}`,
            // orderId
        })
        .then((response) => {
            if (response.retCode === 0) {
                console.log('Stop loss and take profit set successfully:', response);
            } else {
                console.error('Failed to set stop loss and take profit:', response.retMsg);
            }
        })
        .catch((error) => {
            console.error('Error setting stop loss and take profit:', error);
        });
};


module.exports = { placeOrder };
