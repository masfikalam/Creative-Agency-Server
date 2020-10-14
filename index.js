const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const app = express();
require('dotenv').config();
app.use(cors());
app.use(fileUpload())
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
    const admin = client.db(process.env.DB_NAME).collection("admin");

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

    // checking for admin
    app.get('/checkAdmin/:email', (req, res) => {
        admin.find({email: req.params.email})
        .toArray((err, docs) => res.send(docs.length > 0));
    })

    // loading all services
    app.get('/allServices', (req, res) => {
        ourServices.find({})
        .toArray((err, docs) => res.send(docs));
    })

    // adding new service
    app.post('/addService', (req, res) => {
        const name = req.body.name;
        const desc = req.body.description;
        const file = req.files.file;
        const filePath = `${__dirname}/icons/${file.name}`;
        file.mv(filePath, err => {
            if(err) { console.log(err) }
            const encodeImg = fs.readFileSync(filePath, 'base64');
            const image = { 
                contentType: file.mimetype,
                size: file.size,
                img: Buffer(encodeImg, 'base64')
            }
            const newService = {name, desc, image};
            ourServices.insertOne(newService)
            .then(result => {
                fs.remove(filePath)
                res.send(result.insertedCount > 0)
            })
        })
    })

    // adding new admin
    app.post('/makeAdmin', (req, res) => {
        const newAdmin = req.body;
        admin.insertOne(newAdmin)
        .then(result => res.send(result.insertedCount > 0))
    })

    // // load single order
    // app.get('/order', (req, res) => {
    //     orders.find({_id: ObjectId(req.query.id)})
    //     .toArray((err, docs) => res.send(docs[0]));
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