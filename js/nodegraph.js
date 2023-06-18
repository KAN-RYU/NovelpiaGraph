// Code from 
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/force-directed-graph
function ForceGraph(
    { nodes,
        edges },

    nodeID = d => d.id,
    nodeTitle = d => d.title,
    nodeMainTag = d => d.mainTag,
    nodeFill = "currentColor",
    nodeStroke = "#fff",
    nodeStrokeWidth = 1.5,
    nodeStrokeOpacity = 1,
    nodeRadius = 5,
    nodeStrength,

    nodeMainTags = undefined,

    edgeSource = d => d.source,
    edgeDest = d => d.dest,
    edgeStroke = "#999",
    edgeStrokeOpacity = "0.8",
    edgeStrokeWidth = d => Math.sqrt(d.strength),
    edgeStrokeLineCap = "round",
    edgeStrength,

    colors = d3.schemeTableau10,
    width = 300,
    height = 400,
    invalidation
) {
    const N = d3.map(nodes, nodeID).map(intern);
    const LS = d3.map(edges, edgeSource).map(intern);
    const LD = d3.map(edges, edgeDest).map(intern);
    const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const Tags = d3.map(nodes, d => d.tags);
    const G = nodeMainTag == null ? null : d3.map(nodes, nodeMainTag).map(intern);
    const W = typeof edgeStrokeWidth !== "function" ? null : d3.map(edges, edgeStrokeWidth);
    const L = typeof edgeStroke !== "function" ? null : d3.map(edges, edgeStroke);

    nodes = d3.map(nodes, (_, i) => ({ id: N[i] }));
    edges = d3.map(edges, (_, i) => ({ source: LS[i], target: LD[i] }));

    if (G && nodeMainTags === undefined) nodeMainTags = d3.sort(G);

    const color = nodeMainTag == null ? null : d3.scaleOrdinal(nodeMainTags, colors);

    const forceNode = d3.forceManyBody();
    const forceEdge = d3.forceLink(edges).id(d => {
        return N[d.index];
    });
    if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
    if (edgeStrength !== undefined) forceEdge.strength(edgeStrength);

    const simulation = d3.forceSimulation(nodes)
        .force("link", forceEdge)
        .force("charge", forceNode)
        .force("center", d3.forceCenter())
        .on("tick", ticked);

    const svg = d3.select("#nodeGraph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const link = svg.append("g")
        .attr("stroke", typeof edgeStroke !== "function" ? edgeStroke : null)
        .attr("stroke-opacity", edgeStrokeOpacity)
        .attr("stroke-width", typeof edgeStrokeWidth !== "function" ? edgeStrokeWidth : null)
        .attr("stroke-linecap", edgeStrokeLineCap)
        .selectAll("line")
        .data(edges)
        .join("line");

    const node = svg.append("g")
        .attr("fill", nodeFill)
        .attr("stroke", nodeStroke)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-width", nodeStrokeWidth)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", nodeRadius)
        .call(drag(simulation));

    if (W) link.attr("stroke-width", ({ index: i }) => W[i]);
    if (L) link.attr("stroke", ({ index: i }) => L[i]);
    if (G) node.attr("fill", ({ index: i }) => color(G[i]));
    if (T) {
        node.append("title").text(({ index: i }) => T[i]);
        node.on('mouseenter', (event, d) => {
            selectedNovel = N[d.index];
            selectedTag = Tags[d.index];
            updateSelectionAll();
        })
            .on('mouseleave', (event, d) => {
                selectedNovel = 0;
                selectedTag = [];
                updateSelectionAll();
            })
    }
    if (invalidation != null) invalidation.then(() => simulation.stop());
    // console.log(forceEdge)

    function intern(value) {
        return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    function ticked() {
        // return;
        link
            .attr("x1", d => {
                return d.source.x;
            })
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
    return Object.assign(svg.node(), { scales: { color } });
}