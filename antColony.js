class AntColony {
  graph = new Graph();
  colony = [];

  colonySize = 20;
  rho = 0.1;
  initPheromone = 1;
  maxIteration = 250;

  iteration = 0;
  minPheromone = null;
  maxPheromone = null;

  iterationBest = null;
  globalBest = null;

  allPaths = [];

  newStep = (tour) => {};

  constructor() {
    //Generar hormigas
    this.createAnts();
  }

  createAnts() {
    //Agregamos las hormigas a la lista
    this.colony = [];
    for (let i = 0; i < this.colonySize; i++) {
      this.colony.push(new Ant(this.graph));
    }
  }

  reset() {
    //Reiniciamos las variables
    this.iteration = 0;
    this.globalBest = null;
    this.resetAnts();
    this.setInitialPheromone(this.initPheromone);
    this.graph.resetPheromone();
  }

  setInitialPheromone() {
    //Se inician los vertices con la feromona inicial
    let edges = this.graph.edges;
    for (let edgeIndex in edges) {
      edges[edgeIndex].initPheromone = this.initPheromone;
    }
  }

  resetAnts() {
    //Reinicio de hormigas
    this.createAnts();
    this.iterationBest = null;
  }

  ready() {
    //Verifica que exista más de un nodo en el grafo
    return this.graph.size() >= 1;
  }

  run() {
    //Si la clase está lista para iniciar
    //entonces se crea un ciclo que itera
    //la cantidad de veces especificada
    if (!this.ready()) return;
    this.iteration = 0;
    while (this.iteration < this.maxIteration) {
      this.step();
    }
  }

  step() {
    if (!this.ready() || this.iteration >= this.maxIteration) {
      return;
    }

    //En cada iteración reiniciamos a nuestras hormigas
    this.resetAnts();

    //Generamos un camino para cada hormiga
    for (var antIndex in this.colony) {
      this.colony[antIndex].run();
    }

    //Obtenemos el mejor camino
    this.getGlobalBest();
    //Actualizamos las feromonas en nuestros vertices
    this.updatePheromone();

    //Aumentamos el numero de iteracion
    this.iteration++;
  }

  updatePheromone() {
    const edges = this.graph.edges;
    //"Evaporamos" las feromonas en base al parametro rho
    for (var edgeIndex in edges) {
      let pheromone = edges[edgeIndex].pheromone;
      edges[edgeIndex].pheromone = pheromone * (1 - this.rho);
    }

    //Se esparsen las feromonas de las hormigas en los vertices
    for (let ant of this.colony) {
      ant.addPheromone();
    }
  }

  getIterationBest() {
    //Se encarga de obtener la hormiga con menor distancia
    //en la iteración actual

    if (this.colony[0].tour == null) return null;

    if (this.iterationBest == null) {
      const best = this.colony[0];
      for (let ant of this.colony) {
        if (best.tour.getDistance() >= ant.tour.getDistance()) {
          this.iterationBest = ant;
          this.allPaths.push(this.iterationBest);
        }
      }
    }

    //Se notifica al visualizador que se encontró un camino nuevo
    this.newStep(this.iterationBest.tour);

    return this.iterationBest;
  }

  getGlobalBest() {
    //Comparamos si la mejor hormiga de la iteración
    //es mejor que la mejor hormiga de todas las iteraciones
    const bestAnt = this.getIterationBest();
    if (bestAnt == null && this.globalBest == null) return null;

    if (bestAnt != null) {
      if (
        this.globalBest == null ||
        this.globalBest.tour.getDistance() >= bestAnt.tour.getDistance()
      )
        this.globalBest = bestAnt;
    }

    return this.globalBest;
  }
}

class Ant {
  graph;

  alpha = 1;
  beta = 3;
  q = 1;
  tour = null;

  currentCity;

  constructor(graph) {
    this.graph = graph;
  }

  reset() {
    this.tour = null;
  }

  init() {
    this.tour = new Tour(this.graph);
    //Establecemos la hormiga en un nodo aleatorio
    let randomNodeIdx = Math.floor(Math.random() * this.graph.size());
    this.currentCity = this.graph.getNode(randomNodeIdx);
    this.tour.addNode(this.currentCity);
  }

  getTour() {
    return this.tour;
  }

  makeNextMove() {
    if (this.tour == null) this.init();

    let rouletteWheel = 0;
    let cities = this.graph.nodes;

    let cityProbabilities = [];

    //Recorremos cada uno de los nodos o ciudades del grafo
    //y generamos una probabilidad de transición para cada una
    for (var index in cities) {
      if (this.tour.contains(cities[index])) continue;
      const edge = this.graph.getEdge(this.currentCity, cities[index]);

      const finalPheromoneWeight = Math.pow(edge.pheromone, this.alpha);
      cityProbabilities[index] =
        finalPheromoneWeight * Math.pow(1.0 / edge.distance, this.beta);
      rouletteWheel += cityProbabilities[index];
    }

    //Se genera un número aleatorio para elegir una ciudad
    let wheelTarget = rouletteWheel * Math.random();
    let wheelPosition = 0.0;
    //Buscamos la ciudad seleccionado
    for (let cityIndex in cities) {
      if (this.tour.contains(cities[cityIndex])) continue;

      wheelPosition += cityProbabilities[cityIndex];

      if (wheelPosition <= wheelTarget) continue;

      //Añadimos al tour la ciudad seleccionada y
      //la establecemos como la ciudad actual de la hormiga
      this.currentCity = cities[cityIndex];
      this.tour.addNode(cities[cityIndex]);
      return;
    }
  }

  tourFound() {
    if (this.tour == null) return false;
    return this.tour.size() >= this.graph.size();
  }

  run() {
    this.reset();
    //Generamos un camino hasta recorrer todos los nodos
    while (!this.tourFound()) {
      this.makeNextMove();
    }
  }

  addPheromone(weight) {
    if (!weight) weight = 1;
    //Calculamos la feromona que se debe añadir al vertice
    let extraPheromone = (this.q * weight) / this.tour.getDistance();

    //Añadimos las feromonas a cada uno de los vertices del camino
    for (let tourIndex = 0; tourIndex < this.tour.size(); tourIndex++) {
      if (tourIndex >= this.tour.size() - 1) {
        let fromCity = this.tour.get(tourIndex);
        let toCity = this.tour.get(0);
        let edge = this.graph.getEdge(fromCity, toCity);
        let pheromone = edge.pheromone;
        edge.pheromone = pheromone + extraPheromone;
      } else {
        let fromCity = this.tour.get(tourIndex);
        let toCity = this.tour.get(tourIndex + 1);
        let edge = this.graph.getEdge(fromCity, toCity);
        let pheromone = edge.pheromone;
        edge.pheromone = pheromone + extraPheromone;
      }
    }
  }
}

class Tour {
  graph;
  tour = [];
  distance = null;

  constructor(graph) {
    this.graph = graph;
  }

  //Cantidad de nodos recorridos
  size() {
    return this.tour.length;
  }

  //verifica si un nodo esta dentro del camino
  contains(node) {
    for (let index in this.tour) {
      if (node.isEqual(this.tour[index])) return true;
    }
  }

  //Se añade un nodo
  addNode(node) {
    //Se establece en null para recalcularla posteriormente
    this.distance = null;
    this.tour.push(node);
  }

  //Se obtiene un nodo del camino en base al indice
  get(index) {
    return this.tour[index];
  }

  getDistance() {
    if (this.distance != null) return this.distance;

    let distance = 0;
    //Se calcula la distancia del camino en base a cada vértice
    for (let i = 0; i < this.tour.length; i++) {
      if (i >= this.tour.length - 1) {
        const edge = this.graph.getEdge(this.tour[i], this.tour[0]);
        distance += edge.distance;
      } else {
        const edge = this.graph.getEdge(this.tour[i], this.tour[i + 1]);
        distance += edge.distance;
      }
    }
    this.distance = distance;

    return this.distance;
  }
}
