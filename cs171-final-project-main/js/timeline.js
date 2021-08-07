class TimeLine {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).width()/2 - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.timeSVG = d3.select('#timeSlider')
            .append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height/3)
            .append('g')
            .attr('transform', 'translate(30,30)');

        // set up data for time slider
        vis.axisYears = d3.range(0, 13).map(function(d) {
            return new Date(1995 + d, 10, 3);
        });

        // create time slider
        vis.timeSlider = d3.sliderBottom()
            .min(d3.min(vis.axisYears))
            .max(d3.max(vis.axisYears))
            .step(1000 * 60 * 60 * 24 * 365)
            .tickFormat(d3.timeFormat('%Y'))
            .tickValues(vis.axisYears)
            .default(d3.extent(vis.axisYears))
            .width(2*vis.width/3)
            .fill('dodgerblue')
            .on('onchange', val => {
                d3.select('#time-range').text(val.map(d3.timeFormat('%Y')).join(' - '));
                selectionChange()
            });

        // call time slider
        vis.timeSVG.call(vis.timeSlider);

    }
}
