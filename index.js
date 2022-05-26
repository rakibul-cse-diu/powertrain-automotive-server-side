const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());

function verifyJwt(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = auth.split(' ')[1];
    jwt.verify(token, process.env.SEC_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Access Forbidden' })
        }
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@node-mongo-server-1.pkxfn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        console.log("db connected");
        const partsCollection = client.db('manufacturer').collection('parts');
        const reviewsCollection = client.db('manufacturer').collection('reviews');
        const profileCollection = client.db('manufacturer').collection('profiles');
        const orderCollection = client.db('manufacturer').collection('orders');

        // get all parts item from collection 
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        })

        // update parts info
        app.put('/updateparts/:id', async (req, res) => {
            const itemId = req.params.id;
            const newItem = req.body;
            const filter = { _id: ObjectId(itemId) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    availableQuantity: newItem.availableQuantity,
                }
            };
            const result = await partsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        // get single parts
        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const part = await partsCollection.findOne(query);
            res.send(part);
        })

        // get all reviews from collection 
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // get profile 
        app.get('/getprofile', async (req, res) => {
            const userEmail = req.query.email;
            const query = {
                email: userEmail
            };
            const profile = await profileCollection.findOne(query);
            res.send(profile);
            console.log(profile)
        })

        // update or insert profile 
        app.put('/updateprofile/:email', async (req, res) => {
            const userEmail = req.params.email;
            const newItem = req.body;
            const filter = { email: userEmail };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: newItem.name,
                    education: newItem.education,
                    location: newItem.location,
                    phoneNumber: newItem.phoneNumber,
                    linkedIn: newItem.linkedIn
                }
            };
            const result = await profileCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        // very admin 
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const profile = await profileCollection.findOne(query);
            const isAdmin = profile.role === 'admin';
            res.send({ admin: isAdmin })
        })

        // add order
        app.post('/placeorder', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        // Auth JWT 
        app.post('/login', (req, res) => {
            const userEmail = req.body;
            const accessToken = jwt.sign(userEmail, process.env.SEC_KEY, {
                expiresIn: '1d'
            })
            res.send({ accessToken });
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World...!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})