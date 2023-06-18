let topViewBarChart, topGoodBarChart, topTagsBarChart;
let selectedNovel = 0, selectedTag = [];

d3.csv('../data/novelpia_top100_0615_30d.csv')
    .then(data => {
        console.log(data);

        // top total view chart
        let topViewData = [];
        for (let key in data) {
            if (key === "columns") break
            var currentData = data[key];
            var x = {};
            x["title"] = currentData["title"];
            x["criteria"] = parseInt(currentData["view"]);
            x["novelID"] = parseInt(currentData["novelID"]);
            x["description"] = currentData["description"];
            x["thumbnailURL"] = currentData["thumbnailURL"];
            x["tags"] = currentData["tags"].split('/');
            topViewData.push(x);
        }

        topViewData.sort((a, b) => b.criteria - a.criteria);
        topViewData = topViewData.slice(0, 10);
        console.log(topViewData);

        topViewBarChart = new BarChartVis({
            parentElement: '#viewChart',
            xTickFormat: function (d) { return d / 1000000 + 'M' },
            yTickFormat: d => d.slice(0, 6) + '...',
            color: "#5a5aed",
            name: "Top 10 Most View Novel"
        }, topViewData);
        topViewBarChart.updateVis();

        // top total view thumbnail
        let thumbnailData = topViewData.slice(0, 3);
        topThumnbnailChart = new ThumbnailChart({ parentElement: '#thumbnailChart' }, thumbnailData);
        topThumnbnailChart.updateVis();

        // top total good chart
        let topGoodData = [];
        for (let key in data) {
            if (key === "columns") break
            var currentData = data[key];
            var x = {};
            x["title"] = currentData["title"];
            x["criteria"] = parseInt(currentData["good"]);
            x["novelID"] = parseInt(currentData["novelID"]);
            x["description"] = currentData["description"];
            x["thumbnailURL"] = currentData["thumbnailURL"];
            x["tags"] = currentData["tags"].split('/');
            topGoodData.push(x);
        }
        topGoodData.sort((a, b) => b.criteria - a.criteria);
        topGoodData = topGoodData.slice(0, 10);
        topGoodBarChart = new BarChartVis({
            parentElement: '#goodChart',
            xTickFormat: function (d) { return d / 1000000 + 'M' },
            yTickFormat: d => d.slice(0, 6) + '...',
            color: "#eb4242",
            name: "Top 10 Most Liked Novel"
        }, topGoodData);
        topGoodBarChart.updateVis();

        // top tags in ranking
        let tagData = {};
        for (let key in data) {
            if (key === "columns") break
            var currentData = data[key];
            var tags = currentData["tags"].split('/');
            tags.forEach(function (element) {
                if (!(element in tagData)) {
                    tagData[element] = 1;
                }
                else {
                    tagData[element] += 1;
                }
            })
        }
        let topTagsData = [];
        for (let key in tagData) {
            var currentData = tagData[key];
            var x = {};
            x["title"] = key;
            x["criteria"] = currentData;
            x["novelID"] = 0;
            x["tags"] = [key];
            topTagsData.push(x);
        }
        topTagsData.sort((a, b) => b.criteria - a.criteria);
        topTagsData = topTagsData.slice(0, 10);
        topTagsBarChart = new BarChartVis({
            parentElement: '#tagsChart',
            xTickFormat: function (d) { return d },
            yTickFormat: d => d,
            color: "#69b3a2",
            name: "Top 10 Tags"
        }, topTagsData);
        topTagsBarChart.renderVis = function () {
            let vis = this;

            vis.bars = vis.chart.selectAll("myRect")
                .data(vis.data)
                .enter()
                .append("rect")
                .attr("x", vis.xScale(0))
                .attr("y", d => vis.yScale(d.title))
                .attr("width", d => vis.xScale(d.criteria))
                .attr("height", vis.yScale.bandwidth())
                .attr("fill", vis.config.color)

            vis.bars.on('mouseenter', (event, d) => {
                selectedTag = [d.tags[0]];
                updateSelectionAll();
            })
                .on('mouseleave', (event, d) => {
                    selectedTag = [];
                    updateSelectionAll();
                })

            vis.xAixsChartG.call(vis.xAxis);
            vis.yAxisChartG.call(vis.yAxis);
        }
        topTagsBarChart.updateSelected = function () {
            let vis = this;
            if (selectedTag.length != 0) {
                vis.bars.filter(d => !selectedTag.includes(d.title))
                    .attr('opacity', 0.5);
            }
            else {
                vis.bars.attr('opacity', 1.0);
            }
        }
        topTagsBarChart.updateVis();
    })
    .catch(error => {
        console.error(error);
    });

function updateSelectionAll() {
    topViewBarChart.updateSelected();
    topGoodBarChart.updateSelected();
    topTagsBarChart.updateSelected();
    topThumnbnailChart.updateSelected();

    if (selectedNovel === 0) return;

    d3.select('#tooltip')
        .style('left', (event.pageX) + 10 + 'px')
        .style('top', (event.pageY) + 'px')
}

function updateVisualization() {
    topViewBarChart.updateVis();
    topGoodBarChart.updateVis();
    topTagsBarChart.updateVis();
    topThumnbnailChart.updateVis();
}