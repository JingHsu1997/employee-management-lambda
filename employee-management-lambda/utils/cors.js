// 標準化 CORS headers
const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,DELETE'
};

const createResponse = (statusCode, body, additionalHeaders = {}) => {
    return {
        statusCode,
        body: JSON.stringify(body),
        headers: {
            ...corsHeaders,
            ...additionalHeaders
        }
    };
};

const createErrorResponse = (statusCode, error, additionalHeaders = {}) => {
    return {
        statusCode,
        body: JSON.stringify({ error }),
        headers: {
            ...corsHeaders,
            ...additionalHeaders
        }
    };
};

module.exports = {
    corsHeaders,
    createResponse,
    createErrorResponse
};
