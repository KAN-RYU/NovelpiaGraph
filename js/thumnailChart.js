class ThumbnailChart {
    constructor(_config = {
    }, _data) {
        this.config = {
            parentElement: _config.parentElement,
            width: 600,
            height: 200,
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            imagewWidth: 120,
            imageMargin: 10,
            imageRatio: 20,
            fontSize: 12,

        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        const containerWidth = vis.config.width + vis.config.margin.left + vis.config.margin.right;
        const containerHeight = vis.config.height + vis.config.margin.top + vis.config.margin.bottom;

        // vis.xScale = d3.scaleLinear()
        //     .range([0, vis.config.width]);

        // vis.yScale = d3.scaleBand()
        //     .range([0, vis.config.height])
        //     .padding(0.1);

        // vis.xAxis = d3.axisTop(vis.xScale)
        //     .tickFormat(vis.config.xTickFormat);
        // vis.yAxis = d3.axisLeft(vis.yScale)
        //     .tickFormat(vis.config.yTickFormat);

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', containerWidth)
            .attr('height', containerHeight);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

        // vis.xAixsChartG = vis.chart.append('g')
        //     .attr('class', 'x-axis')

        // vis.yAxisChartG = vis.chart.append('g')
        //     .attr('class', 'y-axis')
    }

    updateVis() {
        let vis = this;

        vis.renderVis();
    }

    updateSelected() {
        let vis = this;
        if (selectedNovel !== 0) {
            vis.images.filter(d => d.novelID !== selectedNovel)
                .attr('opacity', 0.5);
        }
        else {
            vis.images.attr('opacity', 1.0);
        }
    }

    renderVis() {
        let vis = this;

        vis.images = vis.chart.selectAll("image")
            .data(vis.data)
            .enter()
            .append("image")
            .attr("href", d=>d.thumbnailURL)
            .attr("x", (d,i) => i*(vis.config.imagewWidth + vis.config.imageMargin) - i*(i-1)/2*vis.config.imageRatio)
            // .attr("y", d => vis.yScale(d.title))
            .attr("width", (d,i) => vis.config.imagewWidth - i*vis.config.imageRatio)
            .attr("height", (d,i) => (vis.config.imagewWidth - i*vis.config.imageRatio )*1.5);
        
        vis.labels = vis.chart.selectAll(".label")
            .data(vis.data)
            .enter()
            .append("text")
            .text((d,i)=>(i+1)+"위 " + d.title)
            .style('font-size', vis.config.fontSize)
            .attr("x", (d,i) => i*(vis.config.imagewWidth + vis.config.imageMargin) - i*(i-1)/2*vis.config.imageRatio)
            .attr("y", (d,i) => (vis.config.imagewWidth - i*vis.config.imageRatio )*1.5 + vis.config.fontSize)
            .attr("width", (d,i) => vis.config.imagewWidth - i*vis.config.imageRatio)
            .attr("height", (d,i) => (vis.config.imagewWidth - i*vis.config.imageRatio )*1.5);


        vis.images.on('mouseenter', (event, d) => {
            selectedNovel = d.novelID;
            selectedTag = d.tags;
            updateSelectionAll();
        })
            .on('mouseleave', (event, d) => {
                selectedNovel = 0;
                selectedTag = [];
                updateSelectionAll();
            })
    }
}