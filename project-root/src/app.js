const express = require("express");
const app = express();
const port = process.env.port || 5000;
const cors = require('cors');
const userRoutes = require('./userRoutes');

require('dotenv').config();

app.use(express.json());
app.use(cors());

app.use('/user', userRoutes);

app.get('/', (req, res) => {
    res.send("web is running");
});

app.listen(port, () => {
    console.log(`The app is running on port ${port}`);
});
