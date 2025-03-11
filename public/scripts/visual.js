async function runCppProgram(input) {
  try {
    const response = await fetch(`http://localhost:3000/run-cpp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    let result = await response.text();
    result = result.split(' ').map(Number);
    
    let changedResult = [];
    for (let i = 0; i < epochCNT; ++i) {
      let population = [];
      for (let j = 0; j < outputPopulationCNT; ++j) {
        let individ = [];
        for (let k = 0; k < pointsCNT; ++k) {
          individ.push(result[i * outputPopulationCNT * pointsCNT + j * pointsCNT + k]);
        }
        population.push(individ);
      }
      changedResult.push(population);
    }

    return changedResult;
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

let epochCNT;
let outputPopulationCNT;
let pointsCNT;
let populationCNT;

let points;
let epochs;

let timeoutID;
let epochIndex = 0;

let isStarted;


async function main() {
  epochCNT = 50;  
  outputPopulationCNT = 1;
  pointsCNT = 10;
  populationCNT = 20;

  points = generatePoints(pointsCNT, 5, 5, 995, 595);
  console.log(generateResponse());
  epochs = await runCppProgram(generateResponse());
  console.log(epochs);

  visualisePoint();

  isStarted = true;
  visualiseEpoch();
}


function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}


function generatePoints(num, x1, y1, x2, y2) {
  let a = [];

  for (let i = 0; i < num; ++i) {
    let x = randomInteger(x1, x2), y = randomInteger(y1, y2);
    a.push({ 
      x,
      y
    });
  }
  return a;
}


function generateResponse() {
  let response = `${pointsCNT} ${populationCNT} ${epochCNT} ${outputPopulationCNT} `;
  
  points.forEach((value) => {
    response += `${value.x} ${value.y} `;
  });

  return response;
}


async function visualisePoint() {
  const svgGraph = document.querySelector('.points-visualisation');

  let newInner = "";
  for (let i = 0; i < points.length; ++i) {
    const point = points[i];
    newInner += `<circle cx="${point.x}" cy="${point.y}" r="3" />`;
  }

  svgGraph.innerHTML = newInner;
}


function visualisePath(path, strokeSize) {
  const svgGraph = document.querySelector('.path-visualisation');

  let polygonPath = "";
  for (let i = 0; i < path.length; ++i) {
    const point = points[path[i]];
    polygonPath += `${point.x},${point.y} `;
  }
  
  svgGraph.innerHTML += `<svg width="1000" height="600">><polygon points="${polygonPath}" fill="none" stroke="pink" stroke-width="${strokeSize}"/></svg>`;
}


function visualisePopulation() {
  const svgGraph = document.querySelector('.path-visualisation');
  svgGraph.innerHTML = '';

  let population = epochs[epochIndex];
  for (let i = 0; i < outputPopulationCNT; ++i) {
    const path = [];
    for (let j = 0; j < pointsCNT; ++j) {
      path.push(Number(population[i][j]));
    }

    visualisePath(path, (!i) * 1.5 + 1);
  }
  
  epochIndex = (epochIndex + 1) % epochCNT;

  return (epochIndex == 0) ? 1 : 0;
}


function visualiseEpoch() {
  visualisePopulation();
  timeoutID = setTimeout(function visualise() {
    let wait = visualisePopulation();
    console.log(wait);
    timeoutID = setTimeout(visualise, 50 + 5000 * wait);
  }, 50);
} 


function processPauseButton() {
  const pauseButton = document.querySelector('.pauseButton');

  if (!isStarted) {
    pauseButton.innerHTML = "Pause";
    return;
  }
  
  console.log(pauseButton.innerHTML);
  if (pauseButton.innerHTML === "Pause") {
    clearTimeout(timeoutID);
    pauseButton.innerHTML = "Resume";
  } else {
    visualiseEpoch();
    pauseButton.innerHTML = "Pause";
  }
}


function processClearButton() {
  clearTimeout(timeoutID);

  const svgGraph = document.querySelector('.path-visualisation');
  svgGraph.innerHTML = '';

  epochIndex = 0;
  isStarted = 0;

  processPauseButton();
}


async function processStartButton() {
  clearTimeout(timeoutID);

  epochIndex = 0;
  isStarted = 1;

  document.querySelector('.pauseButton').innerHTML = 'Pause';
  
  if (!epochs)
    epochs = await runCppProgram(generateResponse());
  visualiseEpoch();
}


function processNewPointsButton() {
  processClearButton();
  
  points = generatePoints(pointsCNT, 5, 5, 995, 595);
  visualisePoint();

  epochs = null;
}


main();
