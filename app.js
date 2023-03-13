// let grid = [];
// let startPos = {x : 0, y : 0}
// let destPos = {x : 0, y : 0}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


class Maze{

  constructor(rows,cols)
  {
      this.grid = [];
      this.rows = rows;
      this.cols = cols;
      this.src = null;
      this.dest = null;
  }


  fill()
  {
    for(let r = 0 ; r < this.rows ; r++)
    {
      const row = [];
      for(let c = 0 ; c < this.cols ; c++)
      {
        row.push(new Cell(c,r));
      }
      this.grid.push(row);
    }
  }

  draw()
  {
    this.fill();
    for(let r = 0 ; r < this.rows ; r++)
    {
      for(let c = 0 ; c < this.cols ; c++)
      {
        const cell = this.grid[r][c].div;
        setTimeout(() => {
          cell.style.opacity = 1;
          container.appendChild(cell);
        }, (r * this.cols + c) * 10);
      }
    }
  }

  addWall(cell)
  {
    const x = parseInt(cell.dataset.index.split(":")[1]) 
    const y = parseInt(cell.dataset.index.split(":")[0]) 
    if (!this.grid[y][x].wall && !this.grid[y][x].src && !this.grid[y][x].dest) {
      cell.classList.add('wall');
      this.grid[y][x].wall = true;
    }
  }

  removeWall(cell)
  {
    const x = parseInt(cell.dataset.index.split(":")[1]) 
    const y = parseInt(cell.dataset.index.split(":")[0]) 
    if (this.grid[y][x].wall )
    {
      this.grid[y][x].wall = false;
      cell.classList.remove('wall');
    } 
  }

}

class Cell{

  constructor(x,y)
  {
    this.x = x;
    this.y = y;
    this.visited = false;
    this.wall = false;
    this.src = false;
    this.dest = false;
    this.div = document.createElement("div");
    this.div.classList.add("cell");
    this.div.setAttribute("data-index",`${y}:${x}`)
  }


}


class DragAndDrop {


  static dragDrop(container, className) {
    const dragEnter = (e) => {
      e.preventDefault();
    };

    const dragOver = (e) => {
      e.preventDefault();
      if (!e.target.classList.contains('wall'))
        e.target.classList.add(className);
    };

    const dragLeave = (e) => {
      if (!e.target.classList.contains('wall'))
        e.target.classList.remove(className);
    };

    const drop = (e) => {
      if (!e.target.classList.contains('wall')) {
        const startDiv = document.querySelector('.start-div');
        const endDiv = document.querySelector('.end-div');
        e.target.classList.add(className);
        const x = parseInt(e.target.dataset.index.split(":")[1]) 
        const y = parseInt(e.target.dataset.index.split(":")[0]) 
        if (className === 'start')
        {
          startDiv.style.pointerEvents = "none";
          maze.grid[y][x].src = true;
          maze.src = maze.grid[y][x];
        }
        else
        {
          endDiv.style.pointerEvents = "none";
          maze.grid[y][x].dest = true;
          maze.dest = maze.grid[y][x];


        }

      }
      container.removeEventListener('dragenter', dragEnter);
      container.removeEventListener('dragover', dragOver);
      container.removeEventListener('dragleave', dragLeave);
      container.removeEventListener('drop', drop);
    };

    container.addEventListener('dragenter', dragEnter);
    container.addEventListener('dragover', dragOver);
    container.addEventListener('dragleave', dragLeave);
    container.addEventListener('drop', drop);
  }
}

const solver = async () => {
  const grid = maze.grid;
  let sourceCell = maze.src;

  const queue = [{ cell: sourceCell, path: [sourceCell] }];
  const visited = new Set([sourceCell]);

  while (queue.length) {

    const { cell, path } = queue.shift();
    if (cell.dest) {
      // Highlight the path
      for (const pathCell of path) {
        await sleep(15);
        if (!(pathCell.src || pathCell.dest))
        pathCell.div.style.backgroundColor = "red";
      }
      return 1;
    }

    const neighbors = getNeighbors(cell, grid);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ cell: neighbor, path: [...path, neighbor] });
      }
    }
    if (!cell.src) {
      // Mark the current cell as visited
      cell.div.style.backgroundColor = "lightblue";
      await sleep(15);
    }
  }
  return 0;
};

function getNeighbors(cell, grid) {
  const { x, y } = cell;
  const top = y != 0 ? grid[y - 1][x] : null;
  const left = x != 0 ? grid[y][x - 1] : null;
  const bottom = y != grid.length - 1 ? grid[y + 1][x] : null;
  const right = x != grid[0].length - 1 ? grid[y][x + 1] : null;
  const neighbors = [top, left, bottom, right];
  return neighbors.filter((neighbor) => neighbor != null && !neighbor.wall);
}

const container = document.querySelector("#grid-container")
const rows = 10 //parseInt(prompt("enter number of rows")) 
const cols = 10 //parseInt(prompt("enter number of cols")) 
const maze = new Maze(rows,cols);
container.style.gridTemplate= `repeat(${rows},1fr) / repeat(${cols},1fr)`
maze.draw();


(function entryPoint() {
  let mouseDown = false;
  let btn = 0;
  const startDiv = document.querySelector('.start-div');
  const endDiv = document.querySelector('.end-div');
  const solveBtn = document.querySelector('.solve');



  startDiv.addEventListener('dragstart', () => {
    DragAndDrop.dragDrop(container, 'start');
  });

  endDiv.addEventListener('dragstart', () => {
    DragAndDrop.dragDrop(container, 'end');
  });

  container.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  container.addEventListener('mousedown', (e) => {
    mouseDown = true;
    btn = e.button;
  });
  container.addEventListener('mousemove', (e) => {
    if (mouseDown) {
      if (btn === 0) {
        maze.addWall(e.target);
      } else {
        maze.removeWall(e.target);
      }
    }
  });
  container.addEventListener('mouseup', () => {
    mouseDown = false;
  });

  solveBtn.addEventListener('click', () => {


    solver();
  });

})();
