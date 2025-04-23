async function runCppProgram(input) {
  try {
    const response = await fetch(`http://localhost:3000/run-cpp-geneticAlgorithm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    const result = await response.text();
    const info = { 
      path: JSON.parse(result.split('\n')[0]), 
      distance: result.split('\n')[1],
      time: result.split('\n')[2]
    };
    return info;
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

async function runCppProgramCorrect(input) {
  try {
    const response = await fetch(`http://localhost:3000/run-cpp-correct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    const result = await response.text();
    const info = {
      path: JSON.parse(result.split('\n')[0]), 
      distance: result.split('\n')[1],
      time: result.split('\n')[2]
    };
    return info;
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

        const extraDelay = (epochIndex + 1 === config.epochs.value) ? 4000 : 0;
        timeoutID = setTimeout(fetchNextPopulation, interval_ + extraDelay);
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

let isStarted = false;
let stopFetching = null;

let epochIndex;

let printEpochs = new Set();

const interval = 150;


async function beginVisualization() {
  points = generatePoints(config.points.value, 5, 5, 1000, 595);
  // console.log(generateResponse());

  epochIndex = 0;

  visualizePoint();
  visualizeTopPopulations();

  const [result1, result2] = await Promise.all([
    runCppProgramCorrect(generateResponseCorrect()),
    runCppProgram(generateResponse())
  ]);

  visualizeResults(result1, result2);
  visualizeInfo(result1, result2);

  updatePrintEpochs();

  console.log(printEpochs);
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

function generateResponseCorrect() {
  let response = `${config['points']['value']}`

  response += '\n';
  
  points.forEach((value) => {
    response += `${value.x} ${value.y} `;
  });

  return response;
}


function visualizePoint() {
  const svgGraph = document.querySelector('.points-visualization');
  svgGraph.innerHTML = points.map(point => 
    `<circle cx="${point.x}" cy="${point.y}" r="3" />`
  ).join('');
}

function visualizeTopPopulations() {
  const svgGraph = document.querySelector('.path-visualization-selector');
  svgGraph.innerHTML = '';

  for (let i = 0; i < config.output.value; ++i) {
    const add = `<line x1="1215" y1="${160 + i * 20}" x2="1275" y2="${160 + i * 20}" stroke="${popularColors[i]}", stroke-width="${6 + (!i) * 2}"/>`;
    svgGraph.insertAdjacentHTML('beforeend', add);
  }

  Array.from(svgGraph.children).forEach((child, index) => {
    child.addEventListener('click', () => {
      if (printEpochs.has(index)) {
        printEpochs.delete(index);
      } else {
        printEpochs.add(index);
      }

      console.log(printEpochs);
      if (isStarted) {
        epochIndex = (epochIndex + config['epochs']['value'] - 1) % config['epochs']['value'];
        fetchPopulation();
      }
    });
  });

  svgGraph.insertAdjacentHTML('afterbegin', `<text x="1275" y="140" fill="grey" text-anchor="end">Epoch top populations:</text>`);
}


function visualizePath(path, color, strokeSize) {
  let polygonPath = "";

  for (let i = 0; i < path.length; ++i) {
    const point = points[path[i]];
    polygonPath += `${point.x},${point.y} `;
  }
  
  return `<polygon points="${polygonPath}" fill="none" stroke="${color}" stroke-width="${strokeSize}"/>`;
}


function visualizeEpoch(population) {
  const svgGraph = document.querySelector('.path-visualization');
  svgGraph.innerHTML = "";

  printEpochs = new Set([...printEpochs].sort((a, b) => a - b));
  printEpochs.forEach((value) => {
    if (population[value]) {
      svgGraph.insertAdjacentHTML('afterbegin', visualizePath(population[value], popularColors[value], 1.5 + (value === 0)));
    }
  })

  const info = document.querySelector('.info-visualization').querySelector('.changable');
  const epochIndexVisual = `<text x="1275" y="560" fill="grey" class="changable" text-anchor="end">Epoch: ${epochIndex + 1}</text>`;

  if (info)
    info.innerHTML = `Epoch: ${epochIndex + 1}`;
  else
    document.querySelector('.info-visualization').insertAdjacentHTML('beforeend', epochIndexVisual);

  return;
}


function visualizeInfo(info1, info2) {
  const svgGraph = document.querySelector('.info-visualization');

  svgGraph.innerHTML = `
    <text x="1275" y="580" fill="grey" text-anchor="end">Executed in: ${info1.time} and ${info2.time} ms</text>
    <text x="1275" y="600" fill="grey" text-anchor="end">Distance: ${info1.distance} and ${info2.distance}</text>`;
}


function visualizeResults(info1, info2) {
  const svgGraph = document.querySelector('.correct-path-visualization');
  svgGraph.innerHTML = visualizePath(info1.path, 'rgba(255, 0, 0, 0.5)', 5) +
   visualizePath(info2.path, 'rgba(0, 255, 0, 0.5)', 6);

  const svgGraphSelector = document.querySelector('.correct-path-visualization-selector');
  svgGraphSelector.innerHTML = `
    <line x1="1215" y1="55" x2="1275" y2="55" stroke="rgba(255, 0, 0, 0.5)", stroke-width="10"/>
    <line x1="1215" y1="90" x2="1275" y2="90" stroke="rgba(0, 255, 0, 0.5)", stroke-width="10"/>
  `;

  const paths = svgGraph.children; // Сохраняем ссылку
  Array.from(svgGraphSelector.children).forEach((child, index) => {
    child.addEventListener('click', () => {
      paths[index].classList.toggle('result-path-visible');
    });
  });

  svgGraphSelector.insertAdjacentHTML('afterbegin', `<text x="1275" y="20" fill="grey" text-anchor="end">Result paths:</text>`);
}


function updatePrintEpochs() {
  printEpochs.clear();

  for (let i = 0; i < config['output']['value']; ++i) {
    printEpochs.add(i);
  }
}

beginVisualization();


window.addEventListener('unload', () => {
  if (stopFetching) stopFetching();
});