const csv = require('csvtojson');
const _ = require('lodash');
const axios = require('axios');

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
  // console.log('fields ; ', fields);
  // console.log('files : ', files.csvFile);

  return csv()
    .fromFile(files.csvFile.path)
    .then((result) => {
      // console.log(result);
      console.log('** : ', result.length);
      
      // Filter the undefined coloumns
      result = _.filter(result, (obj) => {
        if (obj[ROW.DATE] && obj[ROW.ORDER_ID] && obj[ROW.NONPROFIT]
          && obj[ROW.FEE] && obj[ROW.DONATION_CURRENCY] && obj[ROW.DONATION_AMOUNT]) {
            return obj;
          }
      });

      return exports.baseCurrency(fields.currencyType)
        .then((currency) => {
          console.log('change : ', result[9][ROW.DONATION_CURRENCY], currency[result[9][ROW.DONATION_CURRENCY]]);
          console.log('before : ', result[9]);
          
          // Update the currency based on base currency
          _.forEach(result, (obj) => {
              let change = currency[obj[ROW.DONATION_CURRENCY]];
              obj[ROW.DONATION_AMOUNT] = change * obj[ROW.DONATION_AMOUNT];
              obj[ROW.FEE] = change * obj[ROW.FEE];
            });
          
          console.log('** : ', result[9]);
          console.log('********************');
          // Group the result by  non profit
          const groupedNonprofit = _.groupBy(result, ROW.NONPROFIT);
          // console.log('grouped : ', groupedNonprofit);

          const finalResult = {};

          _.forEach(groupedNonprofit, (values, nonProfit) => {
            let totalAmount = 0;
            let totalFee = 0;

            _.forEach(values, (val) => {
              totalAmount += val[ROW.DONATION_AMOUNT];
              totalFee += val[ROW.FEE];
            });

            finalResult[nonProfit] = {
              'Total Amount': totalAmount,
              'Total Fee' :totalFee,
              'Number of Donations': values.length
            };
          });

          console.log('final : ', finalResult);
        });
    });
};