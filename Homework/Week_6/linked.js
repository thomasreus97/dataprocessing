/*
Name: Thomas Reus
Student number: 11150041
Assignment: linked views D3

Creates a connected barchart and piechart
with both a tooltip and interactivity
by a select.
*/

window.onload = function() {
  /*
  Create global variables and
  load data in from a json file
  */

  // parameters plot
  margin = {
    left: 60,
    right: 120,
    top: 50,
    bottom: 130
  };
  param = {
    height: 250,
    width: 1000,
    radius: 125
  };

  // selection bar for years
  selectionBar = d3.select("body")
                   .append("select")
                   .attr("class", "btn btn-primary dropdown-toggle");
  d3.select("body").append("div");

  // tooltip
  tooltip = d3.select("body")
              .append("div")
              .style("position", "fixed")
              .style("text-align", "center")
              .style("width", "80px")
              .style("height", "30px")
              .style("visibility", "hidden")
              .style("border", "2px solid #e6550d")
              .style("background", "#3182bd")
              .style("border-radius", "5px")
              .style("line-height", "30px")
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
             .attr("id", "chartPie")
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

  // make first pie chart
  chartpie(allData, "Nederland", startYear);
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
     .attr("class", "text")
     .attr("transform",
           "translate("+[margin.left / 2, margin.top / 2]+")")
     .style("font-weight", "bold")
     .style("font-size", "20")
     .text("Total births with a non-western migration background of townships with >100.000 inhabitants (The Netherlands)");

  // plot x-axis
  svg.append("g")
     .attr("class", "axis")
     .attr("id", "xAxis")
     .attr("transform", "translate("+[0, param.height + margin.top]+")")
     .call(xAxis)

     // this part adapted from: http://bl.ocks.org/d3noob/ccdcb7673cdb3a796e13
     .selectAll("text")
            .attr("class", "text")
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
     .attr("class", "text")
     .attr("transform", "rotate(-90)")
     .attr("x", - 3 * param.height / 5)
     .attr("y", 0)
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
                .attr("fill", "#0570b0")
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
                    .attr("fill", "#e6550d")
                  return (tooltip.style("visibility", "visible")
                                 .text(allData[year][d][key]));
                })
                .on("mouseout", function(){
                  d3.select(this)
                    .attr("fill", "#0570b0")
                  return (tooltip.style("visibility", "hidden"));
                })
                .on("mousemove", function(d, i){
                  return tooltip.style("top", event.clientY -
                                       param.height / 8 + "px")
                                .style("left", event.clientX + "px");
                })

                // extra interactivity for mouse clicking
                .on("click", function(d){
                  var thisBar = d3.select(this);
                  if (thisBar.style("opacity") === "0.5") {
                    bars.attr("stroke", "black")
                        .attr("opacity", "1");
                    currentState = "Nederland";
                    pieUpdate(allData, "Nederland", year);
                  }
                  else {
                    bars.attr("stroke", "black")
                        .attr("opacity", "1");
                    thisBar.attr("stroke", "#e6550d")
                           .attr("opacity", "0.5");
                    currentState = d;
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
          .attr("fill", "#e6550d")
        return (tooltip.style("visibility", "visible")
                       .text(allData[year][d][key]));
      })
      .on("mouseout", function(){
        d3.select(this)
          .attr("fill", "#0570b0")
        return (tooltip.style("visibility", "hidden"));
      })
      .on("mousemove", function(d, i){
        return tooltip.style("top", event.clientY -
                             param.height / 8 + "px")
                      .style("left", event.clientX + "px");
      })
      .on("click", function(d){
        var thisBar = d3.select(this);
        if (thisBar.style("opacity") === "0.5") {
          bars.attr("stroke", "black")
              .attr("opacity", "1");
          currentState = "Nederland";
          pieUpdate(allData, "Nederland", year);
        }
        else {
          bars.attr("stroke", "black")
              .attr("opacity", "1");
          thisBar.attr("stroke", "#e6550d")
                 .attr("opacity", "0.5");
          currentState = d;
          pieUpdate(allData, d, year);
        };
      });

     // upate the axes
     svg.select("#yAxis").transition().call(d3.axisLeft(scales[1]));
     svg.select("#xAxis")
        .transition()
        .call(d3.axisBottom(scales[0])).selectAll("text")
        .style("text-anchor", "end")
        .attr("class", "text")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
          return "rotate(-65)"
        });
};


function chartpie(allData, name, year) {
  /*
  Make donut chart + legend + title
  Donut source: https://codepen.io/alexmorgan/pen/XXzpZP
  */

  // define global current state
  currentState = name;

  // create scale
  colorScale = d3.scaleOrdinal()
                 .range(colorbrewer.Blues[5]);

  // put needed data into lists
  var dataSet = allData[year][name];
  var data = [];
  var dataKeys = [];
  for (key in dataSet) {
    dataKeys.push(key.split('/')[2]);
    data.push(dataSet[key])
  };
  var total = data[0];
  data = data.slice(1);
  data.push(total - data.reduce(function(a, b) { return parseInt(a) +
                                                 parseInt(b); }, 0));
  dataKeys = dataKeys.slice(1);
  dataKeys.push("Other");

  // append group to svg
  group = svgTwo.append("g")
                .attr("transform",
                      "translate("+[(param.width + margin.left +
                                     margin.right) / 4,
                                    (param.height + margin.top +
                                     margin.bottom) / 2]+")");

  // define arc
  arc = d3.arc()
          .innerRadius(param.radius * 0.5)
          .outerRadius(param.radius);

  // define the pie
  pie = d3.pie()
          .padAngle(.02)
          .value(function(d) {return d});

  // create arcs with the data
  var arcs = group.selectAll("arc")
                  .data(pie(data))
                  .enter()
                  .append("g")
                  .attr("class", "arc");

  // fill the arcs
  arcs.append("path")
      .attr("d", arc)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", function(d) {return colorScale(d.data)})

      // interactivity for mouse hovering (how value and change color bar)
      .on("mouseover", function(d){
        d3.select(this)
          .attr("stroke", "#e6550d")
        return (tooltip.style("visibility", "visible")
                       .text(d.data));
      })
      .on("mouseout", function(){
        d3.select(this)
          .attr("stroke", "black")
        return (tooltip.style("visibility", "hidden"));
      })
      .on("mousemove", function(d, i){
        return tooltip.style("top", event.clientY -
                             param.height / 8 + "px")
                      .style("left", event.clientX + "px");
      });

  // add title
  svgTwo.append("text")
        .attr("class", "text")
        .attr("id", "pieTitle")
        .attr("transform",
              "translate("+[margin.left / 2, margin.top / 2]+")")
        .style("font-weight", "bold")
        .style("font-size", "20")
        .text("Distribution births with a non-western migration background of " +
              name + " (total births: " + total + ")");

  // create legend
  svgTwo.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate("+[4 * (param.width + margin.left) / 9,
                                         (param.height + margin.top +
                                          margin.bottom) / 6]+")");
  var legend = d3.legendColor()
                 .labelFormat(d3.format(".0f"))
                 .scale(colorScale)
                 .labels(dataKeys)
                 .shapePadding(5)
                 .shapeWidth(50)
                 .shapeHeight(20)
                 .labelOffset(12);

  svgTwo.select(".legendOrdinal")
        .call(legend);
};


function pieUpdate(allData, name, year) {
  /*
  Update pie chart
  */

  // put needed data into lists
  var dataSet = allData[year][name];
  var data = [];
  for (key in dataSet) {
    data.push(dataSet[key])
  };
  var total = data[0];
  data = data.slice(1);
  data.push(total - data.reduce(function(a, b) { return parseInt(a) +
                                                 parseInt(b); }, 0));

  // if not available reset
  if (data[0] === "") {
    return pieUpdate(allData, "Nederland", year);
  };

  // create arcs with the data
  var arcs = group.selectAll("path")
                  .data(pie(data))
                  .transition()
                  .attr("d", arc);

  // update title
  d3.select("#pieTitle")
    .transition()
    .attr("class", "text")
    .text("Distribution births with a non-western migration background of " +
          name + " (total births: " + total + ")");
};
