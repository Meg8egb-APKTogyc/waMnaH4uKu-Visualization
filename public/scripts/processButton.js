function processPauseButton() {
  const pauseButton = document.querySelector('.pauseButton');
  if (!pauseButton) return;

  if (!isStarted) {
    pauseButton.textContent = "Pause";
    return;
  }
  
  if (pauseButton.textContent === "Pause") {
    if (stopFetching && typeof stopFetching === 'function') {
      stopFetching();
    }
    pauseButton.textContent = "Resume";
  } else {
    stopFetching = fetchPopulationCyclically(interval);
    pauseButton.textContent = "Pause";
  }
}
  
  
function processClearButton() {
  if (stopFetching && typeof stopFetching === 'function') {
    stopFetching();
  }

  const svgGraph = document.querySelector('.path-visualization');
  svgGraph.innerHTML = '';
  const svgGraphResult = document.querySelector('.correct-path-visualization');
  svgGraphResult.innerHTML = '';

  epochIndex = 0;
  isStarted = false;

  document.querySelector('.pauseButton').textContent = 'Pause';
}
  
  
async function processStartButton() {
  const startButton = document.querySelector('.startButton');
  startButton.disabled = true;
  if (stopFetching && typeof stopFetching === 'function') {
    stopFetching();
  }

  epochIndex = 0;
  isStarted = true;

  document.querySelector('.pauseButton').textContent = 'Pause';
  
  const [result1, result2] = await Promise.all([
    runCppProgramCorrect(generateResponseCorrect()),
    runCppProgram(generateResponse())
  ]);

  visualizeResults(result1, result2);
  visualizeInfo(result1, result2);
  updatePrintEpochs();
  stopFetching = fetchPopulationCyclically(interval);

  startButton.disabled = false;
}
  
  
function processNewPointsButton() {
  processClearButton();
  
  points = generatePoints(config['points']['value'], 5, 5, 995, 595);
  visualizePoint();

  epochs = null;
}

  
async function processVisualizeButton() {
  const visualizeButton = document.querySelector('.visualizeButton');
  visualizeButton.disabled = true;

  if (stopFetching) {
    stopFetching();
    stopFetching = null;
  }

  try {
    document.querySelectorAll('.input-modifiers').forEach((value) => {
      config[value.name.split('modifier-')[1]]['value'] = parseInt(value.value, 10);
    });
    config['output']['max'] = Math.min(config['populations']['value'], config['output']['max']);

    if (config['points']['value'] != prevPoints) {
      document.querySelector('.points-visualization').textContent = '';
      points = generatePoints(config['points']['value'], 5, 5, 995, 595);
      visualizePoint();
    }
    
    processClearButton();

    const [result1, result2] = await Promise.all([
      runCppProgramCorrect(generateResponseCorrect()),
      runCppProgram(generateResponse())
    ]);

    visualizeResults(result1, result2);
    visualizeInfo(result1, result2);
    visualizeTopPopulations();
    isStarted = true;
    stopFetching = fetchPopulationCyclically(interval);

    updatePrintEpochs();
    prevPoints = config['points']['value'];
  } catch (error) {
    console.error('Ошибка:', error);
    isStarted = false; 
  } finally {
    visualizeButton.disabled = false;
  }
}


let prevPoints = config?.points?.value || 0;

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