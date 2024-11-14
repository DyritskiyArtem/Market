require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const makeRouter = require('./router');

const app = express();
const port = 1000;

// console.log(process.env.TOKEN_SECRET)

app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public"));
app.use(cookieParser());

makeRouter(app);

app.listen(port, () => {
  console.log(`The server is running on http://localhost:${port}`);
});