const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const router = express.Router();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxdwxas.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectMongoDB() {
    await client.connect();
    return client.db("userHubDB").collection("users");
}

// POST /user
router.post('/user', async (req, res) => {
    const userCollection = await connectMongoDB();
    const user = req.body;
    const result = await userCollection.insertOne(user);

    
    res.send(result);
});

// GET /users
router.get('/users', async (req, res) => {
    const userCollection = await connectMongoDB();
    const email = req.query.email;
    const query = { creatorEmail: email };
    const users = await userCollection.find(query).toArray();
    res.send(users);
});

// GET /user/:id
router.get('/user/:id', async (req, res) => {
    const userCollection = await connectMongoDB();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log(query)
    const user = await userCollection.findOne(query);
    res.send(user);
});

// GET /filteredUsers
router.get('/filteredUsers', async (req, res) => {
    const userCollection = await connectMongoDB();
    const sortBy = req.query.sortBy || 'default';
    const email = req.query.email;
    const query = { creatorEmail: email };
    let data = await userCollection.find(query).toArray();

    switch (sortBy) {
        case 'A-Z':
            data?.sort((a, b) => a.userName.localeCompare(b.userName));
            break;
        case 'Z-A':
            data?.sort((a, b) => b.userName.localeCompare(a.userName));
            break;
        case 'Last Modified':
            data?.sort((a, b) => (b.modifiedAt ? new Date(b.modifiedAt.replace(/(\d+)(st|nd|rd|th)/, '$1').replace(/,/, '')).getTime() : 0) - (a.modifiedAt ? new Date(a.modifiedAt.replace(/(\d+)(st|nd|rd|th)/, '$1').replace(/,/, '')).getTime() : 0));
            break;
        case 'Last Inserted':
            data?.sort((a, b) => new Date(b.insertedAt.replace(/(\d+)(st|nd|rd|th)/, '$1').replace(/,/, '')).getTime() - new Date(a.insertedAt.replace(/(\d+)(st|nd|rd|th)/, '$1').replace(/,/, '')).getTime())
            break;
        default:
            break;
    }

    res.send(data);
});

// GET /searchedUsers
router.get('/searchedUsers', async (req, res) => {
    const userCollection = await connectMongoDB();
    const sortBy = req.query.sortBy || 'default';
    const email = req.query.email;
    const searchTerm = req.query.searchTerm || "";
    const query = {
        creatorEmail: email,
        $or: [
            { userName: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { phone: { $regex: searchTerm, $options: 'i' } },
        ],
    };
    let data = await userCollection.find(query).toArray();
    res.send(data);
});

// PATCH /user/:id
router.patch('/user/:id', async (req, res) => {
    const userCollection = await connectMongoDB();
    const id = req.params.id;
    const user = req.body;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updatedUser = {
        $set: {
            userName: user.userName,
            phone: user.phone,
            email: user.email,
            creatorEmail: user.creatorEmail,
            insertedAt: user.insertedAt,
            modifiedAt: user.modifiedAt,
        },
    };
    const result = await userCollection.updateOne(filter, updatedUser, options);
    res.send(result);
});

// DELETE /user/:id
router.delete('/user/:id', async (req, res) => {
    const userCollection = await connectMongoDB();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await userCollection.deleteOne(query);
    res.send(result);
});

module.exports = router;
