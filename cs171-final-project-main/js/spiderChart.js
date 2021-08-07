class SpiderChart {
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

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 10};
        vis.width = $("#" + vis.parentElement).width();
        vis.height = $("#" + vis.parentElement).width() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);
    }

    wrangleData(){
        let vis = this;

        vis.displayData = [];

        vis.deathDALY = document.getElementById("deathsDALY").checked;

        if(vis.deathDALY){
            vis.dalyData.forEach(d => {
                if(d.country == targetCountry){
                    vis.displayData.push(d);
                }
            })
        }
        else{
            vis.deathData.forEach(d => {
                if(d.country == targetCountry){
                    vis.displayData.push(d);
                }
            })
        }

        console.log(vis.displayData);

        vis.svg.selectAll("*").remove();

        if(spiderVisible){
            vis.updateVis();
        }
    }

    updateVis(){
        let vis = this;

        // add title
        vis.title = vis.svg.append('g')
            .attr('class', 'title map-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        if(vis.deathDALY){
            vis.title.text( targetCountry +" - DALYs per 100,000 by cause");
        }
        else{
            vis.title.text(targetCountry + " - Deaths per 100,000 by cause");
        }

        vis.ticks = [200,400,600,800,1000];
        if(vis.deathDALY){
            vis.ticks = [4000, 8000, 12000, 16000, 20000];
        }

        vis.radialScale = d3.scaleLinear()
            .domain([0,10])
            .range([0,vis.width/3]);
        vis.radialScalePoints = d3.scaleLinear()
            .domain([0,d3.max(vis.ticks)])
            .range([0,vis.width/3]);

        vis.ticks.forEach(t =>
            vis.svg.append("circle")
                .attr("cx", vis.width/2)
                .attr("cy", vis.width/2)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("r", vis.radialScalePoints(t))
        );

        vis.ticks.forEach(t =>
            vis.svg.append("text")
                .attr("x", vis.width / 2 - 8)
                .attr("y", vis.width / 2 - vis.radialScalePoints(t))
                .text(t.toString())
                .attr("font-size", "8px")
        );

        vis.displayData = vis.displayData.sort(function(a, b){
            if(a.cause < b.cause){
                return -1;
            }
            else if(a.cause > b.cause){
                return 1;
            }
            return 0;
        })

        console.log(vis.displayData)

        for (var i = 0; i < vis.displayData.length; i++) {
            let cause_name = vis.displayData[i].cause;
            if(vis.displayData[i].cause == "HIV/AIDS and sexually transmitted infections"){
                cause_name = "STIs, HIV/AIDS"
            }
            else if(vis.displayData[i].cause == "Skin and subcutaneous diseases"){
                cause_name = "Skin diseases"
            }
            else if(vis.displayData[i].cause == "Self-harm and interpersonal violence"){
                cause_name = "Violence"
            }
            else if(vis.displayData[i].cause == "Other non-communicable diseases"){
                cause_name = "Other NCD"
            }
            else if(vis.displayData[i].cause == "Respiratory infections and tuberculosis"){
                cause_name = "Respiratory Illn."
            }
            else if(vis.displayData[i].cause == "Neglected tropical diseases and malaria"){
                cause_name = "Tropical disease/malaria"
            }
            else if(vis.displayData[i].cause == "Substance use disorders"){
                cause_name = "Substance use"
            }
            else if(vis.displayData[i].cause == "Sense organ diseases"){
                cause_name = "Sense organ dis."
            }
            else if(vis.displayData[i].cause == "Maternal and neonatal disorders"){
                cause_name = "Neonatal disorders        "
            }
            let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.displayData.length);
            let line_coordinate = vis.angleToCoordinate(angle, 10);
            let label_coordinate = vis.angleToCoordinateText(angle, 10.6, i);

            //draw axis line
            vis.svg.append("line")
                .attr("x1", vis.width / 2)
                .attr("y1", vis.width / 2)
                .attr("x2", line_coordinate.x)
                .attr("y2", line_coordinate.y)
                .attr("stroke","black");

            //draw axis label
            vis.svg.append("text")
                .attr("x", label_coordinate.x)
                .attr("y", label_coordinate.y)
                .attr("font-size", 8.2)
                .text(cause_name);
        }

        vis.line = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        vis.coordinates = vis.getPathCoordinates(vis.displayData);

        console.log(vis.coordinates);

        vis.svg.append("path")
            .datum(vis.coordinates)
            .attr("d",vis.line)
            .attr("stroke-width", 3)
            .attr("stroke", "darkorange")
            .attr("fill", "darkorange")
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.5);

    }

    angleToCoordinate(angle, value){
        let vis = this;
        let x = Math.cos(angle) * vis.radialScale(value);
        let y = Math.sin(angle) * vis.radialScale(value);
        return {"x": vis.width / 2 + x, "y": vis.width / 2 - y};
    }

    angleToCoordinateText(angle, value, number){
        let vis = this;
        let x = Math.cos(angle) * vis.radialScale(value);
        let y = Math.sin(angle) * vis.radialScale(value);
        console.log(x)
        if(number == 10){
            x -= 20;
        }
        else if(number == 1){
            x -= 90;
        }
        else if(number == 2){
            x -= 105;
        }
        else if(number == 8){
            x -= 100;
        }
        else if(number == 5){
            x -= 50;
        }
        else if(number == 9){
            x -= 90
        }
        else if(number > 2 && number < 10){
            x -= 65;
        }
        else if(number == 15){
            x -= 5;
        }
        return {"x": vis.width / 2 + x, "y": vis.width / 2 - y};
    }

    angleToCoordinatePoints(angle, value){
        let vis = this;
        let x = Math.cos(angle) * vis.radialScalePoints(value);
        let y = Math.sin(angle) * vis.radialScalePoints(value);
        return {"x": vis.width / 2 + x, "y": vis.width / 2 - y};
    }

    getPathCoordinates(data_point){
        let vis = this;
        let coordinates = [];
        for(var i = 0; i < data_point.length; i++) {
            let angle = (Math.PI / 2) + (2 * Math.PI * i / data_point.length);
            if(vis.deathDALY){
                coordinates.push(vis.angleToCoordinatePoints(angle, data_point[i].DALYs_per_100K));
            }
            else{
                coordinates.push(vis.angleToCoordinatePoints(angle, data_point[i].deaths_per_100K));
            }
        }
        return coordinates;
    }

    textSize(text) {
        if (!d3) return;
        var container = d3.select('body').append('svg');
        container.append('text').text(text);
        var size = container.node().getBBox();
        container.remove();
        return { width: size.width, height: size.height };
    }
}