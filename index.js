const express = require("express")
const app = express()
const port = process.env.port || 5000
require ('dotenv').config()
const cors = require('cors')
app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion } = require('mongodb');
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
    app.post('/user' , async(req , res) => {
        const user = req.body
        const result = await userCollection.insertOne(user)
        res.send(result)

    })
    app.get('/users' , async(req , res) => {
        
        const email = req.query.email
        const query = {creatorEmail : email}
        const users = await userCollection.find(query).toArray()
        res.send(users)
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send("web is running")
})
app.listen(port, () =>{
    console.log(`The app is running on port ${port}`)
})
