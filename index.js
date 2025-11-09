const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const admin = require("firebase-admin");

const serviceAccount = require("./session-client-firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//model-db
//XeJxiaaYSCF0SeD0

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@flash0.nw85ito.mongodb.net/?appName=Flash0`;

//middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res
      .status(401)
      .send({ message: "unauthorized access. Token not found" });
  }
  const token = authorization.split(" ")[1];

  try {
    await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    res.status(401).send({
      message: "unauthorized access",
    });
  }
  // console.log(token);
  // console.log("i am from middleware");
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const db = client.db("model-db");
    const modelCollection = db.collection("models");
    const downloadsCollection = db.collection("downloads");

    //all products
    app.get("/models", async (req, res) => {
      const cursor = modelCollection.find();
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });

    // add products POST
    app.post("/models", async (req, res) => {
      const newModel = req.body;
      console.log(newModel);
      const result = await modelCollection.insertOne(newModel);
      // res.send(result);
      res.send({
        success: true,
        result, // ✅ make sure this matches the const above
      });
    });

    //specific card find by id => product details
    app.get("/models/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await modelCollection.findOne(query);

      res.send({
        success: true,
        result,
      });
    });

    //update
    app.put("/models/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      // console.log(data, id);
      const query = { _id: new ObjectId(id) };
      const filter = query;
      const update = {
        $set: data,
      };
      const result = await modelCollection.updateOne(filter, update);
      res.send({
        success: true,
        result,
      });
    });

    //Delete
    app.delete("/models/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await modelCollection.deleteOne(query);
      res.send({
        success: true,
        result,
      });
    });

    //latest-models

    app.get("/latest-models", async (req, res) => {
      const result = await modelCollection
        .find()
        .sort({ created_at: "desc" })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/my-models", verifyToken, async (req, res) => {
      const email = req.query.email;

      const result = await modelCollection
        .find({ created_by: email })
        .toArray();
      res.send(result);
    });

    //downloads
    app.post("/downloads/:id", async (req, res) => {
      const data = req.body;
      const id = req.params.id;
      const result = await downloadsCollection.insertOne(data);

      const filter = { _id: new ObjectId(id) };
      const update = {
        $inc: {
          downloads: 1,
        },
      };
      const downloadCounted = await modelCollection.updateOne(filter, update);
      res.send(result, downloadCounted);
    });

    //get the data
    app.get("/my-downloads", verifyToken, async (req, res) => {
      const email = req.query.email;

      const result = await downloadsCollection
        .find({ downloaded_by: email })
        .toArray();
      res.send(result);
    });

    app.get("/search", async (req, res) => {
      const search_text = req.query.search;
      const result = await modelCollection
        .find({ name: { $regex: search_text, $options: "i" } })
        .toArray();
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
