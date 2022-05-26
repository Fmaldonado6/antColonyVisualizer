class Graph {
  nodes = [];
  edges = {};

  //Obtener un nodo en base a su índice
  getNode(index) {
    return this.nodes[index];
  }

  //Obtener cantidad de nodos
  size() {
    return this.nodes.length;
  }

  //Añadir nodo
  addNode(x, y) {
    this.nodes.push(new Node(x, y));
  }

  //Añadir vertice
  addEdge(nodeA, nodeB) {
    this.edges[nodeA.toString() + "-" + nodeB.toString()] = new Edge(
      nodeA,
      nodeB
    );
  }

  //Obtener un vértice en base a 2 nodos
  getEdge(nodeA, nodeB) {
    if (this.edges[nodeA.toString() + "-" + nodeB.toString()] != undefined) {
      return this.edges[nodeA.toString() + "-" + nodeB.toString()];
    }
    if (this.edges[nodeB.toString() + "-" + nodeA.toString()] != undefined) {
      return this.edges[nodeB.toString() + "-" + nodeA.toString()];
    }
  }

  //Crear vértices
  createEdges() {
    this.edges = {};
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = 0; j < this.nodes.length; j++) {
        this.addEdge(this.nodes[i], this.nodes[j]);
      }
    }
  }

  //Reiniciar feromonas
  resetPheromone() {
    for (let edge in this.edges) {
      this.edges[edge].resetPheromone();
    }
  }
}

class Node {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  //Convertir a String los valores
  toString() {
    return this.x + "," + this.y;
  }
  //Comparar nodos
  isEqual(node) {
    return this.x == node.x && this.y == node.y;
  }
}

class Edge {
  nodeA;
  nodeB;
  pheromone = 1;
  initalPheromone = 1;
  distance = 0;
  constructor(nodeA, nodeB) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    //Se calcula la distancia entre los nodos
    let deltaX = Math.pow(nodeA.x - nodeB.x, 2);
    let deltaY = Math.pow(nodeA.y - nodeB.y, 2);
    this.distance = Math.sqrt(deltaX + deltaY);
  }
  //Verificar si se encuentra el nodo
  contains(node) {
    if (this.nodeA.x == node.x) return true;
    if (this.nodeB.x == node.x) return true;
    return false;
  }
  //Reiniciar la feromona
  resetPheromone() {
    this.pheromone = this.initalPheromone;
  }
}
