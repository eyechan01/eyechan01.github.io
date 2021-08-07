class CoordVis {
    constructor(parentElement, hivData, tbData, lifeExpData, mortData,expPctData,expPPData,totExpData) {
        this.parentElement = parentElement;
        this.hivData = hivData; // HIV case data
        this.tbData = tbData; // Tuberculosis case data
        this.lifeExpData = lifeExpData; // life expectancy data
        this.mortData = mortData; // child mortality data
        this.expPctData = expPctData; // government health (% of total spending) data
        this.expPPData = expPPData; // government health spending (USD/person) data
        this.totExpData = totExpData; // total health spending (% of GDP) data
        this.displayData = [];

        //create function to convert data type for all columns
        function typeConverter(d){
            for (let i = 1995;i < 2008; i++){
                d['X'+i] = +d['X'+i];
            }
        }

        // convert data types
        this.hivData.forEach(d => typeConverter(d));
        this.tbData.forEach(d => typeConverter(d));
        this.lifeExpData.forEach(d => typeConverter(d));
        this.mortData.forEach(d => typeConverter(d));
        this.expPctData.forEach(d => typeConverter(d));
        this.expPPData.forEach(d => typeConverter(d));
        this.totExpData.forEach(d => typeConverter(d));

        // create maps
        this.expPctMap = {};
        this.totExpMap = {};

        this.expPctData.forEach(d => {this.expPctMap[d['country']]=d});
        this.totExpData.forEach(d => {this.totExpMap[d['country']]=d});

        // initialize axis variables
        this.vars = ['spendPerPerson','govHealthShare','totalHealthSpend','outcome'];

        // variable labels
        this.labels = {
            'spendPerPerson': 'Annual Gov. Health Spend. (USD/person)',
            'govHealthShare':'% of Gov. Spend. on Public Health',
            'totalHealthSpend': 'Tot. Spend. on Public Health (% of GDP)',
            'mortData': 'Child Mortality (deaths/1,000 born)',
            'tbData': 'Tuberculosis Cases (per 100,000)',
            'lifeExpData':'Life Expectancy',
            'hivData':'% of Adults with HIV'
        }

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("class",'coord-SVG')
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // init x-scale
        vis.xScale = d3.scalePoint()
            .domain(vis.vars)
            .range([0, vis.width])
            .padding(1);

        // init tooltip
        vis.tooltip = d3.select("#coordVis").append('div')
            .attr('class', "tool_tip")
            .attr('width','100px')

        vis.wrangleData()
    }

    wrangleData(){
        let vis = this;

        //temporary structure (to be replace by displayData)
        vis.displayData = [];

        // obtain user selections
        let timeSelect = document.getElementById("time-range").innerHTML.split(' - ');
        vis.varSelect = document.querySelector('input[name="outcome"]:checked').value;

        // obtain years to average over
        let year_selection = [];

        for (let i = timeSelect[0];i <= timeSelect[1]; i++){
              year_selection.push('X'+i);
        }

        // create outcome map
        let outcomeMap = {};
        vis[vis.varSelect].forEach(d => {outcomeMap[d['country']]=d});

        // aggregate data based on outcome and year selection
        vis.expPPData.forEach(d=>{

            // initialize variables
            let avg_spend_pp = 0;
            let avg_total_spend = 0;
            let avg_gov_share = 0;
            let avg_outcome = 0;

            let num_years = year_selection.length;

            // calculate averages
            for (let i=0; i<num_years; i++){

                let year = year_selection[i]; // obtain year

                avg_spend_pp += d[year]/num_years;
                avg_total_spend += vis.totExpMap[d.country][year]/num_years;
                avg_gov_share += vis.expPctMap[d.country][year]/num_years;
                avg_outcome += outcomeMap[d.country][year]/num_years;

            }

            // create clean output data
            let country_filtered = {
                country: d.country,
                spendPerPerson: Math.round(avg_spend_pp*10)/10,
                govHealthShare: Math.round(avg_gov_share*1000)/10,
                totalHealthSpend: Math.round(avg_total_spend*1000)/10,
                outcome: Math.round(avg_outcome*100)/100,
            };

            // push to final structure
            vis.displayData.push(country_filtered);
            })

        vis.updateVis()
    }

    updateVis(){
        let vis = this;

        // init y-scales and axes
        vis.yScales = {};
        vis.yAxes = {};

        let i =0;
        for (i in vis.vars) {
            name = vis.vars[i] //obtain variable name

            //set scale
            vis.yScales[name] = d3.scaleLinear()
                .domain(d3.extent(vis.displayData, d=> +d[name]))
                .range([vis.height-50, 0]);

            // set y-axis
            vis.yAxes[name] = d3.axisLeft().scale(vis.yScales[name])

        }

        // create path function
        function path(d) {
            return d3.line()(vis.vars.map(function(p) {
                return [vis.xScale(p), vis.yScales[p](d[p])+40];
            }));
        }

        // draw main lines
        vis.lines = vis.svg.selectAll(".country-line")
            .data(vis.displayData);

        vis.lines = vis.lines.enter()
            .append("path")
            .merge(vis.lines)

        vis.lines.transition()
            .duration(800)
            .attr("class", "country-line")
            .attr("d",  path)
            .attr('y',20)
            .attr("stroke-width", 1.5)
            .style("fill", "none")
            .style("stroke", "dodgerblue")
            .style("opacity", 0.4);

        // draw vertical axes
        vis.axes = vis.svg.selectAll(".y-axis")
            .data(vis.vars);

        vis.axes.enter()
            .append("g")
            .merge(vis.axes)
            .each(function(d){d3.select(this).call(vis.yAxes[d])})
            .attr('class','y-axis')
            .attr("transform", d => "translate(" + vis.xScale(d) + ",40)")
            .each(function(d) {
                console.log(d)
                d3.select(this).call(vis.yScales[d].brush = d3.brushY().extent([[-10, 0], [10, vis.height-48]])
                    .on("brush", brushed));
            })
            .selectAll("rect")
            .attr("x", -10)
            .attr("width", 20);

        //store selected outcome
        vis.labels['outcome'] = vis.labels[vis.varSelect];

        // create labels
        vis.axislabels = vis.svg.selectAll(".axis-labs")
            .data(vis.vars)

        vis.axislabels.enter()
            .append("text")
            .merge(vis.axislabels)
            .attr('class','axis-labs')
            .attr("transform", d => "translate(" + vis.xScale(d) + ",40)")
            .style("text-anchor", "middle")
            .attr("y", -20)
            .attr('x',0)
            .text(d=>vis.labels[d])
            .style("fill", "black")

        // add hovering effects
        vis.lines
            .on('mouseover',function(event,d){
                d3.select(this)
                    .style("stroke", "darkblue")
                    .style("opacity", 0.9)
                    .attr("stroke-width", 3)

                 vis.tooltip
                     .attr("display","null")
                     .style("opacity", 1)
                     .style("left", event.pageX + 20 + "px")
                     .style("top", event.pageY + "px")
                     .html(`<div style="padding: 20px">
                            <h6>${d.country}</h6></div>`);
            })
            .on('mouseout',function(event){
                d3.select(this)
                    .style("stroke", "dodgerblue")
                    .style("opacity", 0.5)
                    .attr("stroke-width", 1.5)

                vis.tooltip
                    .attr("display","none")
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);

                brushed();
            });

        // brush function
        function brushed(event) {

            // init brush selection
            let brush_selections = [];

            for (i=0;i<4;i++){

                // obtain selection for brushed axes
                if(d3.brushSelection(d3.selectAll(".y-axis").nodes()[i])!=null){
                    let brushed_axis = {
                        label: vis.vars[i],
                        selection: d3.brushSelection(d3.selectAll(".y-axis").nodes()[i])};

                    // store selection
                    brush_selections.push(brushed_axis);
                }
            }

            //convert to map
            let selection_map = {};
            brush_selections.forEach(d => {selection_map[d['label']]=d});

            //obtain lines in brushed area

            let line_selection = [];

            vis.displayData.forEach(function(d){

                let selected = 1;

                // loop over brushed axes
                brush_selections.forEach(function(p){

                    //obtain selection
                    let selection = selection_map[p.label].selection;

                    // check if line is outside of selection of current axis
                    if(vis.yScales[p.label](d[p.label])<selection[0] | vis.yScales[p.label](d[p.label])>selection[1]) {selected = 0}

                });

                //store selection indicator
                line_selection.push(selected);
            })

            vis.lines.style("stroke", function(d,i) {
                if(brush_selections.length==0){ return 'dodgerblue'}
                else if(line_selection[i]==1) {return 'darkblue'}
                else{ return 'dodgerblue'}
            });

            vis.lines.style("opacity", function(d,i){
                if(brush_selections.length==0){ return 0.5}
                else if(line_selection[i]==1) {return 0.7}
                else{return 0.3}
            });
        }

        // exit
        vis.lines.exit().remove();
        vis.axes.exit().remove();
        vis.axislabels.exit().remove();

    }
}