// const fs = require('fs');
// const superagent = require('superagent');

// const readFilePro = (file) => {
//   return new Promise((resolve, reject) => {
//     fs.readFile(file, (err, data) => {
//       if (err) return reject(err);
//       resolve(data);
//     });
//   });
// };

// const writeFilePro = (filePath, data) => {
//   return new Promise((resolve, reject) => {
//     fs.writeFile(filePath, data, (err) => {
//       if (err) return reject('Could not write the file 😥');
//       resolve('success');
//     });
//   });
// };

// readFilePro(`${__dirname}/dog.txt`)
//   .then((data) =>
//     superagent.get(`https://dog.ceo/api/breed/${data}/golden/images/random`)
//   )
//   .then((res) => {
//     const url = res.body.message;
//     console.log('url generated', url);
//     return writeFilePro('dog-img.txt', url);
//   })
//   .then(() => console.log('File written successfully 😎'))
//   .catch((err) => console.log('unable to write the file'));
// // https://dog.ceo/api/breed/retriever/golden/images/random
