function processPauseButton() {
  const pauseButton = document.querySelector('.pauseButton');

  if (!isStarted) {
    pauseButton.innerHTML = "Pause";
    return;
  }
  
  console.log(pauseButton.innerHTML);
  if (pauseButton.innerHTML === "Pause") {
    stopFetching();
    pauseButton.innerHTML = "Resume";
  } else {
    stopFetching = fetchPopulationCyclically(interval);
    pauseButton.innerHTML = "Pause";
  }
}
  
  
function processClearButton() {
  stopFetching();

  const svgGraph = document.querySelector('.path-visualization');
  svgGraph.innerHTML = '';

  epochIndex = 0;
  isStarted = 0;

  processPauseButton();
}
  
  
async function processStartButton() {
  stopFetching();

  epochIndex = 0;
  isStarted = 1;

  document.querySelector('.pauseButton').innerHTML = 'Pause';
  
  await runCppProgram(generateResponse());
  
  stopFetching = fetchPopulationCyclically(interval);
}
  
  
function processNewPointsButton() {
  processClearButton();
  
  points = generatePoints(config['points']['value'], 5, 5, 995, 595);
  visualizePoint();

  epochs = null;
}

  
async function processVisualizeButton() {
  document.querySelectorAll('.input-modifiers').forEach((value) => {
    config[value.name.split('modifier-')[1]]['value'] = parseInt(value.value, 10);
  });
  config['output']['max'] = Math.min(config['populations']['value'], config['populations']['max']);

  if (config['points']['value'] != prevPoints) {
    document.querySelector('.points-visualization').innerHTML = '';
    points = generatePoints(config['points']['value'], 5, 5, 995, 595);
    visualizePoint();
  }
  
  processClearButton();
  console.log(generateResponse());
  await runCppProgram(generateResponse());
  visualizeTopPopulations();
  stopFetching = fetchPopulationCyclically(interval);
  isStarted = true;
  prevPoints = config['points']['value'];
}


let prevPoints = config['points']['value'];

const modifier = document.querySelector('.modifiers');
for (let key in config) {
  modifier.insertAdjacentHTML('beforeend', `
    <p>
      ${config[key]['name']}:
      <input 
        class="input-modifiers" 
        name="modifier-${key}"
        type="range" 
        min="${config[key]['min']}" 
        max="${config[key]['max']}" 
        step="1" 
        value="${config[key]['value']}">
    </p>
    `);
}