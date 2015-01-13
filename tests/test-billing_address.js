var Big = require('big.js');
var dataprovider = require('nodeunit-dataprovider');
var vatMoss = require('../vat_moss.js');

exports.calculateRate = dataprovider(
    [
        // Example user input                               Expected result
        ['AT',  '6691',      'Jungholz',                    Big('0.19'), 'AT', 'Jungholz'],
        ['AT',  '6991',      'Mittelberg',                  Big('0.19'), 'AT', 'Mittelberg'],
        ['at',  '6992',      'Mittelberg',                  Big('0.19'), 'AT', 'Mittelberg'],
        ['AT',  'AT-6993',   'Mittelberg',                  Big('0.19'), 'AT', 'Mittelberg'],
        ['AT',  '6971',      'Hard',                        Big('0.20'), 'AT', null],
        ['BE',  '1000',      'Brussels',                    Big('0.21'), 'BE', null],
        ['BG',  '1000',      'Sofia',                       Big('0.20'), 'BG', null],
        ['CH',  '8238',      'Büsingen am Hochrhein',       Big('0.0'),  'DE', 'Büsingen am Hochrhein'],
        ['CH',  '6911',      "Campione d'Italia",           Big('0.0'),  'IT', "Campione d'Italia"],
        ['CH',  '3907',      'Domodossola',                 Big('0.22'), 'IT', null],
        ['CY',  'CY-1010',   'Nicosia',                     Big('0.19'), 'CY', null],
        ['CY',  '1010',      'Nicosia',                     Big('0.19'), 'CY', null],
        ['CZ',  '250 00',    'Prague',                      Big('0.21'), 'CZ', null],
        ['DE',  '87491',     'Jungholz',                    Big('0.19'), 'AT', 'Jungholz'],
        ['de',  '87567',     'Mittelberg',                  Big('0.19'), 'AT', 'Mittelberg'],
        ['de ', '87568',     'mittelberg',                  Big('0.19'), 'AT', 'Mittelberg'],
        ['DE',  'DE-87569',  'Mittelberg',                  Big('0.19'), 'AT', 'Mittelberg'],
        ['DE',  '78266',     'Büsingen am Hochrhein',       Big('0.0'),  'DE', 'Büsingen am Hochrhein'],
        ['DE',  '27498',     'Heligoland',                  Big('0.0'),  'DE', 'Heligoland'],
        ['DE',  '04774',     'Dahlen',                      Big('0.19'), 'DE', null],
        ['DK',  '1000',      'Copenhagen',                  Big('0.25'), 'DK', null],
        ['EE',  '15199',     'Tallinn',                     Big('0.20'), 'EE', null],
        ['ES',  '38001',     'Santa Cruz de Tenerife',      Big('0.0'),  'ES', 'Canary Islands'],
        ['ES',  '35630',     'Antigua',                     Big('0.0'),  'ES', 'Canary Islands'],
        ['ES',  '35001',     'Las Palmas',                  Big('0.0'),  'ES', 'Canary Islands'],
        ['ES',  '35500',     'Arrecife',                    Big('0.0'),  'ES', 'Canary Islands'],
        ['ES',  '38700',     'Santa Cruz de La Palma',      Big('0.0'),  'ES', 'Canary Islands'],
        ['ES',  '38880',     'San Sebastián de La Gomera',  Big('0.0'),  'ES', 'Canary Islands'],
        ['ES',  '38900',     'Valverde',                    Big('0.0'),  'ES', 'Canary Islands'],
        ['ES',  '35540',     'Caleta de Sebo',              Big('0.0'),  'ES', 'Canary Islands'],
        ['ES',  '35530',     'Teguise',                     Big('0.0'),  'ES', 'Canary Islands'],
        ['ES',  '52002',     'Melilla',                     Big('0.0'),  'ES', 'Melilla'],
        ['ES',  '51001',     'Ceuta',                       Big('0.0'),  'ES', 'Ceuta'],
        ['es',  '28001',     'Mardrid',                     Big('0.21'), 'ES', null],
        ['FI',  '00140',     'Helsinki',                    Big('0.24'), 'FI', null],
        ['FR',  '75016',     'Paris',                       Big('0.20'), 'FR', null],
        ['GB',  'BFP O57',   'Akrotiri',                    Big('0.19'), 'CY', null],
        ['GB',  'BFP O58',   'Dhekelia',                    Big('0.19'), 'CY', null],
        ['GB',  'W8 4RU',    'London',                      Big('0.20'), 'GB', null],
        ['GR',  '63086',     'Mount Athos',                 Big('0.0'),  'GR', 'Mount Athos'],
        ['GR',  '10001',     'Athens',                      Big('0.23'), 'GR', null],
        ['HR',  'HR-10000',  'Zagreb',                      Big('0.25'), 'HR', null],
        ['HU',  '1239',      'Budapest',                    Big('0.27'), 'HU', null],
        ['IE',  'Dublin 1',  'Dublin',                      Big('0.23'), 'IE', null],
        ['IE',  null,        'Galway',                      Big('0.23'), 'IE', null],
        ['it',  '22060',     "Campione d'Italia",           Big('0.0'),  'IT', "Campione d'Italia"],
        ['IT',  '22060',     'Campione dItalia',            Big('0.0'),  'IT', "Campione d'Italia"],
        ['it ', '22060',     'Campione',                    Big('0.0'),  'IT', "Campione d'Italia"],
        ['it',  '23030',     'Livigno',                     Big('0.0'),  'IT', 'Livigno'],
        ['IT',  '00100',     'Rome',                        Big('0.22'), 'IT', null],
        ['LT',  '01001',     'Vilnius',                     Big('0.21'), 'LT', null],
        ['LU',  'L-1248',    'Luxembourg',                  Big('0.15'), 'LU', null],
        ['LV',  'LV-1001',   'Riga',                        Big('0.21'), 'LV', null],
        ['MT',  'VLT',       'Valletta',                    Big('0.18'), 'MT', null],
        ['NL',  '1000',      'Amsterdam',                   Big('0.21'), 'NL', null],
        ['PL',  '00-001',    'Warsaw',                      Big('0.23'), 'PL', null],
        ['PT',  '9970',      'Santa Cruz das Flores',       Big('0.0'),  'PT', 'Azores'],
        ['PT',  '9980-024',  'Vila do Corvo',               Big('0.0'),  'PT', 'Azores'],
        ['PT',  '9880-352',  'Santa Cruz da Graciosa',      Big('0.0'),  'PT', 'Azores'],
        ['PT',  '9701-101',  'Angra do Heroísmo',           Big('0.0'),  'PT', 'Azores'],
        ['PT',  '9800-539',  'Velas',                       Big('0.0'),  'PT', 'Azores'],
        ['PT',  '9930-135',  'Lajes do Pico',               Big('0.0'),  'PT', 'Azores'],
        ['PT',  '9900-997',  'Horta',                       Big('0.0'),  'PT', 'Azores'],
        ['PT',  '9560-045',  'Lagoa',                       Big('0.0'),  'PT', 'Azores'],
        ['PT',  '9580-539',  'Vila do Porto',               Big('0.0'),  'PT', 'Azores'],
        ['PT',  '9000',      'Funchal',                     Big('0.0'),  'PT', 'Madeira'],
        ['PT',  '1149-014',  'Lisbon',                      Big('0.23'), 'PT', null],
        ['RO',  '010131',    'București',                   Big('0.24'), 'RO', null],
        ['SE',  'SE-100 00', 'Stockholm',                   Big('0.25'), 'SE', null],
        ['SI',  '1000',      'Ljubljana',                   Big('0.22'), 'SI', null],
        ['SK',  '811 02',    'Bratislava',                  Big('0.20'), 'SK', null],
        ['MC',  '98025',     'Monaco',                      Big('0.20'), 'MC', null],
        ['IM',  'IM2 1RB',   'Douglas',                     Big('0.20'), 'IM', null],
        ['NO',  '0001',      'Oslo',                        Big('0.25'), 'NO', null],
        ['US',  '01950',     'Newburyport',                 Big('0.0'),  'US', null],
        ['CA',  'K2R 1C5',   'Ottawa',                      Big('0.0'),  'CA', null],
    ],

    function (test, data) {
        var res = vatMoss.billingAddress.calculateRate(data[0], data[1], data[2]);
        test.deepEqual(data[3], res.rate);
        test.strictEqual(data[4], res.countryCode);
        test.strictEqual(data[5], res.exceptionName);
        test.done();
    }
);

exports.calculateRateInvalid = dataprovider(
    [
        ['CA',  null,    'Ottawa'],
        ['US',  null,    'Boston'],
        ['',    '02108', 'Boston'],
        ['US',  '02108', null],
    ],

    function (test, data) {
        test.throws(function() {
            var res = vatMoss.billingAddress.calculateRate(data[0], data[1], data[2]);
        }, vatMoss.errors.ValueException);
        test.done();
    }
);
