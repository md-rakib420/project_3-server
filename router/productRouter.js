const express = require("express");
const mongoDb = require("../mongoDb");
const ObjectId = require('mongodb').ObjectId;

const productRouter = express.Router();
const client = mongoDb();

async function products() {
    try {
        await client.connect();
        const database = client.db("cycle-mart");
        const products = database.collection("products");

        //products part
        productRouter.post("/", async (req, res) => {
            const result = await products.insertOne(req.body);
            res.json(result);
        });
        //get all products
        productRouter.get("/", async (req, res) => {
            const result = await products.find({}).toArray();
            res.send(result)
        });
        //products for home page
        productRouter.get("/home", async (req, res) => {
            const result = await products.find({}).limit(8).toArray();
            res.send(result)
        });
        // get product by id
        productRouter.get("/:id", async (req, res) => {
            const id = req.params.id;
            if (id.startsWith("&&")) {
                const splitId = id.split("&&");
                const sliced = splitId.slice(1, splitId.length);
                const arryOfId = [];
                for (const id of sliced) {
                    arryOfId.push(ObjectId(id));
                }
                const quary = {
                    _id: {
                        $in: arryOfId
                    }
                }
                const result = await products.find(quary).toArray();
                res.send(result);
            }
            else {
                const quary = { _id: ObjectId(id) };
                const result = await products.findOne(quary);
                res.send(result);
            }
        });

        //category product
        productRouter.get("/category/:name", async (req, res) => {
            const categoryName = req.params.name;
            const quary = { category: categoryName };
            const result = await products.find(quary).toArray();
            res.send(result);
        })

        //get rendom product
        productRouter.get("/rendom/:num", async (req, res) => {
            const number = parseInt(req.params.num);
            const result = await products.find({}).skip(number).limit(1).toArray();
            res.send(result);
        });
        //get product by brand name
        productRouter.get("/brand/:brand", async (req, res) => {
            let brandName = [];
            const brand = req.params.brand;
            if (!brand.includes("&&")) {
                brandName = [brand];
            }
            else {
                const brands = brand.split("&&");
                brandName = brands;
            };
            const quary = {
                vendor: {
                    $in: brandName
                }
            };
            const result = await products.find(quary).toArray();
            res.send(result);
        })
        //get product by type
        productRouter.get("/type/:type", async (req, res) => {
            let typeName = [];
            const type = req.params.type;
            if (!type.includes("&&")) {
                typeName = [type];
            }
            else {
                const types = type.split("&&");
                typeName = types;
            };
            const quary = {
                type: {
                    $in: typeName
                }
            };
            const result = await products.find(quary).toArray();
            res.send(result);
        });
        //product by price range
        productRouter.get("/productsByPrice", async (req, res) => {
            const from = req.query.from;
            const till = req.query.till;
            const quary = {
                price: { $gte: from },
                price: { $lt: till }
            };
            const result = await products.find(quary).toArray();
            res.send(result);
        })
        productRouter.put("/", async (req, res) => {
            const id = req.body.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = { $set: req.body }
            const result = await products.updateOne(filter, updateDoc);
            res.json(result);
        });
        productRouter.delete("/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await products.deleteOne(filter);
            res.send(result);
        });
    }
    finally {

    }
}
products();
module.exports = productRouter;
