const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { rateLimit  } = require('express-rate-limit');

const app = express();

const PORT = 3005;

app.use(morgan('combined'));

const limiter = rateLimit({
	windowMs: 20 * 1000, // 20 seconds
	limit: 3, // Limit each IP to 3 requests per `window`.
});
app.use(limiter);

app.use('/bookingService', async (req, res, next) => {
  try {
    const response = await axios.get('http://localhost:3002/api/v1/isAuthenticated', {
      headers: {
        'x-access-token' : req.headers['x-access-token']
      }
    });
    console.log(response.data);  
    if(response.data.success)
      next();  
    else {
      return res.status(401).json({
        message: 'Unauthorised'
      })
    }
  } 
  catch (error) {
    res.status(401).json({
      msg: 'Unauthorised'
    })
  }  
});

app.use('/bookingService', createProxyMiddleware({ 
  target: 'http://localhost:3003/', changeOrigin: true 
}));

app.get('/home', (req, res) => {
  return res.status(200).json({
    message: 'Success'
  })
});

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
})