var Big = require('big.js');
var dataprovider = require('nodeunit-dataprovider');
var vatMoss = require('../vat-moss.js');

exports.calculateRate = dataprovider(
    [
        // GeoLite2 Data                                                Address info                    Expected result
        ['AT', 'Tyrol',                     'Reutte',                  'AT', 'Jungholz',                Big('0.19'), 'AT', 'Jungholz'],
        ['AT', 'Tyrol',                     'Reutte',                  'AT', null,                      Big('0.20'), 'AT', null],
        ['AT', 'Vorarlberg',                'Mittelberg',              'AT', 'Mittelberg',              Big('0.19'), 'AT', 'Mittelberg'],
        ['AT', 'Salzburg',                  'Salzburg',                'AT', null,                      Big('0.20'), 'AT', null],

        ['BE', 'Brussels Capital',          'Schaarbeek',              'BE', null,                      Big('0.21'), 'BE', null],
        ['BG', 'Sofia-Capital',             'Sofia',                   'BG', null,                      Big('0.20'), 'BG', null],
        ['CY', 'Lefkosia',                  'Nicosia',                 'CY', null,                      Big('0.19'), 'CY', null],
        ['CZ', 'Hlavni mesto Praha',        'Prague',                  'CZ', null,                      Big('0.21'), 'CZ', null],

        ['DE', 'Schleswig-Holstein',        'Pinneberg',               'DE', 'Heligoland',              Big('0.0'),  'DE', 'Heligoland'],
        ['DE', 'Schleswig-Holstein',        'Pinneberg',               'DE', null,                      Big('0.19'), 'DE', null],
        ['DE', 'Baden-Württemberg Region',  'Konstanz',                'DE', 'Büsingen am Hochrhein',   Big('0.0'),  'DE', 'Büsingen am Hochrhein'],
        ['DE', 'Schleswig-Holstein',        'Berlin',                  'DE', null,                      Big('0.19'), 'DE', null],
        // Test an exception address with a non-exception geoip2 record
        ['DE', 'Schleswig-Holstein',        'Berlin',                  'DE', 'Heligoland',              Big('0.19'), 'DE', null],

        ['DK', 'Capital Region',            'Copenhagen',              'DK', null,                      Big('0.25'), 'DK', null],
        ['EE', 'Harju',                     'Tallinn',                 'EE', null,                      Big('0.20'), 'EE', null],

        ['ES', 'Canary Islands',            'Santa Cruz de Tenerife',  'ES', 'Canary Islands',          Big('0.0'),  'ES', 'Canary Islands'],

        ['ES', 'Melilla',                   'Melilla',                 'ES', 'Melilla',                 Big('0.0'),  'ES', 'Melilla'],
        ['ES', 'Ceuta',                     'Ceuta',                   'ES', 'Ceuta',                   Big('0.0'),  'ES', 'Ceuta'],
        ['ES', 'Madrid',                    'Madrid',                  'ES', null,                      Big('0.21'), 'ES', null],

        ['FI', '',                          'Helsinki',                'FI', null,                      Big('0.24'), 'FI', null],
        ['FR', 'Île-de-France',             'Paris',                   'FR', null,                      Big('0.20'), 'FR', null],
        ['GB', 'England',                   'London',                  'GB', null,                      Big('0.20'), 'GB', null],

        ['GR', 'Central Macedonia',         'Ormylia',                 'GR', 'Mount Athos',             Big('0.0'),  'GR', 'Mount Athos'],
        ['GR', 'Central Macedonia',         'Ormylia',                 'GR', null,                      Big('0.23'), 'GR', null],
        ['GR', 'Attica',                    'Athens',                  'GR', null,                      Big('0.23'), 'GR', null],

        ['HR', 'Grad Zagreb',               'Zagreb',                  'HR', null,                      Big('0.25'), 'HR', null],
        ['HU', 'Budapest fovaros',          'Budapest',                'HU', null,                      Big('0.27'), 'HU', null],
        ['IE', 'Leinster',                  'Dublin',                  'IE', null,                      Big('0.23'), 'IE', null],

        ['IT', 'Lombardy',                  'Como',                    'IT', "Campione d'Italia",       Big('0.0'),  'IT', "Campione d'Italia"],
        ['IT', 'Lombardy',                  'Como',                    'IT', null,                      Big('0.22'), 'IT', null],
        ['IT', 'Lombardy',                  'Livigno',                 'IT', 'Livigno',                 Big('0.0'),  'IT', 'Livigno'],
        // Test an exception geoip2 record with a non-exception address
        ['IT', 'Lombardy',                  'Livigno',                 'IT', null,                      Big('0.0'),  'IT', 'Livigno'],
        ['IT', 'Lombardy',                  'Cologne',                 'IT', null,                      Big('0.22'), 'IT', null],

        ['LT', 'Vilnius County',            'Vilnius',                 'LT', null,                      Big('0.21'), 'LT', null],
        ['LU', 'District de Luxembourg',    'Luxembourg',              'LU', null,                      Big('0.15'), 'LU', null],
        ['LV', 'Riga',                      'Riga',                    'LV', null,                      Big('0.21'), 'LV', null],
        ['MT', 'Il-Belt Valletta',          'Valletta',                'MT', null,                      Big('0.18'), 'MT', null],
        ['NL', 'North Holland',             'Amsterdam',               'NL', null,                      Big('0.21'), 'NL', null],
        ['PL', 'Masovian Voivodeship',      'Warsaw',                  'PL', null,                      Big('0.23'), 'PL', null],

        ['PT', 'Azores',                    'Lajes',                   'PT', 'Azores',                  Big('0.0'),  'PT', 'Azores'],
        ['PT', 'Azores',                    'Lajes',                   'PT', null,                      Big('0.0'),  'PT', 'Azores'],
        ['PT', 'Madeira',                   'Santa Cruz',              'PT', 'Madeira',                 Big('0.0'),  'PT', 'Madeira'],
        ['PT', 'Madeira',                   'Santa Cruz',              'PT', null,                      Big('0.0'),  'PT', 'Madeira'],
        ['PT', 'Lisbon',                    'Lisbon',                  'PT', null,                      Big('0.23'), 'PT', null],

        ['RO', 'Bucuresti',                 'Bucharest',               'RO', null,                      Big('0.24'), 'RO', null],
        ['SE', 'Stockholm',                 'Stockholm',               'SE', null,                      Big('0.25'), 'SE', null],
        ['SI', '',                          'Ljubljana',               'SI', null,                      Big('0.22'), 'SI', null],
        ['SK', 'Bratislavsky kraj',         'Bratislava',              'SK', null,                      Big('0.20'), 'SK', null],

        ['MC', 'Monaco',                    'Monaco',                  'MC', null,                      Big('0.20'), 'MC', null],
        ['IM', '',                          'Douglas',                 'IM', null,                      Big('0.20'), 'IM', null],

        ['NO', 'Oslo County',               'Oslo',                    'NO', null,                      Big('0.25'), 'NO', null],

        ['US', 'Massachusetts',             'Newburyport',             'US', null,                      Big('0.0'),  'US', null],
        ['CA', 'Ontario',                   'Ottawa',                  'CA', null,                      Big('0.0'),  'CA', null],
    ],

    function (test, data) {
        var res = vatMoss.geoip2.calculateRate(data[0], data[1], data[2], data[3], data[4]);
        test.deepEqual(data[5], res.rate);
        test.strictEqual(data[6], res.countryCode);
        test.strictEqual(data[7], res.exceptionName);
        test.done();
    }
);
