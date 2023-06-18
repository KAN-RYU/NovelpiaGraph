let topViewBarChart, topGoodBarChart, topTagsBarChart;
let wholeData = [];
let selectedNovel = 0, selectedTag = [];
let mainTags = [];

d3.csv('../data/novelpia_top100_0615_30d.csv')
    .then(data => {
        wholeData = data;

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
        let topTagsDataRaw = topTagsData;
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

        addMainTagBoxes(data, topTagsDataRaw);
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
    let selectedData = wholeData.filter(novel => novel.novelID === selectedNovel.toString());
    selectedData = selectedData[0];

    d3.select('#tooltipImage')
        .attr('src', selectedData.thumbnailURL);

    d3.select('#tooltipTitle')
        .text(selectedData.title);

    let processedDesc = selectedData.description.replaceAll("\\n", ' ');
    if (processedDesc.length > 100) processedDesc = processedDesc.slice(0, 100) + '...'
    d3.select('#tooltipDescription')
        .text(processedDesc);
    d3.select('#tooltipView')
        .text('Total View: ' + selectedData.view);
    d3.select('#tooltipGood')
        .text('Total Like: ' + selectedData.good);
    d3.select('#tooltipTag')
        .text('Tags: ' + selectedData.tags);
    d3.select('#tooltipLink')
        .attr('href', 'https://novelpia.com/novel/' + selectedData.novelID);

}

function updateVisualization() {
    topViewBarChart.updateVis();
    topGoodBarChart.updateVis();
    topTagsBarChart.updateVis();
    topThumnbnailChart.updateVis();
}

function addMainTagBoxes(data, topTags) {
    mainTags = [];
    for (let key in data) {
        if (key === "columns") break
        var currentData = data[key];
        let tags = currentData["tags"].split('/');
        mainTags.push(tags[0]);
    }
    mainTags = new Set(mainTags);
    let tags = [];
    topTags.forEach(function (element) { if (mainTags.has(element.title)) tags.push(element.title) });
    mainTags = tags;

    d3.select('#checkboxes')
        .selectAll('div')
        .data(tags)
        .enter()
        .append('div')
        .attr('class', 'form-check')
        .attr('onchange', 'checkboxClicked()')
        .call((parent) => parent
            .append('input')
            .attr('class', 'form-check-input')
            .attr('type', 'checkbox')
            .attr('id', (d, i) => 'tagbox' + i)
            .property('checked', true)
        )
        .call((parent) => parent
            .append('label')
            .text(d => d)
            .attr('class', 'from-check-label')
            .attr('id', (d, i) => 'label' + 'tagbox' + i)
            .attr('for', (d, i) => 'tagbox' + i))
}

function checkboxClicked() {
    // mainTags
    let data = wholeData

    // update mainTag
    let negativeTag = []
    d3.selectAll('input')
        .each(function () {
            if (!this.checked) {
                negativeTag.push(d3.select('#label' + this.id).text())
            }
        })

    // top total view chart
    let topViewData = [];
    for (let key in data) {
        if (key === "columns") break
        var currentData = data[key];
        let tagFlag = false;
        currentData["tags"].split('/').forEach(tag => { if (negativeTag.includes(tag)) tagFlag = true; })
        if (tagFlag) continue;
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

    topViewBarChart.data = topViewData;
    topViewBarChart.updateVis();

    // top total view thumbnail
    let thumbnailData = topViewData.slice(0, 3);
    topThumnbnailChart.data = thumbnailData;
    topThumnbnailChart.updateVis();

    // top total good chart
    let topGoodData = [];
    for (let key in data) {
        if (key === "columns") break
        var currentData = data[key];
        let tagFlag = false;
        currentData["tags"].split('/').forEach(tag => { if (negativeTag.includes(tag)) tagFlag = true; })
        if (tagFlag) continue;
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
    topGoodBarChart.data = topGoodData;
    topGoodBarChart.updateVis();

    // top tags in ranking
    let tagData = {};
    for (let key in data) {
        if (key === "columns") break
        var currentData = data[key];
        var tags = currentData["tags"].split('/');
        tags.forEach(function (element) {
            if (negativeTag.includes(element)) return;
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
    topTagsBarChart.data = topTagsData;
    topTagsBarChart.updateVis();
}