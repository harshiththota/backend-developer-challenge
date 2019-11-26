const express = require('express');
const formidable = require('formidable')
const Helper = require('./helper.js')

const app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.sendFile(`${__dirname}/index.html`);
});

app.post('/submit', function (req, res) {
  new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error', err)
      throw err
    }
    console.log('fields : ', fields);
    console.log('files : ', files);
    return Helper.getDisbursement(fields, files)
      .then((result) => {
        console.log('result : ', result);
        res.send(' Submitted Successfully!');
      })
  })
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})