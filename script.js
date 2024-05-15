console.log("D3 version: " + d3.version);

d3.json("custom.geo.json").then(function(geojsonData) {
    geojsonData.features.forEach(function(feature) {
        console.log(feature.properties.name);  
    });
});

const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, 100]); 

function drawLegend(svg, colorScale) {
    const legendWidth = 600; 
    const legendHeight = 20;
    const legendMargin = {top: 100, right: 20, bottom: 100, left: 40}; 

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${legendMargin.left}, ${svg.attr("height") - legendHeight - legendMargin.bottom})`);


    legend.append("text")
        .attr("class", "legend-title")
        .attr("x", legendWidth / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .text("Internet Usage");

    const gradient = legend.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    colorScale.domain([0, 100]).ticks().forEach((value, index, array) => {
        gradient.append("stop")
            .attr("offset", `${(index / array.length * 100)}%`)
            .attr("stop-color", colorScale(value));
    });

    legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#gradient)");

    legend.append("text")
    .attr("x", 0)
    .attr("y", legendHeight + 20)
    .text("Less Usage(0%)");

    legend.append("text")
        .attr("x", legendWidth)
        .attr("y", legendHeight + 20)
        .style("text-anchor", "end")
        .text("More Usage(100%)");}

        
    
    
Promise.all([
    d3.json("custom.geo.json"),
    d3.csv("Percentage.csv")
]).then(function (files) {
    let geojsonData = files[0];
    let percentageData = files[1];

    let percentageMap = {};
    percentageData.forEach(function (d) {
        percentageMap[d.Country] = d.Percentage;
    });

    geojsonData.features.forEach(function (feature) {
        feature.properties.percentage = percentageMap[feature.properties.name] || 'No data';
    });

    drawMap(geojsonData);
}).catch(function (error) {
    console.log("Error loading data: ", error);
});

function drawMap(geojsonData) {
    const svg = d3.select("#map").append("svg")
        .attr("width", 960)
        .attr("height", 600);
    
    const projection = d3.geoNaturalEarth1();
    const pathGenerator = d3.geoPath().projection(projection);

    svg.selectAll("path")
        .data(geojsonData.features)
        .enter().append("path")
            .attr("d", pathGenerator)
            .attr("class", "country")
            .style("fill", function(d) {
                return colorScale(d.properties.percentage);
})
            .on("mouseover", function(event, d) {
                d3.select(this).attr("class", "highlight");
                d3.select("#tooltip")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px")
                    .style("opacity", 1)
                    .html(`Country: ${d.properties.name}<br>Percentage: ${d.properties.percentage}`);
    drawLegend(svg, colorScale);

            })
            .on("mouseout", function() {
                d3.select(this).attr("class", "country");
                // Hide tooltip
                d3.select("#tooltip")
                    .style("opacity", 0);
            });
}

