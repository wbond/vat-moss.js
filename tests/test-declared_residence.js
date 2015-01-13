var Big = require('big.js');
var dataprovider = require('nodeunit-dataprovider');
var vatMoss = require('../vat-moss.js');

exports.calculateRate = dataprovider(
    [
        // Example user input                 Expected result
        ['AT', 'Jungholz',                    Big('0.19'), 'AT', 'Jungholz'],
        ['AT', 'Mittelberg',                  Big('0.19'), 'AT', 'Mittelberg'],
        ['AT', null,                          Big('0.20'), 'AT', null],
        ['BE', null,                          Big('0.21'), 'BE', null],
        ['BG', null,                          Big('0.20'), 'BG', null],
        ['CY', null,                          Big('0.19'), 'CY', null],
        ['CZ', null,                          Big('0.21'), 'CZ', null],
        ['DE', 'Heligoland',                  Big('0.0'),  'DE', 'Heligoland'],
        ['DE', 'Büsingen am Hochrhein',       Big('0.0'),  'DE', 'Büsingen am Hochrhein'],
        ['DE', null,                          Big('0.19'), 'DE', null],
        ['DK', null,                          Big('0.25'), 'DK', null],
        ['EE', null,                          Big('0.20'), 'EE', null],
        ['ES', 'Canary Islands',              Big('0.0'),  'ES', 'Canary Islands'],
        ['ES', 'Melilla',                     Big('0.0'),  'ES', 'Melilla'],
        ['ES', 'Ceuta',                       Big('0.0'),  'ES', 'Ceuta'],
        ['ES', null,                          Big('0.21'), 'ES', null],
        ['FI', null,                          Big('0.24'), 'FI', null],
        ['FR', null,                          Big('0.20'), 'FR', null],
        ['GB', 'Akrotiri',                    Big('0.19'), 'CY', null],
        ['GB', 'Dhekelia',                    Big('0.19'), 'CY', null],
        ['GB', null,                          Big('0.20'), 'GB', null],
        ['GR', 'Mount Athos',                 Big('0.0'),  'GR', 'Mount Athos'],
        ['GR', null,                          Big('0.23'), 'GR', null],
        ['HR', null,                          Big('0.25'), 'HR', null],
        ['HU', null,                          Big('0.27'), 'HU', null],
        ['IE', null,                          Big('0.23'), 'IE', null],
        ['IT', "Campione d'Italia",           Big('0.0'),  'IT', "Campione d'Italia"],
        ['IT', 'Livigno',                     Big('0.0'),  'IT', 'Livigno'],
        ['IT', null,                          Big('0.22'), 'IT', null],
        ['LT', null,                          Big('0.21'), 'LT', null],
        ['LU', null,                          Big('0.15'), 'LU', null],
        ['LV', null,                          Big('0.21'), 'LV', null],
        ['MT', null,                          Big('0.18'), 'MT', null],
        ['NL', null,                          Big('0.21'), 'NL', null],
        ['PL', null,                          Big('0.23'), 'PL', null],
        ['PT', 'Azores',                      Big('0.0'),  'PT', 'Azores'],
        ['PT', 'Madeira',                     Big('0.0'),  'PT', 'Madeira'],
        ['PT', null,                          Big('0.23'), 'PT', null],
        ['RO', null,                          Big('0.24'), 'RO', null],
        ['SE', null,                          Big('0.25'), 'SE', null],
        ['SI', null,                          Big('0.22'), 'SI', null],
        ['SK', null,                          Big('0.20'), 'SK', null],
        ['MC', null,                          Big('0.20'), 'MC', null],
        ['IM', null,                          Big('0.20'), 'IM', null],
        ['NO', null,                          Big('0.25'), 'NO', null],
        ['US', null,                          Big('0.0'),  'US', null],
        ['CA', null,                          Big('0.0'),  'CA', null],
    ],

    function (test, data) {
        var res = vatMoss.declaredResidence.calculateRate(data[0], data[1]);
        test.deepEqual(data[2], res.rate);
        test.strictEqual(data[3], res.countryCode);
        test.strictEqual(data[4], res.exceptionName);
        test.done();
    }
);
