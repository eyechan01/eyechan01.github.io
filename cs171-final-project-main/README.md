## Visualizing Global Health Policy

In our project, we first give an overview of global health, and users can select different health conditions to more closely examine its effects on each country. 
Then, we take a closer look at how certain health measures, system-wise and treatment-wise, regulated by the government ultimately affect the quality of life in each country. 
Finally, we take our examination on global health to today, when countries are responding to COVID-19. 
We first examine how certain health systems have fared in the pandemic, and then we take a closer look at the policies implemented by each country – how they changed the overall trajectory of infections.

### Usage

* Visit this [link](https://amazhangphyl.github.io/cs171-final-project/) to view this project.

* Visit this [link](https://drive.google.com/drive/folders/1_g3xmLSfvcJt_twSIrBejWfwftIr6TK-?usp=sharing) to view a screencast for this project.

### Implementation

##### Global Health Overview

Within the overview, the user can select a particular disease and view a map with data of that disease per country displayed. Additionally, a spider plot displays on the right-hand side after a user hovers over a country displaying a more in-depth analysis to diseases in that country.

* The code in the following files was written by ourselves.

* mapVis.js

* spiderChart.js

##### Policy and Health

Within the policy and health section, the user first interfaces with a coordinate plot that relates government health spending with life expectancy, child mortality, TB prevalence, and HIV prevalence. Then, two scatterplots follow that discuss HIV and TB treatment – how treatment coverage and infection rates are related for particular countries over time. 

All code in the following files was written by us.

* coordinateVis.js

    * Feature-wise, the parallel coordinate plot allows the users to select a global health outcome (life expectancy, child mortality, HIV prevalence or tuberculosis prevalence). The values displayed for each country represent an average across the time range selected by the user (using the timeline below the visualization). All axes are brushable. 

* timeline.js

    * Addition to the parallel coordinate plot that allows the user to select a time range using a slider. 

* scatterVis.js

##### Infectious Disease Today

Within the more COVID-oriented section, user-interactive line graphs are displayed, relating health systems and government instituted policies to the infection rate per country. A country by country analysis for each visualization is provided for comparison. 

All code in the following files was written by us. 

* countryhealthVis.js

    * Feature-wise, users select values for certain metrics and a country is matched. That country's COVID-19 infection rate trajectory is plotted against the US's trajectory and a table is updated with the actual values.

* countrygovVis.js and countryGovBarVis.js

    * Feature-wise, users select two countries and their trajectories are plotted against each other. Users can hover to see the policy implemented by the country at a particular time point, and a bar chart compares the number of mandatory and voluntary policies by each country.

##### Overall, Libraries

* index.html, styles.css

    * We've written the index.html and styles.css files ourselves, with inspiration from certain sources listed below:
        * To implement a typewriter effect, we took inspiration from [w3schools](https://www.w3schools.com/howto/howto_js_typewriter.asp).
        * Arrows were taken from codepen.io.

* d3.js, Bootstrap Libraries, Google Fonts

    * We've used the d3 library to implement our visualizations.
    * To create the layout for our webpage and stylize text, we've used bootstrap libraries and google fonts.


