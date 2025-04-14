const fs = require('fs');
const readline = require('readline');

function getPopulationByIndex(filename, index, callback) {
  const fileStream = fs.createReadStream(filename);
  const rl = readline.createInterface({ input: fileStream });

  let currentIndex = 0;
  let isCallbackCalled = false;

  rl.on('line', (line) => {
    if (currentIndex === index) {
      try {
        const populations = JSON.parse(line);
        if (!isCallbackCalled) {
          isCallbackCalled = true;
          callback(null, populations);
        }
        rl.close();
      } catch (err) {
        if (!isCallbackCalled) {
          isCallbackCalled = true;
          callback(new Error(`Ошибка при парсинге JSON: ${err.message}`), null);
        }
        rl.close();
      }
      return;
    }
    currentIndex++;
  });

  rl.on('close', () => {
    if (!isCallbackCalled && currentIndex <= index) {
      isCallbackCalled = true;
      callback(new Error(`Индекс ${index} выходит за пределы файла`), null);
    }
  });

  fileStream.on('error', (err) => {
    if (!isCallbackCalled) {
      isCallbackCalled = true;
      callback(new Error(`Ошибка при чтении файла: ${err.message}`), null);
    }
  });
}

module.exports = { getPopulationByIndex };