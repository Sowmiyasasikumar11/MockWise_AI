const http = require('http');

const data = JSON.stringify({
  category: 'Arrays',
  difficulty: 'Medium'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/coding/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);

  let body = '';
  res.on('data', d => {
    body += d;
  });
  
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();
