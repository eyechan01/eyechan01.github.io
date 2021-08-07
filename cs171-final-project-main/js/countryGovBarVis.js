class CountrygovbarVis {
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

        vis.margin = {top: 20, right: 25, bottom: 30, left: 30};
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
            .text('Policy Compliance Requirements')
            .attr('transform', `translate(${vis.width / 2 + 15}, 20)`)
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
        }
    }

    updateVis(){
        let vis = this;
        let currentData = vis.coronaData[vis.country2];
        let data = [{
            "category": "Mandatory",
            "values": [
                {
                    "country": vis.country1,
                    "value": 0
                },
                {
                    "country": vis.country2,
                    "value": 0
                }
            ]
        }, {
            "category": "Voluntary",
            "values": [
                {
                    "country": vis.country1,
                    "value": 0
                },
                {
                    "country": vis.country2,
                    "value": 0
                }
            ]
        },
        {
            "category": "NA",
            "values": [
                {
                    "country": vis.country1,
                    "value": 0
                },
                {
                    "country": vis.country2,
                    "value": 0
                }
            ]
        }];
        let usData = vis.coronaData[vis.country1];

        for (let key in currentData){
            let compliance = [];
            for (let i = 0; i < vis.polData.length; i++){
                if (vis.polData[i]["DATE"] == key && vis.polData[i]["Country"].trim() == vis.country2.trim()){
                    compliance.push(vis.polData[i]["Compliance"]);
                }
            }
            for (let i = 0; i < compliance.length; i++){
                if (compliance[i] == "Mandatory"){
                    data[0]["values"][1]["value"] += 1;
                }
                else if (compliance[i] == "Voluntary"){
                    data[1]["values"][1]["value"] += 1;
                }
                else {
                    data[2]["values"][1]["value"] += 1;
                }
            }
        };
        for (let key in usData){
            let compliance = [];
            for (let i = 0; i < vis.polData.length; i++){
                if (vis.polData[i]["DATE"] == key && vis.polData[i]["Country"].trim() == vis.country1.trim()){
                    compliance.push(vis.polData[i]["Compliance"]);
                }
            }
            for (let i = 0; i < compliance.length; i++){
                if (compliance[i] == "Mandatory"){
                    data[0]["values"][0]["value"] += 1;
                }
                else if (compliance[i] == "Voluntary"){
                    data[1]["values"][0]["value"] += 1;
                }
                else {
                    data[2]["values"][0]["value"] += 1;
                }
            }
        };

        console.log(data);

        let categoryNames = data.map(function(d) { return d.category; });
        let rateNames = data[0].values.map(function(d) { return d.country; });

        let x0 = d3.scaleBand()
            .domain(categoryNames)
            .range([vis.margin.left, vis.width - vis.margin.right])
            .padding(0.3);

        let x1 = d3.scaleBand()
            .domain(rateNames).range([0, x0.bandwidth()]);

        let color = d3.scaleOrdinal()
            .domain(rateNames)
            .range(["dodgerblue", "#ff6161"]);

        vis.x_axis
            .transition()
            .duration(800)
            .call(d3.axisBottom(x0))
            .selectAll("text")
            .attr('transform', 'translate(0, 5)');

        vis.y_label
            .attr('transform', 'translate(5, 15)')
            .text("#")
            .style("font-size", "12px");

        // y axis scale
        let scaleY = d3.scaleLinear()
            .domain([0, Math.max(data[0].values[0].value, data[0].values[1].value, data[1].values[0].value, data[1].values[1].value, data[2].values[0].value, data[2].values[1].value) + 10])
            .range([vis.height-vis.margin.bottom, vis.margin.top]);

        vis.y_axis
            .transition()
            .duration(800)
            .call(d3.axisLeft(scaleY).tickFormat(function(d) { return d}));

        vis.sliceBlue = vis.svg.selectAll(".sliceBlue")
            .data(data)

        vis.sliceBlue
            .enter()
            .append("rect")
            .attr("class", "sliceBlue")
            .merge(vis.sliceBlue)
            .transition()
            .duration(1000)
            .attr("width", x1.bandwidth())
            .attr("x", function(d) { return x1(d.values[0].country) + x0(d.category)})
            .style("fill", function(d) { return color(d.values[0].country) })
            .attr("y", function(d) { return scaleY(d.values[0].value); })
            .attr("height", function(d) { return vis.height - scaleY(d.values[0].value) - vis.margin.bottom; })

        vis.sliceRed = vis.svg.selectAll(".sliceRed")
            .data(data)

        vis.sliceRed
            .enter()
            .append("rect")
            .attr("class", "sliceRed")
            .merge(vis.sliceRed)
            .transition()
            .duration(1000)
            .attr("width", x1.bandwidth())
            .attr("x", function(d) { return x1(d.values[1].country) + x0(d.category)})
            .style("fill", function(d) { return color(d.values[1].country) })
            .attr("y", function(d) { return scaleY(d.values[1].value); })
            .attr("height", function(d) { return vis.height - scaleY(d.values[1].value) - vis.margin.bottom; })

        vis.sliceBlue.exit().remove()
        vis.sliceRed.exit().remove()

/*      let slice = vis.svg.selectAll(".slice")
            .data(data)
            .enter()
            .append("g")
            .attr("transform",function(d) { return "translate(" + x0(d.category) + ",0)"; });

        slice
            .selectAll("rect")
            .data(function(d) { return d.values; })
            .enter()
            .append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", function(d) { return x1(d.country); })
            .style("fill", function(d) { return color(d.country) })
            .attr("y", function(d) { return scaleY(0); })
            .attr("height", function(d) { return vis.height - scaleY(0) - vis.margin.bottom; })

        slice.selectAll("rect")
            .merge(slice)
            .transition()
            .duration(1000)
            .attr("y", function(d) { return scaleY(d.value); })
            .attr("height", function(d) { return vis.height - scaleY(d.value) - vis.margin.bottom; });

        slice.exit().remove();*/
    }


}