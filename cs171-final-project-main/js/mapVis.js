class MapVis {
    constructor(parentElement, geoData, deathData, dalyData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.deathData = deathData;
        this.dalyData = dalyData;
        this.displayData = [];

        this.dalyData.forEach(d => {
            d.DALYs_per_100K = +d.DALYs_per_100K;
        });

        this.deathData.forEach(d => {
            d.deaths_per_100K = +d.deaths_per_100K;
        });

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).width() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.title = vis.svg.append('g')
            .attr('class', 'title map-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        vis.titlePart2 = vis.svg.append('g')
            .attr('class', 'title map-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, 40)`)
            .attr('text-anchor', 'middle');

        vis.projection = d3.geoOrthographic()
            .translate([vis.width / 2, vis.height / 2])
            .scale(vis.width/3)

        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;

        vis.svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("stroke","rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        vis.countries = vis.svg.selectAll(".country")
            .data(vis.world)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path);

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'mapTooltip');

        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.width * 2.8 / 4 - 20}, ${vis.height - 40})`);

        // create defs for legend and create linear gradient
        let defs = vis.legend.append("defs");
        let linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");

        //Horizontal gradient
        linearGradient
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        //Set the color for the start (0%)
        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#ffffff");

        //Set the color for the end (100%)
        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#428A8D");

        // create rectangle for actual legend
        vis.legend
            .append("rect")
            .attr("width", vis.width * 0.2)
            .attr("height", 15)
            .style("fill", "url(#linear-gradient");

        // create scale for axis
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width * 0.2]);

        // create axis for the legend
        vis.axis = vis.svg.append("g")
            .attr('class', 'axis')
            .attr('transform', `translate(${vis.width * 2.8 / 4 - 21}, ${vis.height - 25})`);

        let m0,
            o0;

        vis.svg.call(
            d3.drag()
                .on("start", function (event) {

                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)
                })
        );

        // Scale for country colors
        vis.colorScale = d3.scaleLinear()
            .range(["#ffffff", "#428A8D"]);

        console.log(vis.deathData);
        console.log(vis.dalyData);

       vis.wrangleData()

    }

    wrangleData(){
        let vis = this;

        vis.displayData = [];

        vis.selectedDisease = $('#diseaseSelector').val();
        vis.deathDALY = document.getElementById("deathsDALY").checked;

        if(vis.deathDALY){
            vis.dalyData.forEach(d => {
                if(d.cause == vis.selectedDisease){
                    vis.displayData.push(d);
                }
            })
        }
        else{
            vis.deathData.forEach(d => {
                if(d.cause == vis.selectedDisease){
                    vis.displayData.push(d);
                }
            })
        }

        console.log(vis.displayData);

        vis.updateVis()
    }

    updateVis(){
        let vis = this;

        vis.titleAppend = "Deaths";
        vis.deathOrDALY = "deaths_per_100K"
        let categories = [];
        if (vis.deathDALY){
            vis.titleAppend = "DALYs";
            vis.deathOrDALY = "DALYs_per_100K"
        }
        vis.displayData.forEach( d  => {
            categories.push(d[vis.deathOrDALY]);
        });

        // set axis domain using categories and create axis
        vis.xScale
            .domain([0, d3.max(categories)]);
        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale)
            .tickValues([0, d3.max(categories)]);
        vis.axis
            .call(vis.xAxis);

        vis.colorScale.domain([0, d3.max(categories)]);

        console.log(categories)

        vis.title
            .text(vis.titleAppend + " per 100,000 caused by ");
        vis.titlePart2
            .text(vis.selectedDisease);

        vis.countries
            .data(vis.world)
            .attr("fill", d => {
                if(vis.searchCountryInfo(d.properties.name) == "country not found"){
                    return "lightgrey"
                }
                else{
                    return vis.colorScale(vis.searchCountryInfo(d.properties.name)[vis.deathOrDALY]);
                }
            })

        vis.countries.on('mouseover', function(event, d){
            d3.select(this)
                .attr('stroke-width', '2px')
                .attr("fill", d => "#FFCCCB");

            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px");

            if(vis.searchCountryInfo(d.properties.name) == "country not found"){
                vis.tooltip
                    .html(`
            <div style="border: thin solid grey; border-radius: 5px; background: lemonchiffon; font-family: Montserrat; padding: 20px">
                <h5>${d.properties.name} Data Not Available</h5>                      
            </div>`);
            }
            else{
                spiderVisible = true;
                targetCountry = d.properties.name;
                spiderChart.wrangleData();

                vis.tooltip
                    .html(`
            <div style="border: thin solid grey; border-radius: 5px; background: lemonchiffon; font-family: Montserrat; padding: 20px">
                <h6>Country: ${vis.searchCountryInfo(d.properties.name).country}</h6>
                 ${Math.round(vis.searchCountryInfo(d.properties.name)[vis.deathOrDALY])} ${vis.titleAppend} per 100,000 people                         
            </div>`);
            }
        })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')

                if(vis.searchCountryInfo(d.properties.name) == "country not found"){
                    d3.select(this)
                        .attr("fill", "lightgrey")
                }
                else{
                    d3.select(this)
                        .attr("fill", d => vis.colorScale(vis.searchCountryInfo(d.properties.name)[vis.deathOrDALY]));
                }

                spiderVisible = false;
                spiderChart.wrangleData();

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        console.log(vis.world);
    }

    searchCountryInfo(searchCountry){
        let vis = this;
        for (var elem in vis.displayData){
            if(vis.displayData[elem].country === searchCountry){
                return vis.displayData[elem];
            }
        }
        return "country not found";
    }
}