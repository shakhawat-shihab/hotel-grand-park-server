const express = require('express');
var cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

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
        //post api to add service
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
        //get api for services having type = rooms
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
        //post api to place a order
        app.post('/placeOrder', async (req, res) => {
            console.log('order : ', req.body);
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log('Successfully ordered');
            res.json(result);
        })
        //post api to show my order
        app.post('/myOrder', async (req, res) => {
            console.log('order : ', req.body);
            const filter = req.body;
            const cursor = ordersCollection.find(filter);
            const orders = await cursor.toArray();
            res.send(orders);
        })
        // delete  api to delete an order
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('deleting user with id ', result);
            res.json(result);
        })
        // update  api to change status of a order
        app.put('/updateOrder/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            console.log('data', data);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    status: data.status
                }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
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
