class BarChartVis {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            width: 400,
            height: 200,
            margin: {top: 50, right: 10, bottom: 10, left: 100}
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        const containerWidth = vis.config.width + vis.config.margin.left + vis.config.margin.right;
        const containerHeight = vis.config.height + vis.config.margin.top + vis.config.margin.bottom;

        vis.xScale = d3.scaleLinear()
            .range([0, vis.config.width]);
        
        vis.yScale = d3.scaleBand()
            .range([0, vis.config.height])
            .padding(0.1);
        
        vis.xAxis = d3.axisTop(vis.xScale)
                        .tickFormat(d => d/1000000+'M');
        vis.yAxis = d3.axisLeft(vis.yScale)
                        .tickFormat(d => d.slice(0,6) + '...');

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', containerWidth)
            .attr('height', containerHeight);
        
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);
        
        vis.xAixsChartG = vis.chart.append('g')
            .attr('class', 'x-axis')
            // .attr('transform', `translate(0, ${height})`)

        vis.yAxisChartG = vis.chart.append('g')
            .attr('class', 'y-axis')
    }

    updateVis() {
        let vis = this;

        vis.xScale.domain([0, vis.data[0].view])
            .nice();

        vis.yScale.domain(vis.data.map(d => d.title));

        vis.renderVis();
    }

    updateSelected() {
        let vis = this;
        if (selectedNovel === 0) {
            vis.bars.attr('opacity', 1.0);
            
        }
        else {
            vis.bars.filter(d => d.novelID !== selectedNovel)
                    .attr('opacity', 0.5);
        }
    }

    renderVis() {
        let vis = this;

        vis.bars = vis.chart.selectAll("myRect")
            .data(vis.data)
            .enter()
            .append("rect")
            .attr("x", vis.xScale(0) )
            .attr("y", d => vis.yScale(d.title))
            .attr("width", d => vis.xScale(d.view))
            .attr("height", vis.yScale.bandwidth() )
            .attr("fill", "#69b3a2")
        
        vis.bars.on('mouseenter', (event, d) => {
                selectedNovel = d.novelID;
                vis.updateSelected();
            })
            .on('mouseleave', (event, d) => {
                selectedNovel = 0;
                vis.updateSelected();
            })

        vis.xAixsChartG.call(vis.xAxis);
        vis.yAxisChartG.call(vis.yAxis);
    }
}