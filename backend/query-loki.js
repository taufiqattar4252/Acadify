require('dotenv').config();
const https = require('https');
const querystring = require('querystring');

const host = process.env.LOKI_HOST.replace('https://', '');
const username = process.env.LOKI_USERNAME;
const password = process.env.LOKI_PASSWORD;

const query = '{app="acadify-backend"}';
const qs = querystring.stringify({ query, limit: 10 });

const options = {
  hostname: host,
  port: 443,
  path: `/loki/api/v1/query?${qs}`,
  method: 'GET',
  headers: {
    'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
