var dataprovider = require('nodeunit-dataprovider');
var vatMoss = require('../vat-moss.js');

exports.countryName = dataprovider(
    [
        ['US',     'United States'],
        ['GB',     'United Kingdom'],
    ],

    function (test, data) {
        var res = vatMoss.countryName(data[0]);
        test.strictEqual(data[1], res);
        test.done();
    }
);
