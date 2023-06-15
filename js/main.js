let topViewBarChart;

d3.csv('../data/novelpia_top100_0615_30d.csv')
    .then(data => {
        console.log(data);
        
        // top total view chart
        let topViewData = [];
        for (let key in data) {
            var currentData = data[key];
            var x = {};
            x["title"] = currentData["title"];
            x["view"] = parseInt(currentData["view"]);
            x["novelID"] = parseInt(currentData["novelID"])
            topViewData.push(x);
        }

        topViewData.sort((a,b) => b.view - a.view); 
        topViewData = topViewData.slice(0, 10);
        console.log(topViewData);

        topViewBarChart = new BarChartVis({parentElement: '#chart'}, topViewData);
        topViewBarChart.updateVis();
    })
    .catch(error => {
        console.error(error);
    });