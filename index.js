const fs = require('fs');
const path = require('path');

//
// Обработать аргументы запуска
// - на первом месте указывать исходную папку
// - на втором месте указывать результирующую папки
// - флаг -d для удаления исходной папки
//
const args = process.argv.slice(2);

let source;
let dest;
let deleteSource = false;

for (const arg of args) {
  if (arg === '-d') {
    deleteSource = true;
  } else if (!source) {
    source = arg;
  } else {
    dest = arg;
  }
}

// Бросить ошибку, если нет исходной или результирующей папки
if (!source || !dest) {
  throw new Error('You did not specify both source and destination folders');
}

// Запускаем работу
collectFiles(source, dest, deleteSource);

function collectFiles (sourceDir, resultDir, deleteSource = null) {
  // Получаем список файлов директории
  fs.readdir(sourceDir, function (err, files) {
    if (err) throw err;

    for (const i in files) {
      const filePath = path.join(sourceDir, files[i]);

      fs.stat(filePath, function (err, stats) {
        if (err) throw err;

        if (stats.isDirectory()) {
          // Если файл является директорией,
          // то рекурсивно отправляем ее на обработку этой же функцией

          collectFiles(filePath, resultDir, deleteSource);
        } else if (stats && stats.isFile()) {
          // Если файл является файлов, то копируем его
          // в соответствующий каталог

          const firstLetter = files[i].substring(0, 1).toUpperCase();
          const destDir = path.join(resultDir, firstLetter);
          const newFile = path.join(resultDir, firstLetter, files[i]);

          // Создаем директорию с буквой алфавита
          // { recursive: true } - для "мягкого" создания
          fs.mkdir(destDir, { recursive: true }, function (err) {
            if (err) throw err;

            // Копируем файл
            console.log(`Copying file from ${filePath} to ${newFile}`);
            fs.copyFile(filePath, newFile, 0, function (err) {
              if (err) throw err;
            });
          });
        }
      });
    }
  });
}
