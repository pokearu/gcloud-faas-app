'use strict';

$(document).ready(function() {
    $('#homeLoader').show()
    let homePageGrid = $('#homePageGrid')
    homePageGrid.html("")
    generateGraphCard()
})

let createHistogramChart = undefined

let gradients = ["rgb(167, 20, 20)", "rgb(4, 61, 33)", "rgb(9, 22, 84)", "rgb(84, 8, 73)", "rgb(210, 71, 14)"]

/**
 * Function to randomly get RGB for plots
 */
let getRGB = () => gradients[Math.floor(Math.random() * gradients.length)]

/**
 * Function to draw the Histogram
 * @param {Object} context Canvas context object
 * @param {Object} data Dataset to plot the Histogram
 */
let drawHistogram = (context, data)=> {
    
    var gradient = context.createLinearGradient(0, 0, 1000, 0);
    gradient.addColorStop(0, getRGB());
    gradient.addColorStop(1, "rgb(228, 227, 227)");

    const chart = new Chart(context, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: 'Number of Sentences',
            data: Object.values(data),
            backgroundColor: gradient,
          }]
        },
        options: {
          scales: {
            xAxes: [{
              display: false,
              barPercentage: 1.3,
              ticks: {
                max: 3,
              }
            }, {
              display: true,
              ticks: {
                autoSkip: false,
                max: 4,
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      })
    return chart
} 

/**
 * Function to fetch eBook data from cache or trigger sentence parser
 */
let getDataCache = ()=> {
    $('#loader').show()
    $('#createHistogramCard').hide()
    let data = {
        "ebookUrl": $('#ebookUrl').val()
    }
    $.get(config.dataCacheURL, data)
    .done((cacheData)=> {
        if (cacheData[0] === null) {
            sentenceParserURL(data) 
            return 
        }
        console.log("Found ebook in data cache")
        $('#loader').hide()
        $('#createHistogramCard').show()
        createHistogramChart ? createHistogramChart.destroy() : {}
        createHistogramChart = drawHistogram(document.getElementById('histogram').getContext('2d'),JSON.parse(cacheData[0]['dataset']))
    }).fail((error)=> {
        console.error(error)
        sentenceParserURL(data)
    })
}

/**
 * Function to create a new entity in the Datastore
 * @param {String} key Datastore entity key
 * @param {Object} dataset Data to store in entity property dataset
 */
let saveDataCache = (key, dataset)=> {
    let data = {
        "ebookUrl": key,
        "dataset": dataset
    }
    $.post(config.dataCacheURL, data)
    .done((data)=> {
        console.log("Ebook cached")
    })
}

/**
 * Function to trigger sentence parser and initiates result plot
 * @param {Object} data Object with the eBook URL
 */
let sentenceParserURL = (data)=> {
    $.post(config.sentenceParserURL, data)
    .done((dataset)=> {
        $('#loader').hide()
        $('#createHistogramCard').show()
        createHistogramChart ? createHistogramChart.destroy() : {}
        createHistogramChart = drawHistogram(document.getElementById('histogram').getContext('2d'), dataset)
        saveDataCache(data.ebookUrl, JSON.stringify(dataset))
    })
}

/**
 * Function to fetch query result entities and load the Home page
 */
let generateGraphCard = () => {
    let homePageGrid = $('#homePageGrid')
    $.get(config.queryCacheURL)
    .done((data)=> {
        data.forEach( (entity,index) => {
            let html = `
            <div class="col-3" style="padding:1em;">
                <div class="card">
                    <div class="card-body">
                    <h5 class="card-title">
                      <a href="${entity['ebook']}" style="text-decoration: none; color:black;" target="_blank">${entity['ebook']}</a>
                    </h5>
                        <canvas id="entityHistogram${index}" width="300" height="300"></canvas>
                    </div>
                </div>
            </div>
            `
            homePageGrid.append(html)
            drawHistogram(document.getElementById("entityHistogram" + index).getContext('2d'), JSON.parse(entity['dataset']))
        })
        $('#homeLoader').hide()
    }).fail((error)=> {
        console.error(error)
    })
}