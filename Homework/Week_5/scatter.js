/*
Name: Thomas Reus
Student number: 11150041
Assignment: scatterplot D3
*/

window.onload = function() {

  // do a json request for the requested sources
  var womenScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  var confidence = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
  var womenScienceHeadCount = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime"
  var requests = [d3.json(womenScience), d3.json(confidence), d3.json(womenScienceHeadCount)];

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
    left: 30,
    right: 30,
    top: 30,
    bottom: 30;
  };
  var parameters = {
    height: 500,
    width: 1000;
  };

  // create the scatterplot
  scatterPlotMaker(parameters, margin, dataSets);

};


function formatData(response) {
  /*
  Puts the relevant data from the files into
  a dictionary for every data point
  in the scatter plot.
  */

  // iterate over datasets and get usefull data
  var dataList = {};
  response.forEach(function(element, k) {

    // variable keys for dictionary
    var key = element.structure.dimensions.series[0].values[0].name;
    if (k === 1){
      key = element.structure.dimensions.series[1].values[0].name;
    };

    // make countries list
    var countries = [];
    var countriesFile = element.structure.dimensions.series[Math.abs(k - 1)].values;
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
      };
       counter += 1;
    };
  });

  return dataList;
};


function scatterPlotMaker(param, margin, data) {
  /*
  function where the svg, the axes and the
  data of the scatterplot are called
  */
  console.log("check")
  // make svg
  var svg = d3.select("body")
              .append("svg")
              .attr("width", param.width + margin.left + margin.right)
              .attr("height", param.height + margin.top + margin.bottom);

  // make axes
  axesMaker(param, margin, data, svg);

  // plot the scatterplot data
  scatterPlotter(param, margin, data, svg, year);
};


function axesMaker(param, margin, data, svg) {
  /*
  Creates the axes for the svg with given
  parameters and data.
  */

  // create scales for axes
  var yScale = d3.scaleLinear()
                 .domain([0, d3.max(data, function(d) {
                   return d.value;
                 })]);  2

                 .range([param.height, margin.top]);
  var xScale = d3.scaleLinear()
                 .domain(xValues)
                 .range([margin.left, param.width]);

   // create axes
   var xAxis = d3.axisBottom(xScale);
   var yAxis = d3.axisLeft(yScale);

   // plot x-axis
   svgInput.append("g")
           .attr("class", "axis")
           // .attr("transform", "translate("+[0, 0]+")")
           .call(xAxis);

   // plot y-axis
   svgInput.append("g")
           .attr("class", "axis")
           // .attr("transform", "translate("+[0, 0]+")")
           .call(yAxis);

   // x label
   svgInput.append("text")
           // .attr("transform",
                 // "translate("+[(w - leftChart - rightChart)/2 + leftChart,
                 //                h - topChart + bottomChart]+")")
           .style("text-anchor", "middle")
           .text("xLabel");

   // y label
   svgInput.append("text")
           .attr("transform", "rotate(-90)")
           .attr("x", - (h - topChart + bottomChart) / 2)
           .attr("y", 0)
           .attr("dy", "1em")
           .style("text-anchor", "middle")
           .text("% of total primary energy supply");
};


function scatterPlotter(param, margin, data, svg, year) {
  /*
  Plots the scatterplot for a given year.
  */

};
