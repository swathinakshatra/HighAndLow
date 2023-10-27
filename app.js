require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json({ limit: '10mb' }));
require('./helpers/cors')(app);
require('./helpers/db')();
require('./helpers/redis');
require('./helpers/routes')(app);
require('./helpers/publisher');

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
