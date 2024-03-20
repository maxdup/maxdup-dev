import {N} from './config';

function Nodes(){
  // randomly determines nodes to be connected together

  let connectedIdPairs = [];
  this.connections = new Array(N*N).fill(0);

  for (let i = 0; i < N*N; i++){
    this.connections[i] = Math.max(0, Math.floor(Math.random() * 64) - 62);
  }

  let testpair = (id, c) => {
    if (this.connections[c] > 0) {
      connectedIdPairs.push(id);
      connectedIdPairs.push(c);
      return true;
    }
  }

  for (let x = 0; x < N; x++){
    for (let y = 0; y < N; y++){

      let id = x * N + y;

      if (this.connections[id] == 0){ continue }
      let npairs = 0;
      let dist = 0;

      while (npairs < this.connections[id] +1 && dist < N){
        for (let j = 0; j < dist; j++){

          let sy = y + j;
          let sxp = x + dist - j;
          let sxm = x - dist + j;

          if (sy < N && sxp < N && testpair(id, sxp * N + sy)) { npairs++; }
          if (sy < N && sxm >= 0 && testpair(id, sxm * N + sy)) { npairs++; }
        }
        dist++;
      }
    }
  }

  this.offset = 0;
  this.len = connectedIdPairs.length;
  this.idTable = connectedIdPairs;
}
export default Nodes
