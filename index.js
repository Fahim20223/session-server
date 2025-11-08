const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//model-db
//XeJxiaaYSCF0SeD0

const uri =
  "mongodb+srv://model-db:XeJxiaaYSCF0SeD0@flash0.nw85ito.mongodb.net/?appName=Flash0";

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
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const db = client.db("model-db");
    const modelCollection = db.collection("models");

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
    app.get("/models/:id", async (req, res) => {
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
    app.delete("/models/:id", (req, res) => {
      const id = req.params.id;

      res.send({
        success: true,
      });
    });

    await client.db("admin").command({ ping: 1 });
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
