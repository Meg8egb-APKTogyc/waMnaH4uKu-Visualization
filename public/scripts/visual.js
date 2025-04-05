async function runCppProgram(input) {
  try {
    const response = await fetch(`http://localhost:3000/run-cpp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    const result = await response.text();
    visualizeExecutionTime(result);
  } catch (error) {
    console.error('Ошибка:', error);
  }
}


function fetchPopulationCyclically(interval_ = 1000) {
  let timeoutID;

  function fetchNextPopulation() {
    fetch(`http://localhost:3000/api/epochs/${epochIndex}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        return response.json();
      })
      .then(data => {
        const populations = data.population;

        // console.log('Получены популяции:', populations);
        visualizeEpoch(populations);

        timeoutID = setTimeout(fetchNextPopulation, interval_ + 4000 * (epochIndex + 1 === config.epochs.value));
        epochIndex = (epochIndex + 1) % config.epochs.value;
      })
      .catch(error => {
        console.error('Ошибка при получении популяции:', error);

        epochIndex = 0;
        timeoutID = setTimeout(fetchNextPopulation, interval_);
      });
  }

  fetchNextPopulation();

  function stopFetching_() {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  }

  return stopFetching_;
}

function fetchPopulation() {
  fetch(`http://localhost:3000/api/epochs/${epochIndex}`)
   .then(response => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      return response.json();
    })
   .then(data => {
      const populations = data.population;

      visualizeEpoch(populations);

      epochIndex = (epochIndex + 1) % config.epochs.value;
    })
   .catch(error => {
      console.error('Ошибка при получении популяции:', error);

      epochIndex = 0;
    });
}

let points;

let isStarted;
let stopFetching;

let epochIndex;

let mainEpoch;

const interval = 150;


async function beginVisualization() {
  points = generatePoints(config.points.value, 5, 5, 1000, 595);
  console.log(generateResponse());

  mainEpoch = -1;
  epochIndex = 0;

  visualizePoint();
  visualizeTopPopulations();

  await runCppProgram(generateResponse());

  isStarted = true;
  stopFetching = fetchPopulationCyclically(interval);
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
  let response = '';
  for (let key in config) {
    response += `${config[key]['value']} `;
  }

  response += '\n';
  
  points.forEach((value) => {
    response += `${value.x} ${value.y} `;
  });

  return response;
}


function visualizePoint() {
  const svgGraph = document.querySelector('.points-visualization');

  let newInner = "";
  for (let i = 0; i < points.length; ++i) {
    const point = points[i];
    newInner += `<circle cx="${point.x}" cy="${point.y}" r="3" />`;
  }

  svgGraph.innerHTML = newInner;
}

function visualizeTopPopulations() {
  const svgGraph = document.querySelector('.top-visualization');
  svgGraph.innerHTML = '';
  svgGraph.insertAdjacentHTML('beforebegin', `<text x="1250" y="20" fill="grey">Top</text>`);
  for (let i = 0; i < config.output.value; ++i) {
    const add = `<line x1="1232.5" y1="${40 + i * 20}" x2="1292.5" y2="${40 + i * 20}" stroke="${popularColors[i]}", stroke-width="${4 + (!i)}"/>`;
    console.log(add);
    svgGraph.insertAdjacentHTML('beforeend', add);
  }

  Array.from(svgGraph.children).forEach((child, index) => {
    console.log(index);
    child.addEventListener('mouseenter', () => {
      mainEpoch = index;
      console.log(index);
      if (isStarted) {
        epochIndex = (epochIndex + config['epochs']['value'] - 1) % config['epochs']['value'];
        fetchPopulation();
      }
    });
    
    child.addEventListener('mouseleave', () => {
      mainEpoch = -1;
      if (isStarted) {
        epochIndex = (epochIndex + config['epochs']['value'] - 1) % config['epochs']['value'];
        fetchPopulation();
      }
    });
  })
}


function visualizePath(path, index, color) {
  let polygonPath = "";
  const strokeSize = (index === 0 && (mainEpoch === -1 || mainEpoch === 0)) ? 2 : 1.5;

  for (let i = 0; i < path.length; ++i) {
    const point = points[path[i]];
    polygonPath += `${point.x},${point.y} `;
  }
  
  return `<polygon points="${polygonPath}" fill="none" stroke="${color}" stroke-width="${strokeSize}">`;
}


function visualizeEpoch(population) {
  const svgGraph = document.querySelector('.path-visualization');
  svgGraph.innerHTML = "";

  if (mainEpoch === -1) {
    for (let i = 0; i < population.length; ++i) {
      svgGraph.insertAdjacentHTML('afterbegin', visualizePath(population[i], i, popularColors[i]));
    }
  }

  if (mainEpoch != -1) {
    svgGraph.insertAdjacentHTML('beforeend', visualizePath(population[mainEpoch], mainEpoch, popularColors[mainEpoch]));
  }

  const info = document.querySelector('.info-visualization').querySelector('.changable');
  const epochIndexVisual = `<text x="1275" y="560" fill="grey" class="changable" text-anchor="end">Epoch: ${epochIndex + 1}</text>`;

  if (info)
    info.innerHTML = `Epoch: ${epochIndex + 1}`;
  else
    document.querySelector('.info-visualization').insertAdjacentHTML('beforeend', epochIndexVisual);

  return;
}


function visualizeExecutionTime(time) {
  const svgGraph = document.querySelector('.info-visualization');

  svgGraph.innerHTML = `<text x="1275" y="580" fill="grey" text-anchor="end">Executed in: ${time} ms</text>`;
}


beginVisualization();
