const csv = require('csvtojson');
const _ = require('lodash');
const axios = require('axios');
const json2csv = require('json2csv').parse;
const fs = require('fs');

const ROW = {
  DATE: 'Date',
  ORDER_ID: 'Order Id',
  NONPROFIT: 'Nonprofit',
  DONATION_CURRENCY: 'Donation Currency',
  DONATION_AMOUNT: 'Donation Amount',
  FEE: 'Fee'
};

exports.baseCurrency = function (base) {
  return axios.get('https://api.exchangeratesapi.io/latest', {
    params: {
      base: _.toUpper(base),
    }
  }).then((res) => {
    return res.data.rates;
  }).catch((error) => {
    console.log('error : ', error);
  });
};

exports.getDisbursement = function (fields, files) {
  return csv()
    .fromFile(files.csvFile.path)
    .then((result) => {    
      // Filter the undefined coloumns
      result = _.filter(result, (obj) => {
        if (obj[ROW.DATE] && obj[ROW.ORDER_ID] && obj[ROW.NONPROFIT]
          && obj[ROW.FEE] && obj[ROW.DONATION_CURRENCY] && obj[ROW.DONATION_AMOUNT]) {
            return obj;
          }
      });

      return exports.baseCurrency(fields.currencyType)
        .then((currency) => {
          // Update the currency based on base currency
          _.forEach(result, (obj) => {
              let change = currency[obj[ROW.DONATION_CURRENCY]];
              obj[ROW.DONATION_AMOUNT] = change * obj[ROW.DONATION_AMOUNT];
              obj[ROW.FEE] = change * obj[ROW.FEE];
            });
          
          // Group the result by  non profit
          const groupedNonprofit = _.groupBy(result, ROW.NONPROFIT);
          
          const finalResult = [];

          _.forEach(groupedNonprofit, (values, nonProfit) => {
            let totalAmount = 0;
            let totalFee = 0;

            _.forEach(values, (val) => {
              totalAmount += val[ROW.DONATION_AMOUNT];
              totalFee += val[ROW.FEE];
            });

            const data = {
              'Nonprofit': nonProfit,
              'Total Amount': totalAmount,
              'Total Fee' :totalFee,
              'Number of Donations': values.length
            };

            finalResult.push(data);
          });

          // Store the data into a file
          const csv = json2csv(finalResult, ['Nonprofit', 'Total Amount', 'Total Fee', 'Number of Donations', ]);
          return new Promise((resolve, reject) => {
            return fs.writeFile('./result.csv', csv, function (err) {
              if (err) throw err;
              console.log('file saved');
              resolve();
            });
          });
        });
    });
};