"use strict";

const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

exports.dataCache = (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    switch (req.method) {
        case 'OPTIONS':
            {   // Send response to OPTIONS requests
                res.set('Access-Control-Allow-Methods', 'GET, POST')
                res.set('Access-Control-Allow-Headers', 'Content-Type')
                res.set('Access-Control-Max-Age', '3600')
                res.status(204).send('')
                break
            }
        case 'GET':
            {
                let ebookUrl = req.query.ebookUrl
                const key = datastore.key(["SentenceFrequency", ebookUrl])
                datastore.get(key).then((entity) => {
                    console.log("Fetched entity from Datastore")
                    res.status(200).send(entity)
                }).catch((error) => {
                    console.error(error)
                    res.status(400).send(error.message)
                })
                break
            }
        case 'POST':
            {
                let ebookUrl = req.body.ebookUrl
                const key = datastore.key(["SentenceFrequency", ebookUrl])
                const data = {
                    ebook: ebookUrl,
                    dataset: req.body.dataset
                }

                const entity = {
                    "key": key,
                    "data": data
                }
                datastore.upsert(entity).then((data) => {
                    let apiResponse = data[0]
                    console.log(JSON.stringify(apiResponse))
                    res.status(201).send(apiResponse)
                }).catch((error) => {
                    console.error(error)
                    res.status(400).send(error.message)
                })
                break
            }
    }
}