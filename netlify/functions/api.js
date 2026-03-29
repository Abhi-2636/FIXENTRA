process.env.SERVERLESS = 'true';
process.env.SUPABASE_URL = 'https://rbbirmoxbcjaollxxxxk.supabase.co';
process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiYmlybW94YmNqYW9sbHh4eHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Njc0NzMsImV4cCI6MjA5MDM0MzQ3M30.VXIAmvUkK0EXoqIsD9NM7Ek7zJ4JXEUOLTI3Kn4unO0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiYmlybW94YmNqYW9sbHh4eHhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc2NzQ3MywiZXhwIjoyMDkwMzQzNDczfQ.ADM1RKBnL9zALfYqy5S4OC0oN2pK8Nc60wX1jYrwMg4';

const serverless = require('serverless-http');
const app = require('../../server');

// Wrap the Express app for Netlify Functions
module.exports.handler = serverless(app, { basePath: '/.netlify/functions/api' });
