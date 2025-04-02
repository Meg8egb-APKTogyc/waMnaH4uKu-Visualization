const  express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const { getPopulationByIndex } = require('./getPopulation');
const app = express();
const port = 3000;


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


app.post('/run-cpp', express.json(), (req, res) => {
  const cppProgramPath = path.join(__dirname, 'public', 'scripts', 'geneticAlgorithm');
  const inputData = req.body.input;

  const cppProcess = spawn(cppProgramPath);
  
  cppProcess.stdin.write(inputData);
  cppProcess.stdin.end();

  let result = '';
  cppProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  cppProcess.on('close', (code) => {
    if (code === 0) {
      res.send(result);
    } else {
      res.status(500).send("Ошибка выполнения программы");
    }
  });
});

app.get('/api/epochs/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  const filename = path.join(__dirname, 'epochs.txt');

  getPopulationByIndex(filename, index, (err, population) => {
    if (err) {
      console.error('Ошибка при получении популяций:', err.message);
      return res.status(500).json({ error: err.message });
    }

    return res.json({ population });
  });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
