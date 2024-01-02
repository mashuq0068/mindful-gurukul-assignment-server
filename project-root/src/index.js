const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

require('dotenv').config();

app.use(express.json());
app.use(cors());

app.use('/', userRoutes);

app.get('/health', (req, res) => {
    res.send("web is running");
});

app.listen(port, () => {
    console.log(`The app is running on port ${port}`);
});
