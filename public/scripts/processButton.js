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
  
  points = generatePoints(config.pointsCNT, 5, 5, 995, 595);
  visualizePoint();

  epochs = null;
}

  
async function processVisualizeButton() {
  document.querySelectorAll('.input-modifiers').forEach((value) => {
    console.log(value.className);
    config[value.className.split(' ')[1].split('input-')[1] + "CNT"] = parseInt(value.value, 10);
  });

  if (config.points != prevPoints) {
    document.querySelector('.points-visualization').innerHTML = '';
    points = generatePoints(config.pointsCNT, 5, 5, 995, 595);
    visualizePoint();
  }
  
  processClearButton();
  await runCppProgram(generateResponse());
  stopFetching = fetchPopulationCyclically(interval);
  isStarted = true;
}


let prevPoints = config.pointsCNT;

const modifier = document.querySelector('.modifiers');
[ 'Points', 'Populations', 'Epochs', 'Output Epoch' ].forEach((value) => {
  const changedVal = value.toLowerCase().split(' ')[0];
  modifier.insertAdjacentHTML('beforeend', `
  <p>
    ${value}:
    <input class="input-modifiers input-${changedVal}" type="range" min="1" max="100" step="1" value="${config[changedVal + "CNT"]}">
  </p>
  `);
})