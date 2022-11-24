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
        const usersCollection = client.db("octal-phone-store").collection("users");
        const ordersCollection = client.db("octal-phone-store").collection("orders");

    
        app.get("/products", async(req, res) => {
            const products = await productCollection.find({}).toArray();
            res.send(products)
        })

        app.get("/products/:id", async (req, res) => {
            const id = parseInt(req.params.id)
            const products = await productCollection.findOne({ category_id: id })
            res.send(products)
        })

        app.post("/users", async(req, res) => {
            const userData = req.body;
            const user = await usersCollection.insertOne(userData);
            res.send(user)
        })
        
        app.post("/orders", async(req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result)
        })

        app.get("/users/:email", async(req, res) => {
            const email = req.params.email
            const user = await usersCollection.findOne({ email: email });
            res.send(user)
        })

        app.get("/users", async(req, res) => {
            const role = req.query.role;
            let query = { role : role}
            
            if(query.role === "seller"){
                query.role === "seller";
                const users = await usersCollection.find(query).toArray();
                res.send(users)
            } else if (query.role === "buyer"){
                query.role === "buyer";
                const users = await usersCollection.find(query).toArray();
                res.send(users)
            } else if (query.role === "admin") {
                const users = await usersCollection.find({}).toArray();
                res.send(users)
            }
        })

        app.delete("/users/:email", async(req, res) => {
            const email = req.params.email;
            const filter = {email: email};
            const result = await usersCollection.deleteOne(filter);
            res.send(result)
        })

    } catch (error) {
        console.log(error);
    }
}

server()




app.listen(port, () => console.log("Octal Phone Store server is running on port", port))