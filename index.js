const express = require('express');
var cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zwiso.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db(process.env.DB_NAME);
        const servicecCollection = database.collection(process.env.COLLECTION_NAME1);
        const ordersCollection = database.collection(process.env.COLLECTION_NAME2);
        //post api
        app.post('/addService', async (req, res) => {
            console.log('new data : ', req.body);
            const newUser = req.body;
            const result = await servicecCollection.insertOne(newUser);
            console.log(`Added user at index: ${result.insertedId}`);
            console.log('Success');
            res.json(result);
        })
        //use post to load the data of local storage
        app.post('/service/byId', async (req, res) => {
            console.log('the keys of product : ', req.body);
            const serviceIds = req.body;
            const filter = { id: { $in: serviceIds } };
            const cursor = servicecCollection.find(filter);
            const services = await cursor.toArray();
            console.log('hitt ', services);
            res.json(services);
        })
        //get api
        app.get('/services/rooms', async (req, res) => {
            const filter = { type: "room" };
            const cursor = servicecCollection.find(filter);
            const services = await cursor.toArray();
            res.send(services);
        });
        //get api
        app.get('/services', async (req, res) => {
            const cursor = servicecCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

    } finally {
        // the next line is commented, because connection is closing before trigger post
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
