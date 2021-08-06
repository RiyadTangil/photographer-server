const express = require("express");





const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7xwek.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("hello from db it's working working");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const serviceCollection = client
    .db("accounting-service")
    .collection("service");
  const ordersCollection = client.db("accounting-service").collection("orders");
  const reviewCollection = client.db("accounting-service").collection("review");
  const adminCollection = client.db("accounting-service").collection("admin");

  app.get("/service", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/orders", (req, res) => {
    ordersCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.get("/reviews", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
    app.get("/admin", (req, res) => {
      adminCollection.find({}).toArray((err, documents) => {
        res.send(documents);
      });
    });


  app.post("/addOrder", (req, res) => {
    const orders = req.body;
    ordersCollection.insertOne(orders).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addAdmin", (req, res) => {
    const admin = req.body;
    console.log(admin);
    adminCollection.insertOne(admin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
  
    adminCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });

  app.post("/addReview", (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });


//   app.post('/orderByUsers', (req, res) => {

//     const email = req.body.email;
//             ordersCollection.find({email: email})
//                 .toArray((err, documents) => {
//                     console.log( documents)
//                     res.send(documents);
//                 })
       
// })




  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    console.log(name, description, image, price);
    serviceCollection
      .insertOne({ name, description, image, price })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });



  app.patch("/update/:id", (req, res) => {
    const newCondition = req.body.status;
    console.log(newCondition);
    ordersCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },

        {
          $set: { status: newCondition },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });
  app.delete("/delete/:id", (req, res) => {
    serviceCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
});

app.listen(process.env.PORT || port);
