import json
import sqlite3
import sys

# Чтение данных из JSON-файла
def read_population(population):
    with open("population.json", "w") as file:
        json.dump(population, file)


# Берём максимальный индекс популяции (количество популяций)
def get_max_population_id():
    conn = sqlite3.connect('data.db')
    cursor = conn.cursor()

    # Выполнение запроса для получения максимального значения epoch_id
    cursor.execute('SELECT MAX(population_id) FROM epochs')
    max_epoch_id = cursor.fetchone()[0]
    conn.close()

    return 0 if max_epoch_id == None else max_epoch_id + 1


# Добавление данных в базу данных
def add_to_database(population):
    conn = sqlite3.connect('data.db')
    cursor = conn.cursor()

    # Создание таблицы (если её нет)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS epochs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            population_id INTEGER,
            individual TEXT
        )
    ''')

    # Вставка данных
    population_id = get_max_population_id()
    for individ in population:
        cursor.execute(
            'INSERT INTO epochs (population_id, individual) VALUES (?, ?)',
            [population_id, json.dumps(individ)]
        )

    conn.commit()
    conn.close()


if __name__ == "__main__":
    a = True
    json_data = sys.stdin.read()
    population = json.loads(json_data)
    print(population)
    add_to_database(population)
    print("Данные успешно добавлены в базу данных.")