class CountryhealthVis {
    constructor(parentElement, expData, insData, emplData, immuData, hospData, geoData, covidData, population) {
        this.parentElement = parentElement;
        this.expData = expData;
        this.insData = insData;
        this.emplData = emplData;
        this.immuData = immuData;
        this.hospData = hospData;
        this.geoData = geoData;
        this.covidData = covidData;
        this.population = population;

        // displayData: contains all the data
        this.displayData = {};
        // recentData: contains the most recent value in the OECD Data
        this.recentData = [];
        // coronaData: contains the coronaData
        this.coronaData = {};
        // popData: contains data on country's populations
        this.popData = {};

        this.countryList = [];
        this.calculations = {
            "employment": {
                "minimum": 1000,
                "maximum": 0
            },
            "expenditure": {
                "minimum": 100,
                "maximum": 0
            },
            "insurance": {
                "minimum": 100,
                "maximum": 0
            },
            "immunization": {
                "minimum": 100,
                "maximum": 0
            },
            "hospital":{
                "minimum": 1000,
                "maximum": 0
            }
        };

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

        // add employment Data
        for (let i = 0; i < vis.emplData.length; i++){
            if (vis.emplData[i]["Country"] in vis.displayData){
                vis.displayData[vis.emplData[i]["Country"]]["employment"][vis.emplData[i]["Year"]] = parseInt(vis.emplData[i]["Value"]);
            }
            else {
                vis.countryList.push(vis.emplData[i]["Country"]);
                vis.displayData[vis.emplData[i]["Country"]] = {
                    "employment": {},
                    "expenditure": {},
                    "insurance": {},
                    "immunization": {},
                    "hospital": {}
                };
                vis.displayData[vis.emplData[i]["Country"]]["employment"][vis.emplData[i]["Year"]] = parseFloat(vis.emplData[i]["Value"]);
            }
        };

        // add expenditure Data
        for (let i = 0; i < vis.expData.length; i++){
            if (vis.expData[i]["Country"] in vis.displayData){
                vis.displayData[vis.expData[i]["Country"]]["expenditure"][vis.expData[i]["Year"]] = parseFloat(vis.expData[i]["Value"]);
            }
        }

        // add hospital Data
        for (let i = 0; i < vis.hospData.length; i++){
            if (vis.hospData[i]["Country"] in vis.displayData){
                vis.displayData[vis.hospData[i]["Country"]]["hospital"][vis.hospData[i]["Year"]] = parseFloat(vis.hospData[i]["Value"]);
            }
        }

        // add immunization Data
        for (let i = 0; i < vis.immuData.length; i++){
            if (vis.immuData[i]["Country"] in vis.displayData){
                vis.displayData[vis.immuData[i]["Country"]]["immunization"][vis.immuData[i]["Year"]] = parseFloat(vis.immuData[i]["Value"]);
            }
        }

        // add insurance Data
        for (let i = 0; i < vis.insData.length; i++){
            if (vis.insData[i]["Country"] in vis.displayData){
                vis.displayData[vis.insData[i]["Country"]]["insurance"][vis.insData[i]["Year"]] = parseFloat(vis.insData[i]["Value"]);
            }
        }

        // populate recent data array
        for (let i = 0; i < vis.countryList.length; i++){
            let country = vis.countryList[i];
            let cur_dict = {"Country": country};
            let year = 2019;
            while (true){
                if (year.toString() in vis.displayData[country]["employment"]){
                    cur_dict["employment"] = vis.displayData[country]["employment"][year.toString()];
                    break;
                }
                year -= 1;
            }
            year = 2019;
            while (true){
                if (year.toString() in vis.displayData[country]["insurance"]){
                    cur_dict["insurance"] = vis.displayData[country]["insurance"][year.toString()];
                    break;
                }
                if (year < 2000){
                    cur_dict["insurance"] = null;
                    break;
                }
                year -= 1;
            }
            year = 2019;
            while (true){
                if (year.toString() in vis.displayData[country]["expenditure"]){
                    cur_dict["expenditure"] = vis.displayData[country]["expenditure"][year.toString()];
                    break;
                }
                year -= 1;
            }
            year = 2019;
            while (true){
                if (year.toString() in vis.displayData[country]["hospital"]){
                    cur_dict["hospital"] = vis.displayData[country]["hospital"][year.toString()];
                    break;
                }
                if (year < 2000){
                    cur_dict["hospital"] = null;
                    break;
                }
                year -= 1;
            }
            year = 2019;
            while (true){
                if (year.toString() in vis.displayData[country]["immunization"]){
                    cur_dict["immunization"] = vis.displayData[country]["immunization"][year.toString()];
                    break;
                }
                year -= 1;
            }
            vis.recentData.push(cur_dict);
        }

        // populate calculations array
        for (let i = 0; i < vis.recentData.length; i++) {
            vis.calculations["employment"]["minimum"] = Math.min(vis.calculations["employment"]["minimum"], vis.recentData[i]["employment"]);
            vis.calculations["employment"]["maximum"] = Math.max(vis.calculations["employment"]["maximum"], vis.recentData[i]["employment"]);

            if (vis.recentData[i]["insurance"] != null) {
                vis.calculations["insurance"]["minimum"] = Math.min(vis.calculations["insurance"]["minimum"], vis.recentData[i]["insurance"]);
                vis.calculations["insurance"]["maximum"] = Math.max(vis.calculations["insurance"]["maximum"], vis.recentData[i]["insurance"]);
            }
            vis.calculations["expenditure"]["minimum"] = Math.min(vis.calculations["expenditure"]["minimum"], vis.recentData[i]["expenditure"]);
            vis.calculations["expenditure"]["maximum"] = Math.max(vis.calculations["expenditure"]["maximum"], vis.recentData[i]["expenditure"]);
            vis.calculations["immunization"]["minimum"] = Math.min(vis.calculations["immunization"]["minimum"], vis.recentData[i]["immunization"]);
            vis.calculations["immunization"]["maximum"] = Math.max(vis.calculations["immunization"]["maximum"], vis.recentData[i]["immunization"]);

            if (vis.recentData[i]["hospital"] != null) {
                vis.calculations["hospital"]["minimum"] = Math.min(vis.calculations["hospital"]["minimum"], vis.recentData[i]["hospital"]);
                vis.calculations["hospital"]["maximum"] = Math.max(vis.calculations["hospital"]["maximum"], vis.recentData[i]["hospital"]);
            }
        }

        // impute missing data
        let vars = ["immunization", "hospital", "employment", "expenditure", "insurance"];
        for (let i = 0; i < vis.recentData.length; i+=1) {
            for (let j = 0; j < vars.length; j++) {
                if (vis.recentData[i][vars[j]] == null) {
                    vis.recentData[i][vars[j]] = (vis.calculations[vars[j]]["minimum"] + vis.calculations[vars[j]]["maximum"]) / 2
                }
            }
        }

        for (let i = 0; i < vis.population.length; i+=1){
            vis.popData[vis.population[i]["Country"]] = parseInt(vis.population[i]["Population"]);
        }

        function checkVal(elt) {
            if (elt == ""){
                return 0;
            }
            else {
                return parseInt(elt);
            }
        }

        for (let i = 0; i < vis.covidData.length; i+=8) {
            if (vis.countryList.includes(vis.covidData[i]["location"])) {
                if (!(vis.covidData[i]["location"] in vis.coronaData)){
                    vis.coronaData[vis.covidData[i]["location"]] = {};
                }
                vis.coronaData[vis.covidData[i]["location"]][vis.covidData[i]["date"]] = checkVal(vis.covidData[i]["total_cases"]) * 100 / parseInt(vis.popData[vis.covidData[i]["location"]]);
            }
        }
        vis.wrangleData();


    }

    wrangleData(){
        let vis = this;
        let govIns = document.getElementById("govIns").value;
        let healthExp = document.getElementById("healthExp").value;
        //let immu = document.getElementById("immu").value;
        let hosp = document.getElementById("hosp").value;
        let empl = document.getElementById("empl").value;

        vis.min_distance = 1000;
        vis.country = "";

        for (let i = 0; i < vis.recentData.length; i++){
            let dist = 0.0;
            dist += Math.abs(govIns - vis.recentData[i]["insurance"]) / (vis.calculations["insurance"]["maximum"] - vis.calculations["insurance"]["minimum"]);
            dist += Math.abs(healthExp - vis.recentData[i]["expenditure"]) / (vis.calculations["expenditure"]["maximum"] - vis.calculations["expenditure"]["minimum"]);
            //dist += Math.abs(immu - vis.recentData[i]["immunization"]) / (vis.calculations["immunization"]["maximum"] - vis.calculations["immunization"]["minimum"]);
            dist += Math.abs(hosp - vis.recentData[i]["hospital"]) / (vis.calculations["hospital"]["maximum"] - vis.calculations["hospital"]["minimum"]);
            dist += Math.abs(empl - vis.recentData[i]["employment"]) / (vis.calculations["employment"]["maximum"] - vis.calculations["employment"]["minimum"]);

            if (dist < vis.min_distance){
                vis.min_distance = dist;
                vis.country = vis.recentData[i]["Country"];
            }
        }
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        let currentData = vis.coronaData[vis.country];
        let currentDataCleaned = [];
        let usData = vis.coronaData["United States"];
        let usDataCleaned = [];

        let parseTime = d3.timeParse("%m/%d/%y");

        for (let key in currentData){
            currentDataCleaned.push({
                "DATE": parseTime(key),
                "INFECTED": parseFloat(currentData[key])
            });
        };

        for (let key in usData){
            usDataCleaned.push({
                "DATE": parseTime(key),
                "INFECTED": parseFloat(usData[key])
            });
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
            .text("United States")
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
            .text(vis.country)
            .style("font-size", "13px");

        let scaleYear = d3.scaleTime()
            .range([vis.margin.left, (vis.width-vis.margin.right)])
            .domain([usDataCleaned[0]["DATE"], currentDataCleaned[currentDataCleaned.length - 1]["DATE"]]);

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

        lineGraph.exit().remove();
        lineGraph_us.exit().remove();
        vis.curCountryLabel.exit().remove();

        let cur_dict = {};
        let us_dict = {};
        for (let i = 0; i < vis.recentData.length; i++){
            if (vis.recentData[i]["Country"] == vis.country){
                cur_dict = vis.recentData[i];
            }
            if (vis.recentData[i]["Country"] == "United States"){
                us_dict = vis.recentData[i];
            }
        }

        let data = document.getElementById("country-data");
        data.innerHTML = "";
        data.innerHTML += "<h6>The attributes you've selected most closely matches <emph style='font-weight:bolder'>" + vis.country + "</emph>.</h6>";
        data.innerHTML += "<hr>";
        let table_data = "<table>";
        table_data += "<tr>";
        table_data += "<th></th>";
        table_data += "<th>" + vis.country + "</th>";
        table_data += "<th>" + "United States" + "</th>";
        table_data += "</tr>";
        table_data += "<tr>";
        table_data += "<td class='tablecol'> % GDP Expenditure on Health </td>";
        table_data += "<td>" + cur_dict["expenditure"] + "% </td>";
        table_data += "<td>" + us_dict["expenditure"] + "% </td>";
        table_data += "</tr>";
        table_data += "<tr>";
        table_data += "<td class='tablecol'> % Population with Government Insurance </td>";
        table_data += "<td>" + cur_dict["insurance"] + "% </td>";
        table_data += "<td>" + us_dict["insurance"] + "% </td>";
        table_data += "</tr>";
        table_data += "<tr>";
        table_data += "<td class='tablecol'> # of Hospitals per 1000 Population: </td>";
        table_data += "<td>" + cur_dict["hospital"] + "</td>";
        table_data += "<td>" + us_dict["hospital"] + "</td>";
        table_data += "</tr>";
        table_data += "<tr>";
        table_data += "<td class='tablecol'> Health and Social Employment per 1000 Population: </td>";
        table_data += "<td>" + cur_dict["employment"] + "</td>";
        table_data += "<td>" + us_dict["employment"] + "</td>";
        table_data += "</tr>";
        table_data += "</table>";
        data.innerHTML += table_data;
    }


}