const graphCanvas = document.getElementById("graphCanvas");
const ctx = graphCanvas.getContext("2d");
graphCanvas.width = window.innerWidth;
graphCanvas.height = window.innerHeight;

const aco = new AntColony();

const canvas = new ACOCanvas(ctx, graphCanvas, aco);

async function execute() {
  aco.reset();
  canvas.run();
}

function drawPath(tour, color = "gray") {
  for (let i = 1; i < tour.length; i++) {
    const previous = tour[i - 1];
    const current = tour[i];
    drawLine(previous, current, color);
  }
}

function drawLine(node1, node2, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = this.width;
  ctx.beginPath();
  ctx.moveTo(node1.x, node1.y);
  ctx.lineTo(node2.x, node2.y);
  ctx.stroke();
}

function disableEdges() {
  canvas.disableEdges();
}
