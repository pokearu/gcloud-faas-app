'use strict';

const request = require('request');

/**
 * HTTP Cloud function to handle OPTIONS, POST requests
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.sentenceParser = (req, res) => {
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
        case 'POST':
            {
                let ebookUrl = req.body.ebookUrl
                let sentenceMap = {}

                request.get(ebookUrl).on("data", (data) => {
                    console.log("Got data of size : " + data.length)
                    let dataString = data.toString()
                    let sentences = dataString.match(/\b((?!=|\.).)+(.)\b/g)

                    let intermediateMap = sentences.reduce((acc,sentence) => {
                        let key = sentence.split(" ").length
                        return {...acc, [key]: acc[key] + 1 || 1}
                    }, sentenceMap)

                    sentenceMap = intermediateMap
                }).on("error", (error) => {
                    console.error("eBook GET error: "+ error.message)
                    res.status(500).send(error.message)
                }).on("complete", (status) => {
                    console.log("eBook analysis complete")
                    res.status(200).send(sentenceMap)
                })
            }
    }
}