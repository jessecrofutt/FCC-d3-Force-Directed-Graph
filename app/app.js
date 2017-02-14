var d3 = require('d3');
import _ from 'lodash';
import './style/style.sass';

let url = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';

let svgWidth = 900;
let svgHeight = 500;

let margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

        //canvas is the base on which svg(lines) and div(nodes) are placed
let canvas = d3.select('#app').append('div')
        .attr('id', 'canvas');

        //svg
let svg = canvas.append("svg")
    .attr("id", "svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)

let tooltip = d3.select("body")
    .append("div")
    .attr("class" , "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("no data");

        //page title
svg.append('text')
    .attr("position", "center")
    .attr("y", "30")
    .attr("x", "10")
    .attr('id', 'title')
    .text('Force-Directed Graph of National Contiguity');

d3.json(url, (jsonData) => {

    let nodes = jsonData.nodes;
    let links = jsonData.links;

            //link is an svg that will hold all of the lines
            //lines are svg elements
    let link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
            .attr("stroke", "#4D4D4D")
            .attr("stroke-width", "1");

            //create nodes for flags
            //creating each node as a div to which an image can be placed
            //due to issues when placing images directly on the svg element
    let node = canvas.append("div")
        .attr("id", "flags")
        .selectAll('img')
        .data(nodes)
        .enter().append('img')
            .attr("class",(d) => `absolute flag flag-${d.code}`)
            .on("mouseover", function(d){
                d3.select(this);
                tooltip.style("visibility", "visible")
                    .style("font-size", "0.6em")
                    .style("top", (d3.event.pageY + 10) + "px")
                    .style("left", (d3.event.pageX) + "px")
                    .html(d.country);
            })
            .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
            .on("mouseout", function(){
                d3.select(this);
                tooltip.style("visibility", "hidden");
            })
            .call(d3.drag()
                .on("start", dragStart)
                .on("drag", dragging)
                .on("end", dragEnd))
        ;

            //create a simulation
    let simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).strength(2))
        .force("charge", d3.forceManyBody().strength(-30).distanceMin(20).distanceMax(50))
        .force("center", d3.forceCenter(svgWidth/3, svgHeight/2))  //divide by three to offset flattening in ticked()
        .force('separate', d3.forceCollide(12))
        .on("tick", ticked);


    function ticked() {
        link
                    //multiply by 1.5 to stretch the graph horizontally
            .attr("x1", function(d) { return (d.source.x * 1.5); })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return (d.target.x * 1.5); })
            .attr("y2", function(d) { return d.target.y; });

        node
            .style("top", (d) => `${d.y - (svgHeight + 5)}px`)
            .style("left", (d) => `${d.x * 1.5}px`);

    }

    function dragStart(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragging(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragEnd(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
});


