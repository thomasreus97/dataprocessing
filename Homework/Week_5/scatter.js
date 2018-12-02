/*
Name: Thomas Reus
Student number: 11150041
Assignment: scatterplot D3

Creates an interactive scatterplot with D3
function: changing year
changes: scales adapt, transformation
*/

window.onload = function() {

  // do a json request for the requested sources
  var womenScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.AUT+BEL+CZE+DNK+EST+FIN+FRA+LVA+DEU+HUN+IRL+ITA+JPN+KOR+LUX+NLD+POL+PRT+SVK+SVN+ESP+GBR+TUR/all?startTime=2008&endTime=2015"
  var confidence = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/AUT+BEL+LVA+CZE+DNK+EST+FIN+FRA+DEU+HUN+IRL+ITA+JPN+KOR+LUX+NLD+POL+PRT+SVK+SVN+ESP+GBR+TUR.COCONF.A/all?startTime=2008&endTime=2015"
  var womenScienceHeadCount = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRS.AUT+BEL+LVA+CZE+DNK+EST+FIN+FRA+DEU+HUN+IRL+ITA+JPN+KOR+LUX+NLD+POL+PRT+SVK+SVN+ESP+GBR+TUR/all?startTime=2008&endTime=2015"
  var dataGDP = "https://stats.oecd.org/SDMX-JSON/data/HH_DASH/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+HUN+LVA+IRL+ITA+JPN+KOR+LUX+NLD+POL+PRT+SVK+SVN+ESP+GBR+TUR.RGDP_INDEX.A/all?startTime=2008&endTime=2015"
  var requests = [d3.json(womenScience), d3.json(confidence),
                  d3.json(womenScienceHeadCount), d3.json(dataGDP)];

  // start the main function
  Promise.all(requests).then(function(response) {
    main(response);
  });
};


function main(response) {
  /*
  Main function of the javascript
  Input: - json files (request)
         - starting year datat (startYear)
  */

  // format the data
  var dataSets = formatData(response);

  // parameters plot
  var margin = {
    left: 60,
    right: 200,
    top: 60,
    bottom: 60
  };
  var parameters = {
    height: 500,
    width: 1150
  };

  // create slider and text with value of slider
  var slider = d3.select("body")
                 .append("input")
                 .attr("id", "sliderYear")
                 .attr("type", "range")
                 .attr("min", d3.min(dataSets[1]))
                 .attr("max", d3.max(dataSets[1]))
                 .attr("step", "1")
  var sliderValue = d3.select("body")
                      .append("div")
                      .attr("id", "sliderValue")
                      .text("Year:");

  // create the scatterplot
  scatterPlotMaker(parameters, margin, dataSets);
};


function formatData(response) {
  /*
  Puts the relevant data from the files into
  a dictionary for every data point
  in the scatter plot. (values, keys (names of data)
  and years)
  */

  // iterate over datasets and get usefull data
  var dataList = {};
  var keys = [];
  var yearsList = [];

  response.forEach(function(element, k) {

    // variable keys for dictionary
    if (k === 1 || k === 3){
      var key = element.structure.dimensions.series[1].values[0].name;
    }
    else {
      var key = element.structure.dimensions.series[0].values[0].name;
    };
    keys.push(key);

    // make countries list
    var countries = [];
    if (k === 3) {
      var countriesFile = element.structure.dimensions.series[0].values;
    }
    else {
      var countriesFile = element.structure.dimensions.series[Math.abs(k - 1)].values;
    };
    for (i in countriesFile) {
      countries.push(countriesFile[i].name);
    };

    // make year list
    var years = [];
    var yearsFile = element.structure.dimensions.observation[0].values;
    for (i in yearsFile) {
      years.push(yearsFile[i].name);
    };

    // iterate over the interesting data
    var fileData = element.dataSets[0].series;
    var counter = 0;
    for (i in fileData) {
      var setData = fileData[i].observations;

      // insert data into the datalist per data point (country)
      if (k === 0) {
        dataList[countries[counter]] = {};
      };

      for (i in setData) {

        // sort data on years
        var year = years[parseInt(i)];
        if (!(String(year) in dataList[countries[counter]])) {
          dataList[countries[counter]][year] = {};
        };
        dataList[countries[counter]][year][key] = setData[i][0];

        // add year to years list when not already in
        if (yearsList.indexOf(+year) === -1) {
          yearsList.push(+year);
        };
      };
       counter += 1;
    };
  });
  return [dataList, yearsList, keys];
};


function scatterPlotMaker(param, margin, data) {
  /*
  function where the svg, the axes and the
  data of the scatterplot are called
  adds functionality to slideryear
  */

  // make svg
  var svg = d3.select("body")
              .append("svg")
              .attr("width", param.width + margin.left + margin.right)
              .attr("height", param.height + margin.top + margin.bottom)
              .attr("id", "mainSvg");

  // starting year of first plot
  var startYear = d3.min(data[1]);

  // calculate domains of all values
  var domainData = variablesCalculator(data[0], startYear);

  // create scales
  var scales = scaleMaker(param, margin, domainData);

  // make axes and legends
  axesMaker(param, margin, scales, data, svg);

  // add functionality to slider
  var sliderYear = d3.select("#sliderYear")
          .on("input", function(){
            sliderText(this.value);
            var newDomains = variablesCalculator(data[0], this.value);
            var newScales = scaleMaker(param, margin, newDomains);
            updateGraph(newScales, data, svg, this.value);
          });

  // plot the scatterplot data of first year in data
  scatterPlotter(scales, data, svg, startYear);
  console.log(data)
};


function variablesCalculator(data, year) {
  /*
  Function to calculate the domain of all
  variables for one year.
  */

  var dataX = [];
  var dataY = [];
  var dataC = [];
  var dataR = [];
  for (i in data) {
    var counter = 0;
    for (k in data[i][year]) {
      if (Object.keys(data[i][year]).length === 4) {
        if (counter === 0) {
          dataX.push(data[i][year][k]);
        }
        else if (counter === 1) {
          dataY.push(data[i][year][k]);
        }
        else if (counter === 2) {
          dataC.push(data[i][year][k]);
        }
        else if (counter === 3) {
          dataR.push(data[i][year][k]);
        };
      };
        counter += 1;
    };
  };

  // return the domains
  return [[d3.min(dataX), d3.max(dataX)], [d3.min(dataY),
          d3.max(dataY)], [d3.min(dataC), d3.max(dataC)],
          [d3.min(dataR), d3.max(dataR)]];
};


function sliderText(sliderYear) {
  /* Shows current year */
  var sliderValue = document.getElementById("sliderValue");
  sliderValue.innerHTML = "Year: " + sliderYear;
};


function scaleMaker(param, margin, domainData) {
  /*
  Creates the scale functions for the graph
  */

  var yScale = d3.scaleLinear()
                 .domain([domainData[1][0] - (10 + domainData[1][0] % 10),
                         domainData[1][1] + (10 - domainData[1][1] % 5)])
                 .range([param.height + margin.top, margin.top]);
  var xScale = d3.scaleLinear()
                 .domain([domainData[0][0] - domainData[0][0] % 5 - 5,
                          domainData[0][1] - domainData[0][1] % 5 + 10])
                 .range([margin.left, param.width + margin.left]);
  var rScale = d3.scaleLinear()
                 .domain(domainData[3])
                 .range([5, 30]);
  var colorScale = d3.scaleQuantize()
                     .domain(domainData[2])
                     .range(colorbrewer.Blues[9]);

return [xScale, yScale, colorScale, rScale];
};


function axesMaker(param, margin, scales, data, svg) {
  /*
  Creates the axes for the svg with given
  parameters and data.
  Creates legends for color and radius.
  */

  // create axes with format for x axis
  var xAxis = d3.axisBottom(scales[0])
  var yAxis = d3.axisLeft(scales[1]);

  // add title
  svg.append("text")
     .attr("transform",
           "translate("+[param.width / 4, margin.top / 2]+")")
     .style("font-weight", "bold")
     .style("font-size", "30")
     .text("Scatterplot of consumer confidence vs women in science");

  // plot x-axis
  svg.append("g")
     .attr("class", "axis")
     .attr("id", "xAxis")
     .attr("transform", "translate("+[0, param.height + margin.top]+")")
     .call(xAxis);

  // plot y-axis
  svg.append("g")
     .attr("class", "axis")
     .attr("id", "yAxis")
     .attr("transform", "translate("+[margin.left, 0]+")")
     .call(yAxis);

  // x label
  svg.append("text")
     .attr("transform",
           "translate("+[(param.width + margin.left) / 2, param.height +
                         margin.top + 2 * margin.bottom / 3]+")")
     .style("text-anchor", "middle")
     .text(data[2][0] + " [%]");

  // y label
  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("x", - 3 * param.height / 5)
     .attr("y", 0)
     .attr("dy", "1em")
     .style("text-anchor", "middle")
     .text(data[2][1]);

  // create color legend
  var colorLegend = d3.legendColor()
                      .labelFormat(d3.format(".0f"))
                      .scale(scales[2])
                      .shapePadding(5)
                      .shapeWidth(50)
                      .shapeHeight(20)
                      .labelOffset(12);

  // add legend to chart
  svg.append("g")
     .attr("id", "colorLegend")
     .attr("transform", "translate("+[param.width + margin.left,
                                      margin.top]+")")
     .call(colorLegend);

  // color legend label
  svg.append("text")
     .attr("transform", "translate("+[param.width + 5 * margin.left / 2,
                                      margin.top / 2]+")")
     .style("text-anchor", "middle")
     .text(data[2][2]);

  // size legend (code adapted from https://d3-legend.susielu.com/#size)
  var legendSize = d3.legendSize()
                     .scale(scales[3])
                     .shape('circle')
                     .labelOffset(20)
                     .orient('vertical');

   svg.append("g")
      .attr("class", "legendSize")
      .attr("transform", "translate("+[param.width + 2 * margin.left,
                                       param.height / 2 + 3 * margin.top / 2]+")")
      .call(legendSize);

  // size legend label
  svg.append("text")
     .attr("transform", "translate("+[param.width + 5 * margin.left / 2,
                                      2 * param.height / 3]+")")
     .style("text-anchor", "middle")
     .text(data[2][3]);
};


function scatterPlotter(scales, data, svg, year) {
  /*
  Plots the scatterplot for a given year.
  */

  // create a tooltip for country name
  var tooltip = d3.select("body")
                  .append("div")
                  .attr("id", "tooltip")
                  .style("position", "fixed")
                  .style("text-align", "center")
                  .style("width", "100px")
                  .style("visibility", "hidden")
                  .style("background", "black")
                  .style("border", "2px solid red")
                  .style("border-radius", "5px")
                  .style("color", "white");

  // data seperation in data
  var keys = data[2];
  var data = data[0];

  // create circles for every datapoint
  // move out of svg range when value = undefined
  var circles = svg.selectAll(".dataCir")
                   .data(Object.keys(data))
                   .enter()
                   .append("circle")
                   .attr("id", "dataCircle")
                   .attr("stroke", "black")
                   .attr("opacity", "0.75")
                   .attr("stroke-width", "2px")
                   .attr("cx", function(d) {
                     if ((Object.keys(data[d])).indexOf(String(year)) === -1) {
                       return 20000;
                     };
                     var xValue = data[d][year][keys[0]];
                     if (xValue === undefined){
                       return 20000;
                     };
                     return scales[0](xValue);
                   })
                   .attr("cy", function(d) {
                     if ((Object.keys(data[d])).indexOf(String(year)) === -1) {
                       return 20000;
                     };
                     var yValue = data[d][year][keys[1]];
                     if (yValue === undefined){
                       return 20000;
                     };
                     return scales[1](yValue);
                   })
                   .attr("r", function(d) {
                     if ((Object.keys(data[d])).indexOf(String(year)) === -1) {
                       return 0;
                     };
                     var rValue = data[d][year][keys[3]];
                     if (rValue === undefined){
                       return 0;
                     };
                     return scales[3](rValue);
                   })
                   .attr("fill", function(d) {
                     if ((Object.keys(data[d])).indexOf(String(year)) === -1) {
                       return "red";
                     };
                     colorValue = data[d][year][keys[2]];
                     if (colorValue === undefined){
                       return "red";
                     };
                     return scales[2](colorValue);
                   })

                   // interactivity for mouse hovering (show info)
                   .on("mouseover", function(d){
                     d3.select(this)
                       .attr("stroke", "red")
                       .attr("stroke-width", "4px")
                     return ((tooltip.style("visibility", "visible")
                                    .text(d)))
                   })
                   .on("mouseout", function(){
                     d3.select(this)
                       .attr("stroke", "black")
                       .attr("stroke-width", "2px")
                     return (tooltip.style("visibility", "hidden"));
                   })
                   .on("mousemove", function(d, i){
                     return tooltip.style("top", event.clientY - 10 + "px")
                                   .style("left", event.clientX + 10 + "px");
                   });
};


function updateGraph(scales, data, svg, year) {
  /*
  Updates the graph with the new year value:
  - x, y, r and color for values
  - axes and legends.
  */

  // data and keys
  var keys = data[2];
  var data = data[0];

  // update the circles (move out of screen when not available)
  var circles = svg.selectAll("#dataCircle")
                   .data(Object.keys(data))
                   .transition()
                     .attr("stroke", "black")
                     .attr("stroke-width", "2px")
                     .attr("opacity", "0.75")
                     .attr("cx", function(d) {
                       if ((Object.keys(data[d])).indexOf(String(year)) === -1) {
                         return 20000;
                       };
                       var xValue = data[d][year][keys[0]];
                       if (xValue === undefined){
                         return 20000;
                       };
                       return scales[0](xValue);
                     })
                     .attr("cy", function(d) {
                       if ((Object.keys(data[d])).indexOf(String(year)) === -1) {
                         return 20000;
                       };
                       var yValue = data[d][year][keys[1]];
                       if (yValue === undefined){
                         return 20000;
                       };
                       return scales[1](yValue);
                     })
                     .attr("r", function(d) {
                       if ((Object.keys(data[d])).indexOf(String(year)) === -1) {

                         return 0;
                       };
                       var rValue = data[d][year][keys[3]];
                       if (rValue === undefined){
                         return 0;
                       };
                       return scales[3](rValue);
                     })
                     .attr("fill", function(d) {
                       if ((Object.keys(data[d])).indexOf(String(year)) === -1) {
                         return "red";
                       };
                       colorValue = data[d][year][keys[2]];
                       if (colorValue === undefined){
                         return "red";
                       };
                       return scales[2](colorValue);
                     });

    // upate the axes and legends
    svg.select("#xAxis").transition().call(d3.axisBottom(scales[0]));
    svg.select("#yAxis").transition().call(d3.axisLeft(scales[1]));

    // new color legend info
    var colorLegend = d3.legendColor()
                        .labelFormat(d3.format(".0f"))
                        .scale(scales[2])
                        .shapePadding(5)
                        .shapeWidth(50)
                        .shapeHeight(20)
                        .labelOffset(12);

    svg.select("#colorLegend").call(colorLegend);

    // new size legend info
    var legendSize = d3.legendSize()
                       .scale(scales[3])
                       .labelOffset(20)
                       .orient('vertical');

    // svg.select(".legendSize").call(legendSize);
};
