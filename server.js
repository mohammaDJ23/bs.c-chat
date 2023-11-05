const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

function isFileExist(route) {
  return fs.existsSync(path.join(__dirname, route));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (isFileExist('dist')) {
  app.use('/chat/static', express.static(path.join(__dirname, 'dist')));
}

app.get('*', (req, res) => {
  if (isFileExist('dist')) {
    return res.sendFile(path.join(__dirname, 'dist/index.html'));
  }
  res.json({ errorMessage: 'Could not found the frontend directory.' });
});

app.listen(process.env.PORT, () => console.log('the server is running on ' + process.env.PORT));
