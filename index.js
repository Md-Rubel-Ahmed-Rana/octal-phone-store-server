const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Octal Phone Store server is running")
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n72f5gi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const server = async() => {
    try {
        const productCollection = client.db("octal-phone-store").collection("products");

        app.get("/products", async(req, res) => {
            const products = await productCollection.find({}).toArray();
            res.send(products)
        })
        
    } catch (error) {
        console.log(error);
    }
}

server()




app.listen(port, () => console.log("Octal Phone Store server is running"))