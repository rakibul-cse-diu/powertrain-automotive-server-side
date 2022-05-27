const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const verify = require('jsonwebtoken/verify');
const stripe = require('stripe')('sk_test_51L43RjDIsxhoLpzhcuQQuFKF3oJ4gkZGgMlVPwjQvfWKeorzEza7MKZFGCqVLSWNoH5q6MMDkble6nVheJk59zEb00PSqvHAjZ');
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
        const paymentCollection = client.db('manufacturer').collection('payment');

        // verify admin midleware 
        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await profileCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                next();
            }
            else {
                res.status(403).send({ message: 'forbidden' });
            }
        }

        // get all parts item from collection 
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        })

        // insert parts
        app.post('/parts', verifyJwt, verifyAdmin, async (req, res) => {
            const parts = req.body;
            const result = await partsCollection.insertOne(parts);
            res.send(result);
        });

        // update parts quantity info
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

        // delete Parts
        app.delete('/parts/:id', verifyJwt, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await partsCollection.deleteOne(filter);
            res.send(result);
        })

        // get all reviews from collection 
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // insert review
        app.post('/reviews', verifyJwt, async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        // get specific profile 
        app.get('/getprofile', async (req, res) => {
            const userEmail = req.query.email;
            const query = {
                email: userEmail
            };
            const profile = await profileCollection.findOne(query);
            res.send(profile);
        })

        // get all profile 
        app.get('/getuser', verifyJwt, verifyAdmin, async (req, res) => {
            const query = {};
            const cursor = await profileCollection.find(query);
            const profile = await cursor.toArray();
            res.send(profile);
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
                    mobile: newItem.mobile,
                    education: newItem.education,
                    address: newItem.address,
                    linkedin: newItem.linkedin,
                    photoURL: newItem.photoURL
                }
            };
            const result = await profileCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        // make admin 
        app.put('/makeadmin/:id', verifyJwt, verifyAdmin, async (req, res) => {
            const userId = req.params.id;
            const newItem = req.body;
            const filter = { _id: ObjectId(userId) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: newItem.role,
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

        // get all orders 
        app.get('/orders', verifyJwt, verifyAdmin, async (req, res) => {
            const orders = await orderCollection.find().toArray();
            res.send(orders);
        })

        //get order for payment
        app.get('/order/:id', verifyJwt, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.send(order);
        })

        // update status 
        app.patch('/status/:id', verifyJwt, async (req, res) => {
            const id = req.params.id;
            const status = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: status.status
                }
            }
            const updatedOrder = await orderCollection.updateOne(filter, updatedDoc);
            res.send(updatedOrder);
        })

        // payment intent 
        app.post('/create-payment-intent', verifyJwt, async (req, res) => {
            const service = req.body;
            const price = service.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({ clientSecret: paymentIntent.client_secret })
        });

        // update payment
        app.patch('/order/:id', verifyJwt, async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const result = await paymentCollection.insertOne(payment);
            const updatedOrder = await orderCollection.updateOne(filter, updatedDoc);
            res.send(updatedOrder);
        })

        // get specific order 
        app.get('/myorder', verifyJwt, async (req, res) => {
            const userEmail = req.query.email;
            const query = {
                email: userEmail
            };
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // delete order
        app.delete('/order/:email', verifyJwt, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await orderCollection.deleteOne(filter);
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