// test-server.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('✅ API root working!');
});

app.get('/manual-test', (req, res) => {
  res.send('🧪 Manual test route works!');
});

app.get('/ping', (req, res) => {
  res.send('🏓 Ping success!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});
