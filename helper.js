const csv = require('csvtojson');
const _ = require('lodash');

const ROW = {
  DATE: 'Date',
  ORDER_ID: 'Order Id',
  NONPROFIT: 'Nonprofit',
  DONATION_CURRENCY: 'Donation Currency',
  DONATION_AMOUNT: 'Donation Amount',
  FEE: 'Fee'
};

exports.getDisbursement = function (fields, files) {
  // console.log('fields ; ', fields);
  // console.log('files : ', files.csvFile);

  return csv()
    .fromFile(files.csvFile.path)
    .then((result) => {
      // console.log(result);
      console.log('** : ', result.length);
      
      result = _.filter(result, (obj) => {
        if (obj[ROW.DATE] && obj[ROW.ORDER_ID] && obj[ROW.NONPROFIT]
          && obj[ROW.FEE] && obj[ROW.DONATION_CURRENCY] && obj[ROW.DONATION_AMOUNT]) {
            return obj;
          }
      });

      console.log('result ; ', result.length);
    })
};