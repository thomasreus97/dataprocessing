/*
Name: Thomas Reus
Student number: 11150041
Assignment: linked views D3
*/

window.onload = function() {
  /*
  Create global variables and
  load data in from a json file
  */

  // parameters plot
  margin = {
    left: 100,
    right: 200,
    top: 60,
    bottom: 150
  };
  param = {
    height: 500,
    width: 1150
  };

  // selection bar for years
  selectionBar = d3.select("body")
                          .append("select")
                          .attr("class", "select");

  // tooltip
  tooltip = d3.select("body")
                     .append("div")
                     .style("position", "fixed")
                     .style("text-align", "center")
                     .style("width", "100px")
                     .style("visibility", "hidden")
                     .style("background", "black")
                     .style("border", "2px solid red")
                     .style("border-radius", "5px")
                     .style("color", "white");

  // make svg primary chart
  svg = d3.select("body")
                 .append("svg")
                 .attr("id", "mainSvg")
                 .attr("width", param.width + margin.left + margin.right)
                 .attr("height", param.height + margin.top + margin.bottom);

  // make svg secondary chart
  svgTwo = d3.select("body")
                    .append("svg")
                    .attr("width", param.width + margin.left + margin.right)
                    .attr("height", param.height + margin.top + margin.bottom);

  // import the json file then start main function
  d3.json("data.json").then(function(response) {
    main(response);
  });
};


function main(response) {
  /*
  Function that calls and does everything
  that has to be done to plot and update
  both linked views
  */

  // put the json into a variable
  var allData = response;

  // pick the start year for the plot
  var startYear = Object.keys(allData)[0];

  // update selection bar
  updateSelect(allData);

  // create scale functions for selected year
  var scales = scaleMaker(allData, startYear);

  // create axes
  axesMaker(scales);

  // plot the barchart
  barGraph(allData, scales, startYear);

  // plot piechart Netherlands
  pieChart(allData, "Nederland", startYear);
};


function scaleMaker(data, year) {
  /*
  First seperates the different data and then
  creates the scale functions for these data
  */

  // seperate data and store in list
  var xDataBar = [];
  var yDataBar = [];
  for (key in data[year]) {
    var yData = parseInt(data[year][key][Object.keys(data[year][key])[0]]);
    if (key === "Nederland" || key === "Overige gemeenten") {
      continue;
    };
    if (yData) {
      yDataBar.push(yData);
      xDataBar.push(key);
    };
  };

  // calculate scales
  var xScaleBar = d3.scaleBand()
                    .domain(xDataBar)
                    .range([margin.left, param.width + margin.left +
                            xDataBar.length * 1.5]);
  var yScaleBar = d3.scaleLinear()
                    .domain([0, Math.round(d3.max(yDataBar) + 500 -
                                           d3.max(yDataBar) % 500)])
                    .range([param.height + margin.top, margin.top]);

  return [xScaleBar, yScaleBar, xDataBar.length];
};


function axesMaker(scales) {
  /*
  Creates the axes for the svg with given
  parameters and data.
  */

  // create axes with format for x axis
  var xAxis = d3.axisBottom(scales[0])
  var yAxis = d3.axisLeft(scales[1]);

  // add title
  svg.append("text")
     .attr("transform",
           "translate("+[margin.left / 2, margin.top / 2]+")")
     .style("font-weight", "bold")
     .style("font-size", "25")
     .text("Total births with a non-western migration background of townships with >100.000 inhabitants (The Netherlands)");

  // plot x-axis
  svg.append("g")
     .attr("class", "axis")
     .attr("id", "xAxis")
     .attr("transform", "translate("+[0, param.height + margin.top]+")")
     .call(xAxis)

     // this part adapted from: http://bl.ocks.org/d3noob/ccdcb7673cdb3a796e13
     .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
            });

  // plot y-axis
  svg.append("g")
     .attr("class", "axis")
     .attr("id", "yAxis")
     .attr("transform", "translate("+[margin.left, 0]+")")
     .call(yAxis);

  // y label
  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("x", - 3 * param.height / 5)
     .attr("y", margin.left / 4)
     .attr("dy", "1em")
     .style("text-anchor", "middle")
     .text("Births (number)");
};


function updateSelect(allData) {
  /*
  adds selection and action to
  the selectionbar
  */

  // calculate years
  var years = Object.keys(allData);

  // add select values of all years
  selectionBar.selectAll("option")
              .data(years)
              .enter()
              .append("option")
              .text(function (d) {
                return d;
              });

  // add interactivity to the select
  selectionBar.on("change", function() {
    chosenYear = selectionBar.property("value");
    var newScales = scaleMaker(allData, this.value);
    barUpdate(allData, newScales, this.value);
    pieUpdate(allData, currentState, this.value);
  });
};


function barGraph(allData, scales, year) {
  /*
  creates a barchart for one year
  input: data, svg, scales and the start year
  */

  // take one data value from the set (total)
  var key = Object.keys(allData[year][Object.keys(allData[year])[0]])[0];

  // the dataset for making the bars
  var dataSet = Object.keys(allData[year]);

  // create bars
  var bars = svg.selectAll("rect")
                .data(dataSet)
                .enter()
                .append("rect")
                .attr("fill", "blue")
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .attr("width", param.width / scales[2] + "px")
                .attr("y", function(d) {
                  var dataPoint = allData[year][d][key];
                  if (dataPoint) {
                    return scales[1](dataPoint) + "px";
                  };
                  return 0 + "px";
                })
                .attr("x", function(d, i) {
                  var dataPoint = allData[year][d][key];
                  if (d === "Nederland" || d === "Overige gemeenten") {
                    return 200000 + "px";
                  };
                  if (dataPoint) {
                    return scales[0](d) + "px";
                  };
                  return 200000 + "px";
                })
                .attr("height", function(d) {
                  var dataPoint = allData[year][d][key];
                  if (dataPoint) {
                    return (margin.top + param.height -
                            scales[1](dataPoint) + "px");
                  };
                  return 0 + "px";
                })

                // interactivity for mouse hovering (how value and change color bar)
                .on("mouseover", function(d){
                  d3.select(this)
                    .attr("fill", "red")
                  return (tooltip.style("visibility", "visible")
                                 .text(allData[year][d][key]));
                })
                .on("mouseout", function(){
                  d3.select(this)
                    .attr("fill", "blue")
                  return (tooltip.style("visibility", "hidden"));
                })
                .on("mousemove", function(d, i){
                  return tooltip.style("top", event.clientY -
                                       param.height / 10 + "px")
                                .style("left", scales[0](d) -
                                       param.width / scales[2] / 2 + "px");
                })

                // extra interactivity for mouse clicking
                .on("click", function(d){
                  var thisBar = d3.select(this);
                  if (thisBar.style("opacity") === "0.5") {
                    bars.attr("stroke", "black")
                        .attr("opacity", "1");
                    pieUpdate(allData, "Nederland", year);
                  }
                  else {
                    bars.attr("stroke", "black")
                        .attr("opacity", "1");
                    thisBar.attr("stroke", "red")
                           .attr("opacity", "0.5");
                    pieUpdate(allData, d, year);
                  };
                });
};


function barUpdate(allData, scales, year) {
  /*
  Updates the barchart with the new year
  including the axes
  */

  // take one data value from the set (total)
  var key = Object.keys(allData[year][Object.keys(allData[year])[0]])[0];

  // the dataset for making the bars
  var dataSet = Object.keys(allData[year]);

  // update the bars
  var bars = svg.selectAll("rect");

  bars.data(dataSet)
      .transition()
      .attr("width", param.width / scales[2] + "px")
      .attr("y", function(d) {
        if (allData[year][d][key]) {
          return scales[1](allData[year][d][key]) + "px";
        };
        return 0 + "px";
      })
      .attr("x", function(d, i) {
        var dataPoint = allData[year][d][key];
        if (d === "Nederland" || d === "Overige gemeenten") {
          return 200000 + "px";
        };
        if (dataPoint) {
          return scales[0](d) + "px";
        };
        return 200000 + "px";
      })
      .attr("height", function(d) {
        var dataPoint = allData[year][d][key];
        if (dataPoint) {
          return (margin.top + param.height -
                  scales[1](dataPoint) + "px");
        };
        return 0 + "px";
      });

  // update interactivity
  bars.data(dataSet)
      .on("mouseover", function(d){
        d3.select(this)
          .attr("fill", "red")
        return (tooltip.style("visibility", "visible")
                       .text(allData[year][d][key]));
      })
      .on("mouseout", function(){
        d3.select(this)
          .attr("fill", "blue")
        return (tooltip.style("visibility", "hidden"));
      })
      .on("mousemove", function(d, i){
        return tooltip.style("top", event.clientY -
                             param.height / 10 + "px")
                      .style("left", scales[0](d) -
                             param.width / scales[2] / 2 + "px");
      })
      .on("click", function(d){
        var thisBar = d3.select(this);
        if (thisBar.style("opacity") === "0.5") {
          bars.attr("stroke", "black")
              .attr("opacity", "1");
          pieUpdate(allData, "Nederland", year);
        }
        else {
          bars.attr("stroke", "black")
              .attr("opacity", "1");
          thisBar.attr("stroke", "red")
                 .attr("opacity", "0.5");
          pieUpdate(allData, d, year);
        };


      });

     // upate the axes
     svg.select("#yAxis").transition().call(d3.axisLeft(scales[1]));
     svg.select("#xAxis")
        .transition()
        .call(d3.axisBottom(scales[0])).selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
          return "rotate(-65)"
        });
};


function pieChart(data, name, year) {
  currentState = name;
};


function pieUpdate(data, name, year) {
  currentState = name;
};
