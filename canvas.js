class ACOCanvas {
  ctx;
  canvas;
  aco;

  edgesEnabled = true;

  paths = [];
  finalPath;

  constructor(ctx, canvas, aco) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.aco = aco;

    canvas.onmousedown = (e) => this.addNode(e);
    this.draw();

    aco.newStep = (e) => this.onNewStep(e);
    aco.onFinalPathFound = (e) => this.onFinalPathFound(e);
  }

  addNode(e) {
    this.finalPath = null;
    this.aco.graph.addNode(e.clientX, e.clientY);
    this.aco.graph.createEdges();
    this.aco.reset();
    this.draw();
  }

  async run() {
    if (!this.aco.ready()) return;
    this.aco.iteration = 0;
    while (this.aco.iteration < this.aco.maxIteration) {
      this.aco.step();
      await delay(5);
    }
    this.onFinalPathFound(this.aco.globalBest.tour);
  }

  onNewStep(tour) {
    this.paths.push(tour);
    this.draw();
  }

  onFinalPathFound(finalPath) {
    this.finalPath = finalPath;
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.edgesEnabled) this.drawEdges();
    this.drawFinalPath();
    this.drawNodes();
  }

  drawNodes() {
    const nodes = this.aco.graph.nodes;

    for (let node of nodes) {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  drawFinalPath() {
    if (this.finalPath == null) return;
    this.finalPath.tour.push(this.finalPath.tour[0]);
    this.drawPath(this.finalPath.tour, "red");
  }

  drawEdges() {
    const edges = this.aco.graph.edges;
    let alpha = 0.2;
    let width = 1;
    let totalPheromone = 0;

    for (let edgeIndex in edges) {
      totalPheromone += edges[edgeIndex].pheromone;
    }

    for (let edgeIndex in edges) {
      if (this.aco.iteration > 0) {
        alpha =
          (edges[edgeIndex].pheromone / totalPheromone) *
            this.aco.graph.size() +
          0.05;

        if (alpha > 1) {
          alpha = 1;
        }
      }

      this.drawLine(
        edges[edgeIndex].nodeA,
        edges[edgeIndex].nodeB,
        `rgba(0,102,255,${alpha})`,
        width
      );
    }
  }

  disableEdges() {
    this.edgesEnabled = !this.edgesEnabled;
    this.draw();
  }

  drawPath(tour, color = "gray") {
    for (let i = 1; i < tour.length; i++) {
      const previous = tour[i - 1];
      const current = tour[i];
      this.drawLine(previous, current, color, 2);
    }
  }

  drawLine(node1, node2, color, width) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(node1.x, node1.y);
    this.ctx.lineTo(node2.x, node2.y);
    this.ctx.stroke();
  }
}

function delay(ms) {
  return new Promise((res, reject) => {
    setTimeout(res, ms);
  });
}
