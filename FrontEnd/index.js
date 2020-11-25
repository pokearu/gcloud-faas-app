'use strict';

$(document).ready(function() {
    let homePageGrid = $('#homePageGrid')
    homePageGrid.html("")
    generateGraphCard()
})

let createHistogramChart = undefined

let drawHistogram = (context, data)=> {
    
    var gradient = context.createLinearGradient(0, 0, 1000, 0);
    gradient.addColorStop(0, "rgb(4, 61, 33)");
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

let getDataCache = ()=> {
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
        $('#createHistogramCard').show()
        createHistogramChart ? createHistogramChart.destroy() : {}
        createHistogramChart = drawHistogram(document.getElementById('histogram').getContext('2d'),JSON.parse(cacheData[0]['dataset']))
    }).fail((error)=> {
        console.error(error)
        sentenceParserURL(data)
    })
}

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

let sentenceParserURL = (data)=> {
    $.post(config.sentenceParserURL, data)
    .done((dataset)=> {
        $('#createHistogramCard').show()
        createHistogramChart ? createHistogramChart.destroy() : {}
        createHistogramChart = drawHistogram(document.getElementById('histogram').getContext('2d'), dataset)
        saveDataCache(data.ebookUrl, JSON.stringify(dataset))
    })
}

let generateGraphCard = () => {
    let homePageGrid = $('#homePageGrid')
    $.get(config.queryCacheURL)
    .done((data)=> {
        data.forEach( (entity,index) => {
            let html = `
            <div class="col-3" style="padding:1em;">
                <div class="card">
                    <div class="card-body">
                    <h5 class="card-title">${entity['ebook']}</h5>
                        <canvas id="entityHistogram${index}" width="300" height="300"></canvas>
                    </div>
                </div>
            </div>
            `
            homePageGrid.append(html)
            // createHistogramChart ? createHistogramChart.destroy() : {}
            drawHistogram(document.getElementById("entityHistogram" + index).getContext('2d'), JSON.parse(entity['dataset']))
        })
    }).fail((error)=> {
        console.error(error)
    })
}