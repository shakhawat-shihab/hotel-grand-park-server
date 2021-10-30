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
        const servicesCollection = database.collection(process.env.COLLECTION_NAME1);
        const ordersCollection = database.collection(process.env.COLLECTION_NAME2);
        //post api
        app.post('/addService', async (req, res) => {
            const newUser = req.body;
            const filter = { id: newUser.id };
            console.log('new data : ', filter);
            const cursor = servicesCollection.find(filter);
            const service = await cursor.toArray();
            console.log(service);
            //if already have a service with this id, then no entry in DB
            if (service.length) {
                res.send('already have this id');
            }
            else {
                const result = await servicesCollection.insertOne(newUser);
                console.log(`Added user at index: ${result.insertedId}`);
                console.log('Success', result);
                res.json(result);
            }
        })
        //use post to load the data of local storage
        app.post('/service/byId', async (req, res) => {
            console.log('the keys of product : ', req.body);
            const serviceIds = req.body;
            const filter = { id: { $in: serviceIds } };
            const cursor = servicesCollection.find(filter);
            const services = await cursor.toArray();
            console.log('hitt ', services);
            res.json(services);
        })
        //get api for rooms
        app.get('/services/rooms', async (req, res) => {
            const filter = { type: "room" };
            const cursor = servicesCollection.find(filter);
            const services = await cursor.toArray();
            res.send(services);
        });
        //get api for all services
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });
        //get api for all orders
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });
        //place a order
        app.post('/placeOrder', async (req, res) => {
            console.log('order : ', req.body);
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log('Successfully ordered');
            res.json(result);
        })
        //show my order
        app.post('/myOrder', async (req, res) => {
            console.log('order : ', req.body);
            const filter = req.body;
            const cursor = ordersCollection.find(filter);
            const orders = await cursor.toArray();
            res.send(orders);
            // const order = req.body;
            // const result = await ordersCollection.insertOne(order);
            // console.log('Successfully ordered');
            // res.json(result);
        })

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
