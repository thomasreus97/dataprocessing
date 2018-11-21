// create context (2d)
var canvas = document.getElementById("mouseCanvas");
var ctx = canvas.getContext("2d");
var closestPoint = 0;

// move with left and right button
document.addEventListener('keydown', function(event){
  if (event.keyCode === 37 & closestPoint > 0) {
    closestPoint -= 1;
  }
  else if (event.keyCode === 39 & closestPoint < window.data[0].length - 1) {
    closestPoint += 1;
  };

  // empty the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // plot the cross hair of closest data points
  plotCrossHair(closestPoint);
});

// locate the mouse position on click
canvas.addEventListener("click", function(event) {
  var mousePosition = getPositionMouse(canvas, event);

  // empty the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // get closest point to click
  closestPoint = closestPointChecker(mousePosition);

  // plot the cross hair of closest data points
  plotCrossHair(closestPoint);
});


// function for getting mouse position on the canvas
function getPositionMouse(canvas, event) {
    var area = canvas.getBoundingClientRect();
    return {
        x: event.clientX - area.left,
        y: event.clientY - area.top
    };
};


// finds the closest point to the mouse click
function closestPointChecker(mousePosition) {
  // get data from window
  dataList = window.data;

  // determine the closest datapoint to mouse
  var i;
  var bestI = 0;
  var bestDiff = 100;
  for (i = 0; i < dataList[0].length; i++) {
    newDiff = Math.abs(dataList[0][i] - mousePosition['x']);
    if (newDiff < bestDiff) {
      bestDiff = newDiff;
      bestI = i;
    };
  };

return bestI;
};


// function for drawing crosshair on right positions
function plotCrossHair(bestI) {

  // get data from window
  dataList = window.data;

  var x = dataList[0][bestI];
  var yMin = dataList[1][bestI];
  var yMax = dataList[2][bestI];

  // Draw the cross hair
  ctx.lineWidth = 2;
  var r = 5;

  // circles
  ctx.beginPath();
  ctx.arc(x, yMin, r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, yMax, r, 0, 2 * Math.PI);
  ctx.stroke();

  // vertical line
  ctx.moveTo(x, GRAPH_BOTTOM);
  ctx.lineTo(x, yMin + r);
  ctx.moveTo(x, yMin - r);
  ctx.lineTo(x, yMax + r);
  ctx.moveTo(x, yMax - r);
  ctx.lineTo(x, GRAPH_TOP);

  // horizontal line
  ctx.moveTo(GRAPH_LEFT, yMin);
  ctx.lineTo(x - r, yMin);
  ctx.moveTo(x + r, yMin);
  ctx.lineTo(GRAPH_RIGHT, yMin);
  ctx.moveTo(GRAPH_LEFT, yMax);
  ctx.lineTo(x - r, yMax);
  ctx.moveTo(x + r, yMax);
  ctx.lineTo(GRAPH_RIGHT, yMax);
  ctx.stroke();

  // draw the x and y data next to the lines
  var date = window.data[4][bestI].toString();
  for (var i = 0; i < date.length; i++) {
    var year = date[0] + date[1] + date[2] + date[3];
    var month = date[4] + date[5];
    var day = date[6] + date[7];
  }
  var dateString = year + '/' + month + '/' + day
  var tempMin = window.data[5][bestI] / 10;
  var tempMax = window.data[6][bestI] / 10;

  // type selected data
  ctx.font = "bold 25px sans-serif";
  ctx.fillText(dateString + ": Min = " + tempMin +
               ", Max = " + tempMax, GRAPH_LEFT + 20, GRAPH_BOTTOM + 60);
  ctx.stroke();
};
