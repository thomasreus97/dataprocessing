// select data file and do XMLHttpRequest
var fileName = "KNMI_19601231.json";
var txtFile = new XMLHttpRequest();

// global graph variables
var GRAPH_TOP = 100;
var GRAPH_BOTTOM = 500;
var GRAPH_LEFT = 100;
var GRAPH_RIGHT = 1198;
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec', ''];

// when XMLHttpRequest is finished run function
txtFile.onreadystatechange = function() {
    if (txtFile.readyState === 4 && txtFile.status == 200) {

        // create json object
        jsonObject = JSON.parse(txtFile.responseText);

        // get data from jsonObject
        data = dataCollector(jsonObject);

        // make the canvas
        canvasMaking(data);

        // cross-hair
    };
};
txtFile.open("GET", fileName, true);
txtFile.send();


// collect data from json file and format
function dataCollector(obj) {
  // collect keys
  objectList = Object.keys(obj);
  objectKeyList = Object.keys(obj[objectList[0]]);
  min = objectKeyList[0];
  max = objectKeyList[1];

  // create empty arrays for x and y
  xArr = [];
  yArrMin = [];
  yArrMax = [];

  // fill arrays with data
  var i;
  for(i = 0; i < objectList.length; i++){
    xArr.push(Number(objectList[i]));
    yArrMin.push(obj[objectList[i]][min]);
    yArrMax.push(obj[objectList[i]][max]);
  };

  // calculate the domains
  var xArrMin = Math.min.apply(null, xArr);
  var xArrMax = Math.max.apply(null, xArr);
  var dateMin = dateConverter(xArrMin);
  var dateMax = dateConverter(xArrMax);
  xDomain = [dateMin.getTime(), dateMax.getTime()];
  yDomain = [Math.min.apply(null, yArrMin),
             Math.max.apply(null, yArrMax)];
  xRange = [GRAPH_LEFT, GRAPH_RIGHT];
  yRange = [GRAPH_BOTTOM, GRAPH_TOP];

  // transfor the data
  xData = transformData(xArr, xDomain, xRange, true);
  yMinData = transformData(yArrMin, yDomain, yRange);
  yMaxData = transformData(yArrMax, yDomain, yRange);

  // return the data
  return [xData, yMinData, yMaxData, yDomain, xArr, yArrMin, yArrMax];
};


// convert date stringinto date type object
function dateConverter(date){
  date = date.toString();
  var year = date[0] + date[1] + date[2] + date[3];
  var month = date[4] + date[5];
  var day = date[6] + date[7];
  return new Date(Number(year), Number(month)-1, Number(day));
};


// use createtransform function on array
function transformData(dataInput, domain, range, date=false){
  // empty list
  var i;
  var input;
  dataList = [];

  // create transformfunction with createtransform
  transformFunction = createTransform(domain, range);

  // transform data, convert when date
  for(i = 0; i < dataInput.length; i++){
    if (date == true){
      input = dateConverter(dataInput[i]).getTime();
    }
    else{
      input = dataInput[i];
    };
    dataList.push(transformFunction(x=input));
  };
  return dataList;
};


function createTransform(domain, range){
  /* domain is a two-element array of the data bounds [domain_min, domain_max]
     range is a two-element array of the screen bounds [range_min, range_max]
     this gives you two equations to solve:
     range_min = alpha * domain_min + beta
     range_max = alpha * domain_max + beta
     a solution would be:
  */
  var domain_min = domain[0];
  var domain_max = domain[1];
  var range_min = range[0];
  var range_max = range[1];

  // formulas to calculate the alpha and the beta
  var alpha = (range_max - range_min) / (domain_max - domain_min);
  var beta = range_max - alpha * domain_max;

  // returns the function for the linear transformation (y= a * x + b)
  return function(x){
    return alpha * x + beta;
  };
};


// function that makes the canvas
function canvasMaking(data){
  if (document.getElementById('myCanvas')) {

    // create context (2d)
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");

    // create vertical lines / ticks
    var yDomainStep = (data[3][1] - data[3][0]) / 10;
    var textTick = data[3][1];
    for (var y = GRAPH_TOP; y < GRAPH_BOTTOM + 1; y += (GRAPH_BOTTOM - GRAPH_TOP)/10) {
      ctx.moveTo(GRAPH_LEFT, y);
      ctx.lineTo(GRAPH_RIGHT, y);
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(parseInt(textTick) / 10, GRAPH_LEFT - 30, y);
      textTick -= yDomainStep;
    };
    ctx.strokeStyle = "#8D8A8A";
    ctx.stroke();

    // create axis
    ctx.beginPath();
    ctx.moveTo(GRAPH_LEFT, GRAPH_BOTTOM);
    ctx.lineTo(GRAPH_RIGHT, GRAPH_BOTTOM);
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // title
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("Min and Max temperature on Schiphol in 1960", GRAPH_RIGHT / 4.5,
                  GRAPH_TOP - 40);
    ctx.stroke();

    // x label
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("Time (Months)", GRAPH_RIGHT / 2 + 2, GRAPH_BOTTOM + 40);
    ctx.stroke();

    // y label
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("Temperature (Celsius)", GRAPH_LEFT - 75, GRAPH_TOP - 35);
    ctx.stroke();

    // x ticks
    var i = 0;
    for (var x = GRAPH_LEFT; x < GRAPH_RIGHT + 1; x += (GRAPH_RIGHT - GRAPH_LEFT)/12) {
      ctx.moveTo(x, GRAPH_BOTTOM);
      ctx.lineTo(x, GRAPH_BOTTOM + 10);
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(MONTHS[i], x + 32, GRAPH_BOTTOM + 15);
      i += 1;
    };
    ctx.stroke();

    // plot the line graphs
    lineGraph(data[0], data[1], '#00e', ctx);
    lineGraph(data[0], data[2], '#e00', ctx);

    // make legend
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = '#e00';
    ctx.fillText("Maximum", GRAPH_RIGHT - 100 , GRAPH_TOP + 18);
    ctx.stroke();
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = '#00e';
    ctx.fillText("Minimum", GRAPH_RIGHT - 100 , GRAPH_TOP + 38);
    ctx.stroke();
  };
};


// function to plot a line
function lineGraph(xData, yData, color, ctx){
  ctx.beginPath();

  // iterate over x and y data and draw lines
  var i;
  for (i = 0; i < xData.length - 1; i++){
    ctx.lineJoin = "round";
    ctx.moveTo(xData[i], yData[i]);
    ctx.lineTo(xData[i + 1], yData[i + 1]);
  };

  // color and stroke
  ctx.strokeStyle = color;
  ctx.stroke();
};
