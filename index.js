const express = require("express")
const app = express()
const port = process.env.port || 5000
require('dotenv').config()
const cors = require('cors')
app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxdwxas.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        // await client.connect();
        const database = client.db("userHubDB")
        const userCollection = database.collection("users")

        // await client.db("admin").command({ ping: 1 });
        app.post('/user', async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user)
            res.send(result)

        })
        app.get('/users', async (req, res) => {

            const email = req.query.email
            const query = { creatorEmail: email }
            const users = await userCollection.find(query).toArray()
            res.send(users)
        })
        app.get('/user/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const user = await userCollection.findOne(query)
            res.send(user)
        })
        app.get('/filteredUsers', async (req, res) => {
            const sortBy = req.query.sortBy || 'default';
            const email = req.query.email
            const query = { creatorEmail: email }
            let data = await userCollection.find(query).toArray();


            switch (sortBy) {
                case 'A-Z':
                    data?.sort((a, b) => a.userName.localeCompare(b.userName));
                    break;
                case 'Z-A':
                    data?.sort((a, b) => b.userName.localeCompare(a.userName));
                    break;
                case 'Last Modified':
                    data?.sort((a, b) => b.modifiedAt ? new Date(b.modifiedAt.replace(/(\d+)(st|nd|rd|th)/, '$1').replace(/,/, '')).getTime() : 0  - a.modifiedAt ? new Date(a.modifiedAt.replace(/(\d+)(st|nd|rd|th)/, '$1').replace(/,/, '')).getTime() : 0 )
                    break;
                case 'Last Inserted':
                    data?.sort((a, b) =>  new Date(b.insertedAt.replace(/(\d+)(st|nd|rd|th)/, '$1').replace(/,/, '')).getTime() -  new Date(a.insertedAt.replace(/(\d+)(st|nd|rd|th)/, '$1').replace(/,/, '')).getTime())
                    break;
                default:
                    break;
            }

            res.send(data);
        });
        app.patch('/user/:id', async (req, res) => {
            const id = req.params.id
            const user = req.body
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedUser = {
                $set: {
                    userName: user.userName,
                    phone: user.phone,
                    email: user.email,
                    creatorEmail: user.creatorEmail,
                    insertedAt: user.insertedAt,
                    modifiedAt: user.modifiedAt


                }
            }
            const result = await userCollection.updateOne(filter, updatedUser, options)
            res.send(result)

        })

        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("web is running")
})
app.listen(port, () => {
    console.log(`The app is running on port ${port}`)
})
