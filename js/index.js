var wrap = document.getElementById('wrap');

var commAreaDict = {};
commAreas.forEach(o => commAreaDict[o.name] = o);

function coordsForCommArea(commArea) {
  return {
    x: 50 + (1100 * (commArea.x / 100)),
    y: 50 + (1100 * (1 - (commArea.y / 100)))
  };
}

var commCanvas = document.createElement('canvas');
commCanvas.className = 'comm-canvas';
commCanvas.width = 1200;
commCanvas.height = 1200;

wrap.appendChild(commCanvas);

var filterCommArea = null;

commAreas.forEach(commArea => {
  var commAreaCoords = coordsForCommArea(commArea);

  var commDiv = document.createElement('div');

  commDiv.className = "comm-area";
  commDiv.style.top = commAreaCoords.y + 'px';
  commDiv.style.left = commAreaCoords.x + 'px';

  var labelDiv = document.createElement('div');
  labelDiv.className = "comm-label";

  commDiv.appendChild(labelDiv);

  commDiv.addEventListener('mouseenter', (evt) => {
    console.log(commArea.name);
    filterCommArea = commArea.name;
  });

  commDiv.addEventListener('mouseleave', (evt) => {
    filterCommArea = null;
  });

  labelDiv.innerHTML = commArea.name;

  wrap.appendChild(commDiv);
});



var ctx = commCanvas.getContext('2d');
var commuteBalls = [];

commuteVectors.forEach(v => {
  v.count = parseInt(v.count);

  var startCommArea = commAreaDict[v.start];
  var endCommArea = commAreaDict[v.end];

  if (!endCommArea) {
    console.log('could not find', v.end);
    return;
  }

  var startCommAreaCoords = coordsForCommArea(startCommArea);
  var endCommAreaCoords = coordsForCommArea(endCommArea);

  var x1 = startCommAreaCoords.x;
  var x2 = endCommAreaCoords.x;

  var y1 = startCommAreaCoords.y;
  var y2 = endCommAreaCoords.y;

  var dist = Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );

  var totalBalls = Math.ceil(v.count / 100);
  var spacing = dist / totalBalls;

  Array.from(Array(totalBalls)).forEach((_, n) => {
    commuteBalls.push({
      start : startCommAreaCoords,
      from  : startCommArea.name,
      dist  : Math.ceil(dist),
      end   : endCommAreaCoords,
      to    : endCommArea.name,
      t     : Math.floor(n * spacing),
    });
  });

});

function moveBall(ball) {
  if (ball.t === ball.dist) {
    ball.t = 0;
  } else {
    ball.t += 1;
  }
}

function getBallPosition(ball) {
  const pt = (ball.t / ball.dist);

  const dx = Math.abs(ball.start.x - ball.end.x);
  const vx = (ball.start.x > ball.end.x) ? -1 : 1;

  const dy = Math.abs(ball.start.y - ball.end.y);
  const vy = (ball.start.y > ball.end.y) ? -1 : 1;

  return {
    x: (ball.start.x + (vx * dx * pt)),
    y: (ball.start.y + (vy * dy * pt)),
  };
}

function renderFrame() {
  ctx.clearRect(0, 0, 1200, 1200);

  if (filterCommArea) {
    commuteVectors.forEach(v => {
      if ((v.start === filterCommArea) || (v.end === filterCommArea)) {
        ctx.save();

        var startCommAreaCoords = coordsForCommArea(commAreaDict[v.start]);
        var endCommAreaCoords = coordsForCommArea(commAreaDict[v.end]);

        ctx.beginPath();
        ctx.moveTo(startCommAreaCoords.x, startCommAreaCoords.y);
        ctx.lineTo(endCommAreaCoords.x, endCommAreaCoords.y);

        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ddd';
        ctx.stroke();

        ctx.restore();
      }
    });
  }

  commuteBalls.forEach((ball) => {
    ctx.save();

    moveBall(ball);

    if (!!(filterCommArea)) {
      if ((ball.from !== filterCommArea) && (ball.to !== filterCommArea)) return;

      if (ball.from !== filterCommArea) ctx.fillStyle = 'green';
      if (ball.to !== filterCommArea) ctx.fillStyle = 'red';
    }

    const coords = getBallPosition(ball);


    ctx.translate(coords.x, coords.y);

    ctx.fillRect(0, 0, 2, 2);

    ctx.restore();
  })

  window.requestAnimationFrame(() => setTimeout(renderFrame, 25));
  // setTimeout(renderFrame, 50);
}

renderFrame();
