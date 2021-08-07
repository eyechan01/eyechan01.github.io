class ScatterVis{
    constructor(parentElement, hivTreatmentData, tbTreatmentData,
                healthSpendData, hivOutcomeData, tbOutcomeData,
                lifeExpectancyData, hivSelected){
        this.parentElement = parentElement;
        this.hivTreatmentData = hivTreatmentData;
        this.tbTreatmentData = tbTreatmentData;
        this.healthSpendData = healthSpendData;
        this.hivOutcomeData = hivOutcomeData;
        this.tbOutcomeData = tbOutcomeData;
        this.lifeExpectancyData = lifeExpectancyData;
        this.hivSelected = hivSelected;

        this.displayData = [];
        this.displayData2 = [];

        this.defaultCurrent = true

        this.cleanData(this.hivTreatmentData);
        this.cleanData(this.tbTreatmentData);
        this.cleanData(this.healthSpendData);
        this.cleanData(this.hivOutcomeData);
        this.cleanData(this.tbOutcomeData);
        this.cleanData(this.lifeExpectancyData);

        this.makeAverage(this.hivTreatmentData);
        this.makeAverage(this.tbTreatmentData);
        this.makeAverage(this.healthSpendData);
        this.makeAverage(this.hivOutcomeData);
        this.makeAverage(this.tbOutcomeData);
        this.makeAverage(this.lifeExpectancyData);

        this.makePercentages(this.hivTreatmentData);
        this.makePercentages(this.tbTreatmentData);
        this.makePercentages(this.hivOutcomeData);

        this.initVis();

    }

    initVis(){
        let vis = this;

        vis.margin = {top: 60, right: 60, bottom: 40, left: 60};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).width() - vis.margin.top - vis.margin.bottom;

        if(!vis.hivSelected){
            vis.margin.left = 40
        }

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.title = vis.svg.append('g')
            .attr('class', 'title scatter-title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        vis.scaleY = d3.scaleLinear()
            .range([vis.height-vis.margin.bottom, vis.margin.top]);

        vis.scaleX = d3.scaleLinear()
            .range([vis.margin.left, vis.width - vis.margin.right])

        vis.x_axis = vis.svg.append("g")
            .attr("transform", "translate(0," + (vis.height - vis.margin.bottom) + ")");

        vis.y_axis = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + ",0)");

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'scatterTooltip');

        vis.titlePart1 = vis.svg.append("text")
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');
        vis.titlePart2 = vis.svg.append("text")
            .attr('transform', `translate(${vis.width / 2}, 40)`)
            .attr('text-anchor', 'middle');

        vis.labelX = vis.svg.append("text")
            .attr('transform', `translate(${vis.width / 3}, ${vis.height - 10})`);

        vis.labelY = vis.svg.append("text");

        if(vis.hivSelected){
            vis.labelY.attr('transform', `translate(${vis.margin.left/3}, ${2*vis.height/3})
                rotate(270)`);
        }
        else{
            vis.labelY.attr('transform', `translate(${vis.margin.left/5}, ${2*vis.height/3})
                rotate(270)`);
        }

        console.log(vis.hivTreatmentData);

        if(vis.hivSelected){
            vis.timeSVG = d3.select('#sliderRoslingOne')
                .append('svg')
                .attr('width', vis.width)
                .attr('height', vis.height/3)
                .append('g')
                .attr('transform', 'translate(80,30)');
        }
        else{
            vis.timeSVG = d3.select('#sliderRoslingTwo')
                .append('svg')
                .attr('width', vis.width)
                .attr('height', vis.height/3)
                .append('g')
                .attr('transform', 'translate(80,30)');
        }

        if(vis.hivSelected){
            vis.timeSlider = d3.sliderBottom()
                .default(new Date(2004, 10, 3))
        }
        else{
            vis.timeSlider = d3.sliderBottom()
                .default(new Date(1996, 10, 3))
        }

        vis.wrangleData();
    }

    wrangleData(){
        let vis = this;

        vis.selectedTreatment = $('#diseaseTreatment').val();
        vis.selectedTreatmentEffect = $('#diseaseTreatmentEffect').val();

        vis.displayData = [];
        vis.displayData2 = [];

        if(vis.hivSelected){
            vis.hivTreatmentData.forEach(d => {
                vis.displayData.push(d);
            })
            vis.hivOutcomeData.forEach(d => {
                vis.displayData2.push(d);
            })
        }
        else{
            vis.tbTreatmentData.forEach(d => {
                vis.displayData.push(d);
            })
            vis.tbOutcomeData.forEach(d => {
                vis.displayData2.push(d);
            })
        }

        console.log(vis.displayData);

        vis.tenData = [];
        vis.tenData2 = [];

        let tenCountries = ["Eswatini", "Guatemala", "Zimbabwe", "Botswana", "Malawi",
        "Kenya", "Namibia", "Lesotho", "United States"];
        if(!vis.hivSelected){
            tenCountries = ["India", "Lesotho", "Peru", "Rwanda", "Russia", "South Africa",
            "Spain", "United States"]
        }

        vis.yearProps = [];

        vis.displayData.forEach(d => {
            if(tenCountries.includes(d.country)){
                vis.tenData.push(d)
            }
        })

        vis.displayData2.forEach(d => {
            if(tenCountries.includes(d.country)){
                vis.tenData2.push(d)
            }
        })

        vis.tenData.forEach((d1) => {
            d1.averageY = 0;
            d1.yData = {};
            d1.pairedData = {};
            vis.tenData2.forEach((d2) => {
                if(d2.country === d1.country){
                    d1.averageY = d2.average;
                    for(var prop in d2){
                        if(prop in d1) {
                            if(prop != "country" && prop != "average"){
                                vis.yearProps.push(prop)
                            }
                            d1.yData[prop] = d2[prop];
                            d1.pairedData[prop] = [d1[prop], d2[prop]];
                        }
                    }
                }
            })
        })

        vis.yearProps = vis.yearProps.filter(vis.onlyUnique);

        vis.updateVis();
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        let titleAppend = "";
        if(vis.hivSelected){
            vis.titlePart1
                .text("Impact of ART Treatment Coverage on")
            vis.titlePart2
                .text("HIV Prevalence over Time")

            vis.labelX
                .text("ART Treatment Coverage (%)")
                .attr("font-size", vis.width/50);

            vis.labelY
                .text("% of Adults with HIV")
                .attr("font-size", vis.width/50);
        }
        else{
            vis.titlePart1
                .text("Impact of DOTS Coverage on")
            vis.titlePart2
                .text("TB Mortality Rate over Time")

            vis.labelX
                .text("DOTS Coverage (%)")
                .attr("font-size", vis.width/50);

            vis.labelY
                .text("TB Deaths per 100K per year")
                .attr("font-size", vis.width/50);
        }

        console.log(vis.tenData)

        vis.xValsByYear = []
        vis.yValsByYear = []
        vis.tenData.forEach(d => {
            if(!jQuery.isEmptyObject(d.pairedData)){
                vis.yearProps.forEach(year => {
                    vis.xValsByYear.push(d.pairedData[year][0])
                    vis.yValsByYear.push(d.pairedData[year][1])
                })
            }
        })

        console.log(vis.xValsByYear)
        console.log(vis.tenData)

        vis.scaleX
            .domain([0, d3.max(vis.xValsByYear)]);
        vis.x_axis
            .transition()
            .duration(800)
            .call(d3.axisBottom(vis.scaleX))
            .selectAll("text")
            .attr("transform", "rotate(-20)")

        vis.scaleY
            .domain([0, d3.max(vis.yValsByYear)]);
        vis.y_axis
            .transition()
            .duration(800)
            .call(d3.axisLeft(vis.scaleY));

        vis.dataTime = d3.range(0, vis.yearProps.length).map(function(d) {
            return new Date(parseInt(vis.yearProps[0].substring(1,vis.yearProps[0].length)) + d, 10, 3);
        });

        if(vis.defaultCurrent){
            vis.desiredYear = vis.yearProps[0]
            console.log(vis.desiredYear);
        }

        vis.timeSlider
            .min(d3.min(vis.dataTime))
            .max(d3.max(vis.dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(300)
            .tickFormat(d3.timeFormat('%Y'))
            .tickValues(vis.dataTime)
            .on('onchange', val => {
                vis.defaultCurrent = false
                vis.desiredYear = "X".concat(d3.timeFormat('%Y')(val))
                treatmentChange()
            });

        vis.timeSVG.call(vis.timeSlider);

        vis.tenCountries = []
        vis.tenData.forEach(d => {
            vis.tenCountries.push(d.country)
        })

        vis.scaleColor = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(vis.tenCountries)

        vis.dataPoints = vis.svg.selectAll(".dots")
            .data(vis.tenData);

        vis.dataPoints.enter()
            .append("circle")
            .attr("class", "dots")
            .merge(vis.dataPoints)
            .transition()
            .duration(800)
            .attr("cx", d => {
                if(!jQuery.isEmptyObject(d.pairedData)){
                    return vis.scaleX(d.pairedData[vis.desiredYear][0])
                }
                else{
                    return 0
                }
            })
            .attr("cy", d => {
                if(!jQuery.isEmptyObject(d.pairedData)){
                    return vis.scaleY(d.pairedData[vis.desiredYear][1])
                }
                else{
                    return 0
                }
            })
            .attr("r", vis.width/60)
            .attr("fill", d => vis.scaleColor(d.country));

        if(vis.hivSelected){
            vis.selectedTreatment = "HIV ART Coverage"
            vis.selectedTreatmentEffect = "Prop. of Adults with HIV"
            vis.percentText = "%"
        }
        else{
            vis.selectedTreatment = "TB DOTS Coverage"
            vis.selectedTreatmentEffect = "TB Deaths per 100k per Yr"
            vis.percentText = ""
        }

            vis.dataPoints.on('mouseover', function(event, d){
                var f = d3.format(".2f");

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`

            <div style="border: thin solid grey; border-radius: 5px; background: lemonchiffon; font-family: Montserrat; padding: 20px; padding-bottom: 6px">
                <h6>Country: ${d.country}</h6>    
                <p>Year: ${vis.desiredYear.substring(1,vis.desiredYear.length)}<br/>    
                ${vis.selectedTreatment} : ${f(d.pairedData[vis.desiredYear][0])}%<br/>    
                ${vis.selectedTreatmentEffect} : ${f(d.pairedData[vis.desiredYear][1]) + vis.percentText}</p>    

            </div>`);
            })
                .on('mouseout', function(event, d){
                    vis.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                });

        vis.dataPoints.exit().remove();
    }

    cleanData(dataset){
        dataset.forEach((d) => {
            for(var prop in d){
                if(d[prop] !== d[prop]){
                    d[prop] = 0;
                }
            }
        })
    }

    makeAverage(dataset){
        dataset.forEach((d) => {
            let tempCount = 0;
            d.average = 0;
            for(var prop in d){
                if(prop !== "country" && prop !== "average"){
                    d[prop] = +d[prop];
                    tempCount += 1;
                    d.average += d[prop];
                }
            }
            d.average = d.average / tempCount;
        });
    }

    makePercentages(dataset){
        dataset.forEach(d => {
            for(var prop in d){
                if(prop != "country"){
                    d[prop] = d[prop]*10
                }
            }
        })
    }

    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

}