const config = {
  points: {
    value: 10,
    min: 1,
    max: 100,
    name: 'Points',
  },
  populations: {
    value: 10,
    min: 1,
    max: 1000,
    name: 'Populations',
  },
  epochs: {
    value: 50,
    min: 1,
    max: 1000,
    name: 'Epochs',
  },
  output: {
    value: 4,
    min: 1,
    max: 10,
    name: 'Output populations',
  }, 
  children: {
    value: 10,
    min: 1,
    max: 1000,
    name: 'Children per generation',
  }, 
  mutation: {
    value: 10,
    min: 1,
    max: 1000,
    name: 'Mutation per generation',
  },
  elite: {
    value: 2,
    min: 1,
    max: 1000,
    name: 'Elite individuals',
  }
};


const popularColors = [
  //"red",          // Красный для правильного результата
  "green",        // Зеленый
  "blue",         // Синий
  "yellow",       // Желтый
  "orange",       // Оранжевый
  "purple",       // Фиолетовый
  "pink",         // Розовый
  "brown",        // Коричневый
  "black",        // Черный
  //"white",        // Белый
  //"gray",         // Серый
  "cyan",         // Голубой
  "magenta",      // Пурпурный
  "lime",         // Лаймовый
  "teal",         // Бирюзовый
  "navy",         // Темно-синий
  "maroon",       // Темно-красный
  "olive",        // Оливковый
  //"silver",       // Серебряный
  "gold",         // Золотой
  "indigo",       // Индиго
  "violet",       // Фиалковый
  "coral",        // Коралловый
  "turquoise",    // Бирюзовый
  "salmon",       // Лососевый
  "khaki",        // Хаки
  "lavender",     // Лавандовый
  "plum",         // Сливовый
  "skyblue",      // Небесно-голубой
  "tomato",       // Томатный
  "orchid",       // Орхидея
  "crimson",      // Малиновый
  "darkcyan",     // Темно-бирюзовый
  "darkorange",   // Темно-оранжевый
  "darkviolet",   // Темно-фиолетовый
  "deeppink",     // Глубокий розовый
  "dodgerblue",   // Синий Доджер
  "forestgreen",  // Лесной зеленый
  "hotpink",      // Ярко-розовый
  "lightblue",    // Светло-голубой
  "lightgreen",   // Светло-зеленый
  "lightpink",    // Светло-розовый
  "lightseagreen",// Светло-морской зеленый
  "mediumblue",   // Средний синий
  "mediumorchid", // Средний орхидейный
  "mediumpurple", // Средний фиолетовый
  "mediumseagreen", // Средний морской зеленый
  "mediumslateblue", // Средний сланцевый синий
  "mediumturquoise", // Средний бирюзовый
  "midnightblue", // Полуночный синий
  "palegreen",    // Бледно-зеленый
  "paleturquoise",// Бледно-бирюзовый
  "peru",         // Перу
  "rosybrown",    // Розово-коричневый
  "royalblue",    // Королевский синий
  "saddlebrown",  // Кожано-коричневый
  "seagreen",     // Морской зеленый
  "sienna",       // Сиена
  "slateblue",    // Сланцевый синий
  "springgreen",  // Весенний зеленый
  "steelblue",    // Стальной синий
  "tan",          // Желто-коричневый
  "thistle",      // Чертополох
  "wheat",        // Пшеничный
];

/*
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Генерируем случайный индекс от 0 до i
    const j = Math.floor(Math.random() * (i + 1));
    // Меняем местами элементы array[i] и array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

popularColors = shuffleArray(popularColors);
*/