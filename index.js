const  express = require('express');
const { spawn } = require('child_process')
const path = require('path');
const app = express();
const port = 3000;


app.use(express.static(path.join(__dirname, 'public')));


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



app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
