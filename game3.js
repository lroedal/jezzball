

// CANVAS CONSTRUCTOR //
// ================== //
class Canvas {
  constructor () {
    this.level = 0;
    this.canvasElement = $('#canvas');
    this.canvasContext = this.canvasElement[0].getContext('2d');
    this.WIDTH  = 600;
    this.HEIGHT = 400;

    /*
    vanilla JS way
    this.canvasElement = document.getElementById('canvas');
    this.canvasContext = this.canvasElement.getContext('2d');
    */

    this.detectClickEvent();

    this.startLevel()
    this.intervalId = setInterval(this.refreshCanvas.bind(this), 10);
  }
  startLevel () {
    this.level++;
    $('#level').text("LEVEL: " + this.level);
    this.cleared = 0;
    this.x = 0;
    this.y = 0;
    this.w = 600;
    this.h = 400;
    this.wallDirection = 1;
    this.balls = [];
    this.walls = {
      horizontal: [],
      vertical  : []
    };
    this.generateBalls();
    this.clearedArea();
  }

  detectClickEvent  () {
    $('#canvas').on('mouseup', this.generateWalls.bind(this));

    $(document).on('keyup', this.toggleDirection.bind(this));
  };

  generateBalls  () {
    for (var i = 0; i < this.level; i++){
      var x = Math.random() * this.WIDTH
      var y = Math.random() * this.HEIGHT

      this.balls.push(new Ball(x, y));
    }

  };

  clearCanvas  () {
    this.canvasContext.clearRect(0, 0, this.WIDTH, this.HEIGHT);
  };


  drawBalls  () {
    for (var i = 0; i < this.balls.length; i++){
      this.canvasContext.beginPath();
      this.canvasContext.arc(this.balls[i].position.x,this.balls[i].position.y, this.balls[i].radius, 0, Math.PI*2);
      this.canvasContext.fillStyle = '#000';
      this.canvasContext.fill();
      this.canvasContext.closePath();
    }
  };


  refreshCanvas  () {

    this.clearCanvas();
    this.canvasContext.beginPath();
    this.canvasContext.fillStyle = '#fff';
    this.canvasContext.fillRect(this.x, this.y, this.w, this.h);
    this.canvasContext.closePath();
    // this.canvasContext.fill();
    this.updateWalls();
    this.drawBalls();

    this.balls.forEach(function(ball){
      ball.bounce();
    });
  };

  updateWalls  () {
    this.walls.vertical.forEach((wall) => {
      wall.isGrowing = false
      if (wall.position.y - wall.size1 > this.y){
        wall.isGrowing = true
        wall.size1++
      }
      if (wall.position.y + wall.size2 < this.h){
        wall.isGrowing = true
        wall.size2++
      }

      if (!wall.isGrowing) {
        this.checkBallsPosition(wall.position)
      }
    })

    this.walls.vertical = this.walls.vertical.filter(wall =>
      wall.isGrowing === true
    )

    this.walls.vertical.forEach(wall => {
      this.drawWalls('vertical', wall);
    })


    this.walls.horizontal.forEach((wall) => {
      wall.isGrowing = false
      if (wall.position.x - wall.size1 > this.x){
        wall.isGrowing = true
        wall.size1++
      }
      if (wall.position.x + wall.size2 < this.w){
        wall.isGrowing = true
        wall.size2++
      }

      if (!wall.isGrowing) {
        this.checkBallsPosition(wall.position, true)
      }
    });

    this.walls.horizontal = this.walls.horizontal.filter(wall =>
      wall.isGrowing === true
    )

    this.walls.horizontal.forEach(wall => {
      this.drawWalls('horizontal', wall);
    })

  };

  checkBallsPosition (wall, isHorizontal) {

    // Horizontal
    if(isHorizontal) {

      // for (var i = 0; i < this.balls.length; i++){
        if(this.balls[0].position.y < wall.y) {
          this.h = wall.y - this.y;
        }
        else {
          this.y = wall.y;
          this.h -= wall.y;
        }
      // }

    // Vertical
    } else {

      // for (var j = 0; j < this.balls.length; j++){
        if(this.balls[0].position.x < wall.x) {
          this.w = wall.x - this.x;
        }
        else {
          this.x = wall.x;
          this.w -= wall.x;
        }
      // }
    }

    this.clearedArea();
  };

  //TODO i need to make all the walls to grow. Not only the first.
  drawWalls  (type, wall) {
    //draws first half of the wall
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(wall.position.x, wall.position.y);
    if(type === 'horizontal') {
      this.canvasContext.lineTo(wall.position.x + wall.size2, wall.position.y);
    } else {
      this.canvasContext.lineTo(wall.position.x, wall.position.y + wall.size2);
    }

    this.canvasContext.strokeStyle = "red";
    this.canvasContext.stroke();


    //draws second half of the wall
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(wall.position.x, wall.position.y);
    if(type === 'horizontal') {
      this.canvasContext.lineTo(wall.position.x - wall.size1, wall.position.y);
    } else {
      this.canvasContext.lineTo(wall.position.x, wall.position.y - wall.size1);
    }

    this.canvasContext.strokeStyle = "green";
    this.canvasContext.stroke();
  };

  generateWalls  (e) {
    var restMousePosition  = document.getElementById("canvas").getBoundingClientRect();

    var mouse = {
      x: e.clientX - restMousePosition.left,
      y: e.clientY - restMousePosition.top
    };

    // CHECK
    // this.checkBallsPosition(mouse);


    if(this.wallDirection == 1) {

      this.walls.horizontal.push(new Wall(mouse));

    } else {

      this.walls.vertical.push(new Wall(mouse));

    }

    this.changeLevel();
  };

  toggleDirection  (e){
    if(e.keyCode==32){

      this.canvasElement.toggleClass('direction');
      this.wallDirection = this.wallDirection * -1;
    }

  };

  clearedArea  () {

    var startingArea = this.WIDTH * this.HEIGHT;
    var currentGameArea = this.w * this.h;

    this.cleared = Math.floor(100 -(currentGameArea/startingArea*100));
    $('#cleared').text("CLEARED AREA: " + this.cleared + "%");

  };

  changeLevel () {
    if (this.cleared > 80) {
      this.startLevel()
    }
  };

  levelUpReset  () {

  };
}

// BALL  CONSTRUCTOR //
// ================== //
function Ball (x, y) {
  this.position = {
    x,
    y
  };
  this.radius = 10;
  this.speed = {
    x: 3,
    y: 3
  };

  //this.update();
}

Ball.prototype.move = function () {
  this.position.x += this.speed.x;
  this.position.y += this.speed.y;
};

// To make the ball bounce off the walls
Ball.prototype.bounce = function () {
  if (this.position.x > canvas.x + canvas.w - this.radius || this.position.x < canvas.x + this.radius) {
    this.speed.x = - this.speed.x;
  }

  if (this.position.y > canvas.y + canvas.h - this.radius || this.position.y < canvas.y + this.radius) {
    this.speed.y = - this.speed.y;
  }

  this.move();
};

/*
Ball.prototype.update = function () {
  this.intervalId = setInterval(this.bounce.bind(this), 10);
};
*/

// WALL  CONSTRUCTOR //
// ================== //
function Wall (mouse) {
  this.position = {
    x: mouse.x,
    y: mouse.y
  };
  // this.size = {
  //   w: 10,
  //   h: 10
  // };
  this.size1 = 0;
  this.size2 = 0;

  this.isGrowing = true;
}





// INITIALIZE JQUERY  //
// ================== //
var canvas;

$( document ).ready(function() {
    canvas = new Canvas();


});
