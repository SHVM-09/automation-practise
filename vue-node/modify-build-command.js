const fs = require('fs')

const packageFilePath = '../../vue/typescript-version/full-version/package.json'

fs.readFile(packageFilePath, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  let result = data.replace(/&& vue-tsc --noEmit /g, '');

  fs.writeFile(packageFilePath, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
})