// File: netlify/functions/crypto-proxy.cjs

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { symbol, startTime, interval, endTime } = event.queryStringParameters;

    if (!symbol || !startTime) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Symbol and startTime parameters are required.' })
        };
    }

    try {
        const kucoinSymbol = symbol.replace(/USDT$/, '-USDT');
        const candleType = interval || '1hour';

        // --- REWRITTEN: Use URL and URLSearchParams for robust URL construction ---
        const baseUrl = 'https://api.kucoin.com/api/v1/market/candles';
        const params = new URLSearchParams({
            symbol: kucoinSymbol,
            type: candleType,
            startAt: Math.floor(parseInt(startTime) / 1000),
        });

        if (endTime) {
            params.append('endAt', Math.floor(parseInt(endTime) / 1000));
        }

        const apiUrl = `${baseUrl}?${params.toString()}`;
        // --- End of rewrite ---

        console.log(`[INFO] Fetching from KuCoin API: ${apiUrl}`);

        const response = await fetch(apiUrl);
        const responseBodyText = await response.text();

        console.log(`[INFO] KuCoin responded with status: ${response.status}`);
        
        if (!response.ok) {
            console.error(`[ERROR] KuCoin API request failed. Status: ${response.status}. Body: ${responseBodyText}`);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `KuCoin API Error: ${response.statusText}`, details: responseBodyText }),
            };
        }
        
        const data = JSON.parse(responseBodyText);

        if (data.code !== '200000') {
            console.error(`[ERROR] KuCoin API returned a logical error:`, data.msg);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'KuCoin API returned an error.', details: data.msg }),
            };
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