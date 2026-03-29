process.env.SERVERLESS = 'true';

const serverless = require('serverless-http');
const app = require('../../server');

// Wrap the Express app for Netlify Functions
module.exports.handler = serverless(app);
