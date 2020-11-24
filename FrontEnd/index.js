'use strict';

$(document).ready(function() {
    // welcome()
})

let createHistogramChart = undefined

let drawHistogram = (context, data)=> {
    const chart = new Chart(context, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: 'Number of Sentences',
            data: Object.keys(data).map(key => data[key].length),
            backgroundColor: 'green',
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

let sentenceParserURL = ()=> {
    let data = {
        "ebookUrl": $('#ebookUrl').val()
    }
    $.post(config.sentenceParserURL, data)
    .done((data)=> {

        createHistogramChart ? createHistogramChart.destroy() : {}
        createHistogramChart = drawHistogram(document.getElementById('histogram').getContext('2d'), data)
    })
}