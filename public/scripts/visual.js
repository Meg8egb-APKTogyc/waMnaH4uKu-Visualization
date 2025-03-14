async function runCppProgram(input) {
  try {
    const response = await fetch(`http://localhost:3000/run-cpp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

async function getPopulationsByID(population_id) {
  try {
      const response = await fetch(`http://localhost:3000/api/populations/${population_id}`);
      if (!response.ok) {
          throw new Error('Ошибка при получении данных');
      }
      const data = await response.json();
      return data;
  } catch (err) {
      console.error('Ошибка:', err);
      return null;
  }
}

async function clearDatabase() {
  try {
      const response = await fetch('http://localhost:3000/clear-database', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Результат очистки базы данных:', result);
  } catch (error) {
      console.error('Ошибка при очистке базы данных:', error);
  }
}


let epochCNT;
let outputPopulationCNT;
let pointsCNT;
let populationCNT;

let points;
let population;

let timeoutID;
let epochIndex = 0;

let isStarted;


async function main() {
  epochCNT = 50;  
  outputPopulationCNT = 1;
  pointsCNT = 10;
  populationCNT = 10;

  points = generatePoints(pointsCNT, 5, 5, 995, 595);
  console.log(generateResponse());

  visualisePoint();

  isStarted = true;
  clearDatabase();
  await runCppProgram(generateResponse());

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
  let response = `${pointsCNT} ${populationCNT} ${epochCNT} `;
  
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
  let polygonPath = "";
  for (let i = 0; i < path.length; ++i) {
    const point = points[path[i]];
    polygonPath += `${point.x},${point.y} `;
  }
  
  return `<svg width="1000" height="600">><polygon points="${polygonPath}" fill="none" stroke="pink" stroke-width="${strokeSize}"/></svg>`;
}


async function visualisePopulation() {
  const svgGraph = document.querySelector('.path-visualisation');

  const population = await getPopulationsByID(epochIndex);
  let newGraph = "";
  for (let i = 0; i < outputPopulationCNT; ++i) {
    const path = JSON.parse(population[0]["individual"]);
    //console.log(path)
    newGraph += visualisePath(path, (!i) * 1.5 + 1);
  }
  
  svgGraph.innerHTML = newGraph;
  epochIndex = (epochIndex + 1) % epochCNT;

  return (epochIndex == 0) ? 1 : 0;
}


function visualiseEpoch() {
  visualisePopulation();
  timeoutID = setTimeout(async function visualise() {
    let wait = await visualisePopulation();
    console.log(wait);
    timeoutID = setTimeout(visualise, 50 + 500 * wait);
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
