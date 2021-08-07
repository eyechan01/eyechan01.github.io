class CountrygovVis {
    constructor(parentElement, expData, insData, emplData, immuData, hospData, geoData, covidData, population, policy) {
        this.parentElement = parentElement;
        this.expData = expData;
        this.insData = insData;
        this.emplData = emplData;
        this.immuData = immuData;
        this.hospData = hospData;
        this.geoData = geoData;
        this.covidData = covidData;
        this.population = population;
        this.policy = policy;

        // coronaData: contains the coronaData
        this.coronaData = {};
        // popData: contains data on country's populations
        this.popData = {};
        // polData: contains all policy data
        this.polData = [];

        this.countryList = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 25, bottom: 60, left: 40};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).width() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left/2}, ${vis.margin.top})`);

        vis.svg.append('g')
            .attr('class', 'title')
            .append('text')
            .text('% Population Infected with COVID')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        vis.x_axis = vis.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (vis.height - vis.margin.bottom) + ")");

        // Define y axis group
        vis.y_axis = vis.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + vis.margin.left + ",0)");

        vis.curCountryLabel = vis.svg.append("text")
            .attr("class", "countryLabel");

        vis.uslabel = vis.svg.append("text")
            .attr("class", "usLabel");

        vis.x_label = vis.svg.append("text")
            .attr("class", "axis-label");

        vis.y_label = vis.svg.append("text")
            .attr("class", "axis-label");

        for (let i = 0; i < vis.population.length; i+=1){
            vis.popData[vis.population[i]["Country"]] = parseInt(vis.population[i]["Population"]);
            if (!(vis.population[i]["Country"] in vis.countryList)){
                vis.countryList.push(vis.population[i]["Country"]);
            }
        }

        function checkVal(elt) {
            if (elt == ""){
                return 0;
            }
            else {
                return parseInt(elt);
            }
        }

        for (let i = 0; i < vis.covidData.length; i+=1) {
            if (vis.countryList.includes(vis.covidData[i]["location"])) {
                if (!(vis.covidData[i]["location"] in vis.coronaData)){
                    vis.coronaData[vis.covidData[i]["location"]] = {};
                }
                vis.coronaData[vis.covidData[i]["location"]][vis.covidData[i]["date"]] = checkVal(vis.covidData[i]["total_cases"]) * 100 / parseInt(vis.popData[vis.covidData[i]["location"]]);
            }
        }
        for (let i = 0; i < vis.policy.length; i++){
            vis.polData.push({
                "DATE": vis.policy[i]["date_announced"],
                "Message": vis.policy[i]["description"],
                "Country": vis.policy[i]["country"],
                "Type": vis.policy[i]["type"],
                "Compliance": vis.policy[i]["compliance"]
            });
        };
        vis.country1 = "United States";
        vis.country2 = "United States";
        vis.changeCountry("Germany");
        vis.updateVis();
    }

    changeCountry(country){
        let vis = this;
        if (country != vis.country2){
            vis.country1 = vis.country2;
            vis.country2 = country;
            vis.updateVis();
            vis.updateVis();
        }
    }

    updateVis(){
        let vis = this;
        let parseTime = d3.timeParse("%m/%d/%y");
        let currentData = vis.coronaData[vis.country2];
        let currentDataCleaned = [];
        let currentDataPoints = [];
        let usData = vis.coronaData[vis.country1];
        let usDataCleaned = [];
        let usDataPoints = [];

        let idx = 0;
        for (let key in currentData){
            let message = [];
            let compliance = [];
            for (let i = 0; i < vis.polData.length; i++){
                if (vis.polData[i]["DATE"] == key && vis.polData[i]["Country"].trim() == vis.country2.trim()){
                    message.push(vis.polData[i]["Message"]);
                    compliance.push(vis.polData[i]["Compliance"]);
                }
            }
            if (idx % 5 == 0) {
                currentDataCleaned.push({
                    "DATE": parseTime(key),
                    "INFECTED": parseFloat(currentData[key])
                });
            }
            if (message.length > 0){
                currentDataPoints.push({
                    "DATE": parseTime(key),
                    "INFECTED": parseFloat(currentData[key]),
                    "MESSAGE": message,
                    "COMPLIANCE": compliance
                })
            }
            idx += 1;
        };
        idx = 0;
        for (let key in usData){
            let message = [];
            let compliance = [];
            for (let i = 0; i < vis.polData.length; i++){
                if (vis.polData[i]["DATE"] == key && vis.polData[i]["Country"].trim() == vis.country1.trim()){
                    message.push(vis.polData[i]["Message"]);
                    compliance.push(vis.polData[i]["Compliance"]);
                }
            }
            if (idx % 10 == 0) {
                usDataCleaned.push({
                    "DATE": parseTime(key),
                    "INFECTED": parseFloat(usData[key])
                });
            }
            if (message.length > 0){
                usDataPoints.push({
                    "DATE": parseTime(key),
                    "INFECTED": parseFloat(usData[key]),
                    "MESSAGE": message,
                    "COMPLIANCE": compliance
                })
            }
            idx += 1;
        };

        vis.svg.append("rect")
            .attr("x", vis.width/4)
            .attr("y", vis.margin.top + 15)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "dodgerblue");

        vis.uslabel
            .merge(vis.uslabel)
            .attr("x", vis.width/4 + 25)
            .attr("y", vis.margin.top + 30)
            .text(vis.country1)
            .style("font-size", "13px");

        vis.svg.append("rect")
            .attr("x", vis.width * 2/3)
            .attr("y", vis.margin.top + 15)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", "#ff6161");

        vis.curCountryLabel
            .merge(vis.curCountryLabel)
            .attr("x", vis.width * 2/3 + 25)
            .attr("y", vis.margin.top + 30)
            .text(vis.country2)
            .style("font-size", "13px");

        let scaleYear = d3.scaleTime()
            .range([vis.margin.left, (vis.width-vis.margin.right)])
            .domain([Math.min(usDataCleaned[0]["DATE"], currentDataCleaned[0]["DATE"]), currentDataCleaned[currentDataCleaned.length - 1]["DATE"]]);

        vis.x_axis
            .transition()
            .duration(800)
            .call(d3.axisBottom(scaleYear))
            .selectAll("text")
            .attr('transform', 'rotate(-25)translate(0, 5)');

        vis.y_label
            .attr('transform', 'translate(10, 20)')
            .text("%");

        vis.x_label
            .attr('transform', 'translate('+ (vis.width - 25)/2 + ',' + (vis.height - 15) + ')')
            .text("Month")
            .style('font-size', '14px');

        // y axis scale
        let scaleY = d3.scaleLinear()
            .domain([usDataCleaned[0]["INFECTED"], Math.max(usDataCleaned[usDataCleaned.length - 1]["INFECTED"], currentDataCleaned[currentDataCleaned.length - 1]["INFECTED"])])
            .range([vis.height-vis.margin.bottom, vis.margin.top]);

        vis.y_axis
            .transition()
            .duration(800)
            .call(d3.axisLeft(scaleY).tickFormat(function(d) { return d + "%"}));

        // Define line graph path
        let line = d3.line()
            .x(function(d) { return scaleYear(d.DATE); })
            .y(function(d) { return scaleY(d.INFECTED); });

        let lineGraph_us = vis.svg.selectAll(".line-chart-us")
            .data(usDataCleaned);

        lineGraph_us.enter()
            .append("path")
            .merge(lineGraph_us)
            .transition()
            .duration(400)
            .attr("class", "line-chart-us")
            .attr("d", line(usDataCleaned))
            .attr("stroke", "dodgerblue")
            .attr("stroke-width", 1.5)
            .attr("fill", "none")
            .style("opacity", 1.0);

        let lineGraph = vis.svg.selectAll(".line-chart")
            .data(currentDataCleaned);

        lineGraph.enter()
            .append("path")
            .merge(lineGraph)
            .transition()
            .duration(400)
            .attr("class", "line-chart")
            .attr("d", line(currentDataCleaned))
            .attr("stroke", "#ff6161")
            .attr("stroke-width", 1.5)
            .attr("fill", "none")
            .style("opacity", 1.0);

        // On mouseover, call the tooltip elements and make them visible with correct info
        function mouseover(event, d) {
            document.getElementById("gov-tooltip").innerHTML = d.MESSAGE[0];
        }

        // On mouseout, hide the tooltip elements
        function mouseout() {
            let str = "Hover over a dot to see the particular policy.";
            document.getElementById("gov-tooltip").innerHTML = str;
        }

        let dataPointsUS = vis.svg.selectAll(".dots")
            .data(usDataPoints);

        dataPointsUS
            .enter()
            .append("circle")
            .attr("class", "dots")
            .merge(dataPointsUS)
            .transition()
            .duration(800)
            .attr("cx", d => scaleYear(d.DATE))
            .attr("cy", d => scaleY(d.INFECTED))
            .attr("r", 3)
            .attr("fill", "blue");

        dataPointsUS.on("mouseover", function(event, d){mouseover(event, d)})
            .on("mouseout", function(){mouseout()});

        // Define the circles on the line graph path
        let dataPointsCur = vis.svg.selectAll(".dots_cur")
            .data(currentDataPoints);

        dataPointsCur
            .enter()
            .append("circle")
            .attr("class", "dots_cur")
            .merge(dataPointsCur)
            .transition()
            .duration(800)
            .attr("cx", d => scaleYear(d.DATE))
            .attr("cy", d => scaleY(d.INFECTED))
            .attr("r", 3)
            .attr("fill", "red");

        dataPointsCur.on("mouseover", function(event, d){mouseover(event, d)})
            .on("mouseout", function(){mouseout()});

        lineGraph.exit().remove();
        lineGraph_us.exit().remove();
        vis.curCountryLabel.exit().remove();
        dataPointsCur.exit().remove();
        dataPointsUS.exit().remove();
    }


}