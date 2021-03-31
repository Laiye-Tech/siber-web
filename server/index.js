const express = require('express');
const {
  config: { port },
} = require('../config');
const { getHtmlByConfig } = require('./html');
const uploadByAwsSDK = require('./aws');
var multer = require('multer');
const app = express();
const html = getHtmlByConfig();

// 解决浏览器跨域问题
app.use(function(request, response, next) {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  response.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  );

  //Handle Preflight
  if (request.method === 'OPTIONS') {
    response.status(200).send();
  } else {
    next();
  }
});

app.get('/healthz', (_, res) => {
  res.send('OK');
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('img'), async (req, res, next) => {
  try {
    var file = req.file;
    const url = await uploadByAwsSDK(file.originalname, file.buffer);
    return res.json({ url: url });
  } catch (err) {
    throw new Error(`上传文件失败`);
  }
});

app.use(express.static('dist'));

app.get('/*', (_, res) => {
  res.send(html);
});

app.listen(port, () => console.log(`> Server is running on 127.0.0.1:${port}`));
