"use strict";

const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

/**
 * HTTP Cloud function to handle OPTIONS, GET, POST requests
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
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
                    res.status(500).send(error.message)
                })
                break
            }
    }
}

/**
 * HTTP Cloud function to handle OPTIONS, GET requests
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.queryCache = (req, res) => {
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
                const query = datastore.createQuery('SentenceFrequency').limit(8)
                datastore.runQuery(query).then((data) => {
                    const entities = data[0]
                    res.status(200).send(entities)
                }).catch((error) => {
                    console.error(error.message)
                    res.status(500).send(error.message)
                })
            }
        }
}