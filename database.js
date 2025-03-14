// database.js
const sqlite3 = require('sqlite3').verbose();

// Функция для получения всех популяций по population_id
function getPopulationsByID(population_id, callback) {
    const db = new sqlite3.Database('data.db'); // Подключение к базе данных

    // SQL-запрос для получения данных
    const query = 'SELECT individual FROM epochs WHERE population_id = ?';

    db.all(query, [population_id], (err, rows) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            callback(err, null);
        } else {
            callback(null, rows);
        }
        db.close(); // Закрытие соединения с базой данных
    });
}


function clearDatabase(callback) {
    const db = new sqlite3.Database('data.db'); // Подключение к базе данных

    // SQL-запрос для удаления всех данных из таблицы epochs
    const query = 'DELETE FROM epochs';

    db.run(query, function (err) {
        if (err) {
            console.error('Ошибка при очистке базы данных:', err);
            callback(err);
        } else {
            console.log(`База данных очищена. Удалено ${this.changes} строк.`);
            callback(null);
        }
        db.close(); // Закрытие соединения с базой данных
    });
}


module.exports = { getPopulationsByID, clearDatabase };