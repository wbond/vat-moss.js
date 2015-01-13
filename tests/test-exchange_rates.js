var Big = require('big.js');
var dataprovider = require('nodeunit-dataprovider');
var vatMoss = require('../vat-moss.js');

exports.format = dataprovider(
    [
        ['BGN', '4101.79', '4,101.79 Lev'],
        ['CZK', '4101.79', '4.101,79 Kč'],
        ['DKK', '4101.79', '4.101,79 Dkr'],
        ['EUR', '4101.79', '€4.101,79'],
        ['GBP', '4101.79', '£4,101.79'],
        ['HRK', '4101.79', '4.101,79 Kn'],
        ['HUF', '4101.79', '4.101,79 Ft'],
        ['NOK', '4101.79', '4.101,79 Nkr'],
        ['PLN', '4101.79', '4 101,79 Zł'],
        ['RON', '4101.79', '4.101,79 Lei'],
        ['SEK', '4101.79', '4 101,79 Skr'],
        ['USD', '4101.79', '$4,101.79'],
    ],

    function (test, data) {
        var res = vatMoss.exchangeRates.format(Big(data[1]), data[0]);
        test.strictEqual(data[2], res);
        test.done();
    }
);
