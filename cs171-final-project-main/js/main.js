console.log("test")

let mapVis;
let spiderChart;
let spiderVisible = false;
let targetCountry;
let countryhealthVis;
let scatterVisOne;
let scatterVisTwo;
let coordVis;
let timeLine;
let countryGovVis;
let countryGovBarVis;

let promises = [
    d3.json("data/GBD/geodata.json"),
    d3.csv("data/GBD/deaths_long.csv"),
    d3.csv("data/GBD/DALYs_long.csv"),
    d3.csv("data/OECD/expenditure_health.csv"),
    d3.csv("data/OECD/government_insurance.csv"),
    d3.csv("data/OECD/health_and_social_employment.csv"),
    d3.csv("data/OECD/immunization.csv"),
    d3.csv("data/OECD/num_hospitals.csv"),
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("data/Gapminder/GlobalHealthOutcomes/adults_with_hiv_percent_age_15_49.csv"),
    d3.csv("data/Gapminder/GlobalHealthOutcomes/all_forms_of_tb_existing_cases_per_100000_estimated.csv"),
    d3.csv("data/Gapminder/GlobalHealthOutcomes/life_expectancy.csv"),
    d3.csv("data/Gapminder/Policy-related/government_health_spending_of_total_gov_spending_percent.csv"),
    d3.csv("data/Gapminder/Treatment/HIV_ART_coverage.csv"),
    d3.csv("data/Gapminder/Treatment/TB_DOTS_coverage.csv"),
    // @ETHAN I've added cleaner/subsetted versions of the gapminder data where
    // countries and years are consistent across all datasets, but didn't want to delete
    // the old versions, since you are using them
    d3.csv("data/Gapminder/global_health_outcomes_clean/HIV.csv"),
    d3.csv("data/Gapminder/global_health_outcomes_clean/TB.csv"),
    d3.csv("data/Gapminder/global_health_outcomes_clean/life_expectancy.csv"),
    d3.csv("data/Gapminder/global_health_outcomes_clean/child_mortality.csv"),
    d3.csv("data/Gapminder/policy_clean/gov_health_exp_pct.csv"),
    d3.csv("data/Gapminder/policy_clean/gov_health_exp_pp.csv"),
    d3.csv("data/Gapminder/policy_clean/total_health_spending.csv"),
    d3.csv("data/COVID/owid-covid-data.csv"),
    d3.csv("data/COVID/country_population.csv"),
    d3.csv("data/COVID/coronanet_release.csv")

];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

function initMainPage(allDataArray) {

    // log data
    console.log(allDataArray);

    // create class instances
    mapVis = new MapVis('mapVis', allDataArray[0], allDataArray[1], allDataArray[2]);
    spiderChart = new SpiderChart('spiderChart', allDataArray[0], allDataArray[1], allDataArray[2]);
    countryhealthVis = new CountryhealthVis('country-health', allDataArray[3], allDataArray[4], allDataArray[5], allDataArray[6], allDataArray[7], allDataArray[8], allDataArray[22], allDataArray[23]);
    scatterVisOne = new ScatterVis('scatterVisOne', allDataArray[13], allDataArray[14], allDataArray[21],
        allDataArray[15], allDataArray[16], allDataArray[17], true);
    scatterVisTwo = new ScatterVis('scatterVisTwo', allDataArray[13], allDataArray[14], allDataArray[21],
        allDataArray[15], allDataArray[16], allDataArray[17], false);
    coordVis = new CoordVis('coordVis',allDataArray[15], allDataArray[16], allDataArray[17], allDataArray[18],
        allDataArray[19],allDataArray[20],allDataArray[21]);
    timeLine = new TimeLine('timeSlider')
    countryGovVis = new CountrygovVis('country-gov', allDataArray[3], allDataArray[4], allDataArray[5], allDataArray[6], allDataArray[7], allDataArray[8], allDataArray[22], allDataArray[23], allDataArray[24]);
    countryGovBarVis = new CountrygovbarVis('country-gov-bar', allDataArray[3], allDataArray[4], allDataArray[5], allDataArray[6], allDataArray[7], allDataArray[8], allDataArray[22], allDataArray[23], allDataArray[24]);
    treatmentChange()
}

function diseaseChange(){
    mapVis.wrangleData();
}

function treatmentChange(){
    scatterVisOne.wrangleData();
    scatterVisTwo.wrangleData();
}

function countryhealthChange(){
    countryhealthVis.wrangleData();
}

function selectionChange(){
    coordVis.wrangleData();
}

function countrygovChange(country){
    countryGovVis.changeCountry(country);
    countryGovBarVis.changeCountry(country);
}