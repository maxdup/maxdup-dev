import {N} from './config';

function Grid() {
  // Grid
  let id = 0;
  let ids = new Array((N-1)*(N*2+N-1));
  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      if (x < (N-1)){
        ids[id++] = (x*N+y);
        ids[id++] = ((x+1)*N+y);
      }
      if (x<N-1 && y<N-1){
        ids[id++] = (x*N+y);
        ids[id++] = ((x+1)*N+y+1);
      }
      if (y<N -1){
        ids[id++] = (x*N+y);
        ids[id++] = (x*N+y+1);
      }
    }
  }

  this.offset = 0;
  this.idTable = ids;
  this.len = ids.length;
}
export default Grid
