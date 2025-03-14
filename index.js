const  express = require('express');
const { spawn } = require('child_process');
const { getPopulationsByID, clearDatabase } = require('./database');
const path = require('path');
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


app.get('/api/populations/:population_id', (req, res) => {
  const population_id = req.params.population_id;
  //console.log(`Запрос данных для population_id = ${population_id}`);

  getPopulationsByID(population_id, (err, data) => {
      if (err) {
          console.error('Ошибка при получении данных:', err);
          res.status(500).json({ error: 'Ошибка при получении данных' });
      } else {
          res.json(data);
      }
  });
});


app.post('/clear-database', (req, res) => {
  clearDatabase((err) => {
      if (err) {
          console.error('Ошибка при очистке базы данных:', err);
          res.status(500).json({ error: 'Ошибка при очистке базы данных' });
      } else {
          console.log('База данных успешно очищена.');
          res.json({ message: 'База данных успешно очищена.' });
      }
  });
});


app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
