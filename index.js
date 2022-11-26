const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const categoryCollection = client.db("octal-phone-store").collection("categories");

    
        app.get("/categories", async(req, res) => {
            const categories = await categoryCollection.find({}).toArray();
            res.send(categories)
        })

        

        app.get("/products/:id", async (req, res) => {
            const id = req.params.id
            const products = await productCollection.find({ category_id: id }).toArray()
            res.send(products)
        })
        app.post("/products", async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result)
        })

        app.get("/myproducts/:email", async (req, res) => {
            const email = req.params.email;
            const myProducts = await productCollection.find({ seller_email: email }).toArray()
            res.send(myProducts)
        })

        app.get("/buyers", async(req, res) => {
            const buyers = await ordersCollection.find({}).toArray();
            res.send(buyers)
        })

        app.get("/myOrders", async(req, res) => {
            const email = req.query.email;
            const orders = await ordersCollection.find({ email: email }).toArray();
            res.send(orders)
        })

        app.get("/orders/:id", async(req, res)=> {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const order = await ordersCollection.findOne(query);
            res.send(order)
        })

        app.post("/orders", async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result)
        })

        app.put("/orders/:id", async(req, res) => {
            const paidOrder = req.body
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const option = {upsert: true}
            const updateOrder = {
                $set: {
                    paid: true,
                    transactionId: paidOrder.transactionId
                }
            }

            const result = await ordersCollection.updateOne(filter, updateOrder, option);
            res.send(result)
        })

        app.get("/users", async (req, res) => {
            const role = req.query.role;
            let query = { role: role }

            if (query.role === "seller") {
                query.role === "seller";
                const users = await usersCollection.find(query).toArray();
                res.send(users)
            } else if (query.role === "buyer") {
                query.role === "buyer";
                const users = await usersCollection.find(query).toArray();
                res.send(users)
            } else if (query.role === "admin") {
                const users = await usersCollection.find({}).toArray();
                res.send(users)
            }
        })

        app.get("/users/:email", async (req, res) => {
            const email = req.params.email
            const user = await usersCollection.findOne({ email: email });
            res.send(user)
        })

        app.post("/users", async(req, res) => {
            const userData = req.body;
            const user = await usersCollection.insertOne(userData);
            res.send(user)
        })

        app.put("/users/sellers/:id", async(req, res) =>{
            // update seller status in users collection
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const option = {upsert: true};
            const updatedSeller = {$set: {isVerified: true}}
            const result = usersCollection.updateOne(filter, updatedSeller, option);
            res.send(result)
            
        })

        app.put("/products/sellers", async(req, res) => {
            const result = await productCollection.updateMany({ isVerified: false }, { $set: { isVerified: true }})
            res.send(result)
        })

        app.delete("/users/:email", async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await usersCollection.deleteOne(filter);
            res.send(result)
        })
    } catch (error) {
        console.log(error);
    }
}
server()
app.listen(port, () => console.log("Octal Phone Store server is running on port", port))