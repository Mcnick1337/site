// netlify/functions/crypto-proxy.cjs

// THE FIX: Use the standard CommonJS 'require' syntax.
const fetch = require('node-fetch');

// Use 'module.exports.handler' for CommonJS compatibility.
module.exports.handler = async function(event, context) {
    const { symbol, startTime } = event.queryStringParameters;

    if (!symbol || !startTime) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Symbol and startTime parameters are required.' }) };
    }

    try {
        const kucoinSymbol = symbol.replace(/USDT$/, '-USDT');
        const startTimeInSeconds = Math.floor(parseInt(startTime) / 1000);
        const candleType = '1min';

        const apiUrl = `https://api.kucoin.com/api/v1/market/candles?type=${candleType}&symbol=${kucoinSymbol}&startAt=${startTimeInSeconds}`;

        console.log(`[INFO] Fetching from KuCoin API: ${apiUrl}`);

        const response = await fetch(apiUrl);
        const responseBodyText = await response.text();

        console.log(`[INFO] KuCoin responded with status: ${response.status}`);
        
        if (!response.ok) {
            console.error(`[ERROR] KuCoin API request failed. Status: ${response.status}. Body: ${responseBodyText}`);
            throw new Error(`KuCoin API Error: ${response.statusText}`);
        }
        
        const data = JSON.parse(responseBodyText);

        if (data.code !== '200000') {
            console.error(`[ERROR] KuCoin API returned a logical error:`, data.msg);
            throw new Error(data.msg || 'An unknown error occurred with the KuCoin API');
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(data.data),
        };

    } catch (error) {
        console.error('[FATAL] The proxy function crashed:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'The proxy function encountered a critical error.', details: error.message }),
        };
    }
};