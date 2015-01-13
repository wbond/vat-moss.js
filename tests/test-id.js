var dataprovider = require('nodeunit-dataprovider');
var vatMoss = require('../vat_moss.js');

exports.checkId = dataprovider(
    [
        ['ATU 38289400',     'ATU38289400',    'AT'],
        ['BE0844.044.609',   'BE0844044609',   'BE'],
        ['BG160072254',      'BG160072254',    'BG'],
        ['CY 10132211L',     'CY10132211L',    'CY'],
        ['CZ15046575',       'CZ15046575',     'CZ'],
        ['DE 173548186',     'DE173548186',    'DE'],
        ['DK 65 19 68 16',   'DK65196816',     'DK'],
        ['EE 100 931 558',   'EE100931558',    'EE'],
        ['EL 094259216',     'EL094259216',    'GR'],
        ['GR094259216',      'EL094259216',    'GR'],
        ['ES B58378431',     'ESB58378431',    'ES'],
        ['FI- 2077474-0',    'FI20774740',     'FI'],
        ['FR 27 514868827',  'FR27514868827',  'FR'],
        ['GB 365684514',     'GB365684514',    'GB'],
        ['HR76639357285',    'HR76639357285',  'HR'],
        ['HU24166575',       'HU24166575',     'HU'],
        ['IE6388047V',       'IE6388047V',     'IE'],
        ['IT05175700482',    'IT05175700482',  'IT'],
        ['LT100006688411',   'LT100006688411', 'LT'],
        ['LU21416127',       'LU21416127',     'LU'],
        ['LV90009253362',    'LV90009253362',  'LV'],
        ['MT20681625',       'MT20681625',     'MT'],
        ['NL 814246205 B01', 'NL814246205B01', 'NL'],
        ['NO974760673MVA',   'NO974760673MVA', 'NO'],
        ['PL 5263024325',    'PL5263024325',   'PL'],
        ['pt 502332743',     'PT502332743',    'PT'],
        ['RO 24063308',      'RO24063308',     'RO'],
        ['SE 516405444601',  'SE516405444601', 'SE'],
        ['si47992115',       'SI47992115',     'SI'],
        ['sk2020270780',     'SK2020270780',   'SK'],
        ['AL J 61929021 E',  null,             null]
    ],

    function (test, data) {
        var res = vatMoss.id.check(data[0]);
        if (!data[1]) {
            test.strictEqual(data[1], res);
        } else {
            test.strictEqual(data[1], res.vatId);
            test.strictEqual(data[2], res.countryCode);
        }
        test.done();
    }
);

exports.checkInvalidId = dataprovider(
    [
        ['IE000000'],
        ['AT1'],
    ],

    function (test, data) {
        test.throws(function() {
            var res = vatMoss.id.check(data[0]);
        }, vatMoss.errors.InvalidException);
        test.done();
    }
);
