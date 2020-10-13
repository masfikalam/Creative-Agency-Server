const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lcv2f.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const ourServices = client.db(process.env.DB_NAME).collection("ourServices");
    const orders = client.db(process.env.DB_NAME).collection("orders");
    const reviews = client.db(process.env.DB_NAME).collection("reviews");

    // loading all orders
    app.get('/allOrders', (req, res) => {
        orders.find({})
        .toArray((err, docs) => res.send(docs));
    })
    
    // loading orders by email
    app.get('/allOrders/:email', (req, res) => {
        orders.find({email: req.params.email})
        .toArray((err, docs) => res.send(docs));
    })

    // adding order
    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        orders.insertOne(newOrder)
        .then(result => res.send(result.insertedCount > 0))
    })

    // loading all Reviews
    app.get('/allReviews', (req, res) => {
        reviews.find({})
        .toArray((err, docs) => res.send(docs));
    })

    // adding review
    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        reviews.insertOne(newReview)
        .then(result => res.send(result.insertedCount > 0))
    })

    // // load single order
    // app.get('/order', (req, res) => {
    //     orders.find({_id: ObjectId(req.query.id)})
    //     .toArray((err, docs) => res.send(docs[0]));
    // })

    // // adding order
    // app.post('/addOrder', (req, res) => {
    //     const order = req.body;
    //     orders.insertOne(order)
    //     .then(result => res.send(result.insertedCount > 0))
    // })

    // // updating order
    // app.patch('/edit/:id', (req, res) => {
    //     orders.updateOne({_id: ObjectId(req.params.id)},
    //     {$set: {
    //         name: req.body.name,
    //         category: req.body.category,
    //         price: req.body.price,
    //         amount: req.body.amount,
    //         photo: req.body.photo
    //     }})
    //     .then(result => res.send(result.modifiedCount > 0))
    // })
});

app.listen(process.env.PORT || 5000);