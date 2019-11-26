const express = require('express');
const formidable = require('formidable')
const Helper = require('./helper.js')
const csv = require('csv');
const fileSystem = require('fs');
const path = require('path');

const app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.sendFile(`${__dirname}/index.html`);
});

app.post('/submit', function (req, res) {
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    return Helper.getDisbursement(fields, files)
      .then(() => {
        var filePath = path.join(__dirname, 'result.csv');
        var stat = fileSystem.statSync(filePath);

        res.writeHead(200, {
          'Content-Type': 'text/csv',
          'Content-Length': stat.size
        });

        var readStream = fileSystem.createReadStream(filePath);
        // We replaced all the event handlers with a simple call to readStream.pipe()
        readStream.pipe(res);
      })
  })
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})