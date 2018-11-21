if (document.getElementById("secondCanvas")) {
  var canvas = document.getElementById("secondCanvas");
  var ctx = canvas.getContext('2d');
  var windowWidth = document.body.offsetWidth;
  var windowHeight = document.body.offsetHeight;
  var centerx = windowWidth/2;
  var centery = windowHeight/2;
  canvas.width = document.body.offsetWidth;
  canvas.height = document.body.offsetHeight;
  var mousex,mousey;
  var drawing = true;

  function init(){

    canvas.addEventListener("mousedown", function(e) {
      canvas.addEventListener('mousemove', drawCrosshair, false);
    });
    canvas.addEventListener("mouseup",function(e){
      canvas.removeEventListener('mousemove', drawCrosshair, false);
      // ctx.clearRect(0,0,canvas.width,canvas.height);
    });

  };//init()

  function mousePosUpdate(e){
    mousex = e.clientX;
    mousey = e.clientY;
  };

  function draw(startPoint,midPoint,endPoint){
    var randomColour = '#'+Math.random().toString(16).substr(-6);;
    ctx.beginPath();
    ctx.moveTo(startPoint[0], startPoint[1]);
    ctx.lineTo(midPoint[0], midPoint[1]);
    ctx.lineTo(endPoint[0], endPoint[1]);
    ctx.fillStyle= "transparent";
    ctx.stroke();
    ctx.fill();
  };

  function drawCrosshair(e){//[x,y]
    mousePosUpdate(e);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    draw([0,0],[windowWidth,0],[mousex,mousey]);
    draw([windowWidth,0],[windowWidth,windowHeight],[mousex,mousey]);
    draw([windowWidth,windowHeight],[0,windowHeight],[mousex,mousey]);
    draw([0,windowHeight],[0,0],[mousex,mousey]);
  };

  window.onload = function(){
    init();
  };
};
