/*!
 * vat-moss.js v0.9.0
 * https://github.com/wbond/vat-moss.js
 * Copyright 2015 Will Bond <will@wbond.net>
 * Released under the MIT license
 */
(function(exports){

    // Include big.js when running under node.
    // For the browser, we presume big.js is manually included.
    if (typeof window === 'undefined') {
        var Big = require('big.js');
    } else {
        var Big = window.Big;
    }

    exports.version = '0.9.0';

    exports.billingAddress = {};
    var billingAddress = exports.billingAddress;

    exports.declaredResidence = {};
    var declaredResidence = exports.declaredResidence;

    exports.errors = {};
    var errors = exports.errors;

    exports.exchangeRates = {};
    var exchangeRates = exports.exchangeRates;

    exports.geoip2 = {};
    var geoip2 = exports.geoip2;

    exports.id = {};
    var id = exports.id;

    exports.phoneNumber = {};
    var phoneNumber = exports.phoneNumber;

    exports.rates = {};
    var rates = exports.rates;


    // The rates used here are pull from the following sources December 17, 2014:
    //
    // http://ec.europa.eu/taxation_customs/resources/documents/taxation/vat/how_vat_works/rates/vat_rates_en.pdf
    // http://www.skatteetaten.no/en/Bedrift-og-organisasjon/Merverdiavgift/Guide-to-Value-Added-Tax-in-Norway/?chapter=3732#kapitteltekst
    // http://en.wikipedia.org/wiki/Special_member_state_territories_and_the_European_Union
    //
    // The following is an extrapolation of special EU VAT rates and exemptions
    // listed in the above PDF.
    //
    //   VAT Does Not Apply
    //
    //     Countries
    //
    //       FO - Faroe Islands - Denmark
    //       GL - Greenland - Denmark
    //       AX - Åland Islands - Finland
    //       GF - French Guiana - France
    //
    //     Cities or regions
    //
    //       Canary Islands - Spain
    //       Melilla - Spain
    //       Ceuta - Spain
    //       Büsingen am Hochrhein - Germany
    //       Heligoland - Germany
    //       Mount Athos - Greece
    //       Campione d'Italia - Italy
    //       Livigno - Italy
    //
    //     French overseas departments - these have a VAT similar to EU, but they are
    //     not actually part of the EU VAT system, so you do not have to collect VAT
    //     for e-services. The local VAT is 8.5%.
    //     http://ec.europa.eu/taxation_customs/taxation/other_taxes/dock_dues/index_en.htm
    //
    //       GP - Guadeloupe
    //       RE - Réunion
    //       MQ - Martinique
    //
    //   Special VAT Rates
    //
    //     Monaco - France - 20%
    //     Isle of Man - United Kingdom - 20%
    //     Azores - Portugal - 18%
    //     Madeira - Portugal - 22%
    //     Akrotiri - Cyprus - 19%
    //     Dhekelia - Cyprus - 19%
    //     Jungholz - Austria - 19%
    //     Mittelberg - Austria - 19%

    // There are country entries and exceptions entries for places that are listed
    // on the VAT exceptions list. A value of 0.0 means no VAT is to be collected.
    rates.BY_COUNTRY = {
        AT: { // Austria
            rate: Big('0.20'),
            exceptions: {
                'Jungholz': Big('0.19'),
                'Mittelberg': Big('0.19')
            }
        },
        BE: { // Belgium
            rate: Big('0.21')
        },
        BG: { // Bulgaria
            rate: Big('0.20')
        },
        CY: { // Cyprus
            rate: Big('0.19')
        },
        CZ: { // Czech Republic
            rate: Big('0.21')
        },
        DE: { // Germany
            rate: Big('0.19'),
            exceptions: {
                'Büsingen am Hochrhein': Big('0.0'),
                'Heligoland': Big('0.0')
            }
        },
        DK: { // Denmark
            rate: Big('0.25')
        },
        EE: { // Estonia
            rate: Big('0.20')
        },
        ES: { // Spain
            rate: Big('0.21'),
            exceptions: {
                'Canary Islands': Big('0.0'),
                'Ceuta': Big('0.0'),
                'Melilla': Big('0.0')
            }
        },
        FI: { // Finland
            rate: Big('0.24')
        },
        FR: { // France
            rate: Big('0.20')
        },
        GB: { // United Kingdom
            rate: Big('0.20'),
            exceptions: {
                // UK RAF Bases in Cyprus are taxed at Cyprus rate
                'Akrotiri': [Big('0.19'), 'CY', null],
                'Dhekelia': [Big('0.19'), 'CY', null]
            }
        },
        GR: { // Greece
            rate: Big('0.23'),
            exceptions: {
                'Mount Athos': Big('0.0')
            }
        },
        HR: { // Croatia
            rate: Big('0.25')
        },
        HU: { // Hungary
            rate: Big('0.27')
        },
        IE: { // Ireland
            rate: Big('0.23')
        },
        IT: { // Italy
            rate: Big('0.22'),
            exceptions: {
                "Campione d'Italia": Big('0.0'),
                'Livigno': Big('0.0')
            }
        },
        LT: { // Lithuania
            rate: Big('0.21')
        },
        LU: { // Luxembourg
            rate: Big('0.15')
        },
        LV: { // Latvia
            rate: Big('0.21')
        },
        MT: { // Malta
            rate: Big('0.18')
        },
        NL: { // Netherlands
            rate: Big('0.21')
        },
        PL: { // Poland
            rate: Big('0.23')
        },
        PT: { // Portugal
            rate: Big('0.23'),
            exceptions: {
                'Azores': Big('0.0'),
                'Madeira': Big('0.0')
            }
        },
        RO: { // Romania
            rate: Big('0.24')
        },
        SE: { // Sweden
            rate: Big('0.25')
        },
        SI: { // Slovenia
            rate: Big('0.22')
        },
        SK: { // Slovakia
            rate: Big('0.20')
        },

        // Countries associated with EU countries that have a special VAT rate
        MC: { // Monaco - France
            rate: Big('0.20')
        },
        IM: { // Isle of Man - United Kingdom
            rate: Big('0.20')
        },

        // Non-EU with their own VAT collection requirements
        NO: { // Norway
            rate: Big('0.25')
        }
    };


    // A list of regular expressions to map against an internation phone number that
    // has had the leading + stripped off.
    //
    // The mapping is in the form:
    //
    // {
    //     digit: [
    //         [
    //             two character country code, regex
    //         ], ...
    //     ]
    // }
    //
    // The values are a list so that more specific regexes will be matched first.
    // This is necessary since sometimes multiple countries use the same
    // international calling code prefix.
    var CALLING_CODE_MAPPING = {
        '1': [
            ['CA', /^1(204|226|236|249|250|289|306|343|365|387|403|416|418|431|437|438|450|506|514|519|548|579|581|587|600|604|613|622|633|639|644|647|655|672|677|688|705|709|742|778|780|782|807|819|825|867|873|902|905)/],
            ['AG', /^1268/],
            ['AI', /^1264/],
            ['AS', /^1684/],
            ['BB', /^1246/],
            ['BM', /^1441/],
            ['BS', /^1242/],
            ['DM', /^1767/],
            ['DO', /^1(809|829|849)/],
            ['GD', /^1473/],
            ['GU', /^1671/],
            ['JM', /^1876/],
            ['KN', /^1869/],
            ['KY', /^1345/],
            ['LC', /^1758/],
            ['MP', /^1670/],
            ['MS', /^1664/],
            ['PR', /^1(939|787)/],
            ['SX', /^1721/],
            ['TC', /^1649/],
            ['TT', /^1868/],
            ['VC', /^1784/],
            ['VG', /^1284/],
            ['VI', /^1340/],
            ['US', /^1/],
        ],
        '2': [
            ['EG', /^20/],
            ['SS', /^211/],
            ['EH', /^212(5288|5289)/],
            ['MA', /^212/],
            ['DZ', /^213/],
            ['TN', /^216/],
            ['LY', /^218/],
            ['GM', /^220/],
            ['SN', /^221/],
            ['MR', /^222/],
            ['ML', /^223/],
            ['GN', /^224/],
            ['CI', /^225/],
            ['BF', /^226/],
            ['NE', /^227/],
            ['TG', /^228/],
            ['BJ', /^229/],
            ['MU', /^230/],
            ['LR', /^231/],
            ['SL', /^232/],
            ['GH', /^233/],
            ['NG', /^234/],
            ['TD', /^235/],
            ['CF', /^236/],
            ['CM', /^237/],
            ['CV', /^238/],
            ['ST', /^239/],
            ['GQ', /^240/],
            ['GA', /^241/],
            ['CG', /^242/],
            ['CD', /^243/],
            ['AO', /^244/],
            ['GW', /^245/],
            ['IO', /^246/],
            ['AC', /^247/],
            ['SC', /^248/],
            ['SD', /^249/],
            ['RW', /^250/],
            ['ET', /^251/],
            ['SO', /^252/],
            ['DJ', /^253/],
            ['KE', /^254/],
            ['TZ', /^255/],
            ['UG', /^256/],
            ['BI', /^257/],
            ['MZ', /^258/],
            ['ZM', /^260/],
            ['MG', /^261/],
            ['YT', /^262269/],
            ['RE', /^262/],
            ['ZW', /^263/],
            ['NA', /^264/],
            ['MW', /^265/],
            ['LS', /^266/],
            ['BW', /^267/],
            ['SZ', /^268/],
            ['KM', /^269/],
            ['ZA', /^27/],
            ['SH', /^290/],
            ['ER', /^291/],
            ['AW', /^297/],
            ['FO', /^298/],
            ['GL', /^299/],
        ],
        '3': [
            ['GR', /^30/],
            ['NL', /^31/],
            ['BE', /^32/],
            ['FR', /^33/],
            ['ES', /^34/],
            ['GI', /^350/],
            ['PT', /^351/],
            ['LU', /^352/],
            ['IE', /^353/],
            ['IS', /^354/],
            ['AL', /^355/],
            ['MT', /^356/],
            ['CY', /^357/],
            ['AX', /^35818/], // Åland Islands (to exclude from FI)
            ['FI', /^358/],
            ['BG', /^359/],
            ['HU', /^36/],
            ['LT', /^370/],
            ['LV', /^371/],
            ['EE', /^372/],
            ['MD', /^373/],
            ['AM', /^374/],
            ['BY', /^375/],
            ['AD', /^376/],
            ['XK', /^377(44|45)/],
            ['MC', /^377/],
            ['SM', /^378/],
            ['VA', /^379/],
            ['UA', /^380/],
            ['XK', /^381(28|29|38|39)/],
            ['RS', /^381/],
            ['ME', /^382/],
            ['XK', /^383/],
            ['HR', /^385/],
            ['XK', /^386(43|49)/],
            ['SI', /^386/],
            ['BA', /^387/],
            ['MK', /^389/],
            ['VA', /^3906698/],
            ['IT', /^39/],
        ],
        '4': [
            ['RO', /^40/],
            ['CH', /^41/],
            ['CZ', /^420/],
            ['SK', /^421/],
            ['LI', /^423/],
            ['AT', /^43/],
            ['GG', /^44(148|7781|7839|7911)/], // Guernsey (to exclude from GB)
            ['JE', /^44(153|7509|7797|7937|7700|7829)/], // Jersey (to exclude from GB)
            ['IM', /^44(162|7624|7524|7924)/], // Isle of Man
            ['GB', /^44/],
            ['DK', /^45/],
            ['SE', /^46/],
            ['NO', /^47/],
            ['PL', /^48/],
            ['DE', /^49/],
        ],
        '5': [
            ['FK', /^500/],
            ['BZ', /^501/],
            ['GT', /^502/],
            ['SV', /^503/],
            ['HN', /^504/],
            ['NI', /^505/],
            ['CR', /^506/],
            ['PA', /^507/],
            ['PM', /^508/],
            ['HT', /^509/],
            ['PE', /^51/],
            ['MX', /^52/],
            ['CU', /^53/],
            ['AR', /^54/],
            ['BR', /^55/],
            ['CL', /^56/],
            ['CO', /^57/],
            ['VE', /^58/],
            ['MF', /^590(590(51|52|58|77|87)|690(10|22|27|66|77|87|88))/],
            ['BL', /^590590(27|29)/],
            ['GP', /^590/],
            ['BO', /^591/],
            ['GY', /^592/],
            ['EC', /^593/],
            ['GF', /^594/],
            ['PY', /^595/],
            ['MQ', /^596/],
            ['SR', /^597/],
            ['UY', /^598/],
            ['CW', /^5999/],
            ['BQ', /^599/],
        ],
        '6': [
            ['MY', /^60/],
            ['CX', /^6189164/],
            ['CC', /^6189162/],
            ['AU', /^61/],
            ['ID', /^62/],
            ['PH', /^63/],
            ['NZ', /^64/],
            ['SG', /^65/],
            ['TH', /^66/],
            ['TL', /^670/],
            ['NF', /^6723/],
            ['AQ', /^6721/],
            ['BN', /^673/],
            ['NR', /^674/],
            ['PG', /^675/],
            ['TO', /^676/],
            ['SB', /^677/],
            ['VU', /^678/],
            ['FJ', /^679/],
            ['PW', /^680/],
            ['WF', /^681/],
            ['CK', /^682/],
            ['NU', /^683/],
            ['WS', /^685/],
            ['KI', /^686/],
            ['NC', /^687/],
            ['TV', /^688/],
            ['PF', /^689/],
            ['TK', /^690/],
            ['FM', /^691/],
            ['MH', /^692/],
        ],
        '7': [
            ['GE', /^7(840|940)/],
            ['RU', /^7[3489]/],
            ['KZ', /^7[67]/],
        ],
        '8': [
            ['JP', /^81/],
            ['KR', /^82/],
            ['VN', /^84/],
            ['KP', /^850/],
            ['HK', /^852/],
            ['MO', /^853/],
            ['KH', /^855/],
            ['LA', /^856/],
            ['CN', /^86/],
            ['BD', /^880/],
            ['TW', /^886/],
        ],
        '9': [
            ['TR', /^90/],
            ['IN', /^91/],
            ['PK', /^92/],
            ['AF', /^93/],
            ['LK', /^94/],
            ['MM', /^95/],
            ['MV', /^960/],
            ['LB', /^961/],
            ['JO', /^962/],
            ['SY', /^963/],
            ['IQ', /^964/],
            ['KW', /^965/],
            ['SA', /^966/],
            ['YE', /^967/],
            ['OM', /^968/],
            ['PS', /^970/],
            ['AE', /^971/],
            ['IL', /^972/],
            ['BH', /^973/],
            ['QA', /^974/],
            ['BT', /^975/],
            ['MN', /^976/],
            ['NP', /^977/],
            ['IR', /^98/],
            ['TJ', /^992/],
            ['TM', /^993/],
            ['AZ', /^994/],
            ['GE', /^995/],
            ['KG', /^996/],
            ['UZ', /^998/],
        ]
    };


    // The code key is included with these exceptions since some cities have
    // phone service from more than one country.
    //
    // The main dict key is the country code, as matched from CALLING_CODE_MAPPING
    var CALLING_CODE_EXCEPTIONS = {
        AT: [
            {
                regex: /435676/,
                code: 'AT',
                name: 'Jungholz',
                definitive: true
            },
            {
                regex: /435517/,
                code: 'AT',
                name: 'Mittelberg',
                definitive: false
            }
        ],
        CH: [
            {
                regex: /4152/,
                code: 'DE',
                name: 'Büsingen am Hochrhein',
                definitive: false
            },
            {
                regex: /4191/,
                code: 'IT',
                name: "Campione d'Italia",
                definitive: false
            }
        ],
        DE: [
            {
                regex: /494725/,
                code: 'DE',
                name: 'Heligoland',
                definitive: true
            },
            {
                regex: /497734/,
                code: 'DE',
                name: 'Büsingen am Hochrhein',
                definitive: false
            }
        ],
        ES: [
            {
                regex: /34(822|828|922|928)/,
                code: 'ES',
                name: 'Canary Islands',
                definitive: true
            },
            {
                regex: /34956/,
                code: 'ES',
                name: 'Ceuta',
                definitive: false
            },
            {
                regex: /34952/,
                code: 'ES',
                name: 'Melilla',
                definitive: false
            }
        ],
        GR: [
            {
                // http://www.mountathosinfos.gr/pages/agionoros/telefonbook.en.html
                // http://www.athosfriends.org/PilgrimsGuide/information/#telephones
                regex: /3023770(23|41488|41462|22586|24039|94098)/,
                code: 'GR',
                name: 'Mount Athos',
                definitive: true
            }
        ],
        IT: [
            {
                regex: /390342/,
                code: 'IT',
                name: 'Livigno',
                definitive: false
            }
        ],
        PT: [
            {
                regex: /35129[256]/,
                code: 'PT',
                name: 'Azores',
                definitive: true
            },
            {
                regex: /351291/,
                code: 'PT',
                name: 'Madeira',
                definitive: true
            }
        ]
    };


    // Patterns generated by consulting the following URLs:
    //
    //  - http://en.wikipedia.org/wiki/VAT_identification_number
    //  - http://ec.europa.eu/taxation_customs/vies/faq.html
    //  - http://www.skatteetaten.no/en/International-pages/Felles-innhold-benyttes-i-flere-malgrupper/Brochure/Guide-to-value-added-tax-in-Norway/?chapter=7159
    var ID_PATTERNS = {
        AT: { // Austria
            regex: /^U\d{8}$/,
            code: 'AT'
        },
        BE: { // Belgium
            regex: /^(1|0?)\d{9}$/,
            code: 'BE'
        },
        BG: { // Bulgaria
            regex: /^\d{9,10}$/,
            code: 'BG'
        },
        CY: { // Cyprus
            regex: /^\d{8}[A-Z]$/,
            code: 'CY'
        },
        CZ: { // Czech Republic
            regex: /^\d{8,10}$/,
            code: 'CZ'
        },
        DE: { // Germany
            regex: /^\d{9}$/,
            code: 'DE'
        },
        DK: { // Denmark
            regex: /^\d{8}$/,
            code: 'DK'
        },
        EE: { // Estonia
            regex: /^\d{9}$/,
            code: 'EE'
        },
        EL: { // Greece
            regex: /^\d{9}$/,
            code: 'GR'
        },
        ES: { // Spain
            regex: /^[A-Z0-9]\d{7}[A-Z0-9]$/,
            code: 'ES'
        },
        FI: { // Finland
            regex: /^\d{8}$/,
            code: 'FI'
        },
        FR: { // France
            regex: /^[A-Z0-9]{2}\d{9}$/,
            code: 'FR'
        },
        GB: { // United Kingdom
            regex: /^(GD\d{3}|HA\d{3}|\d{9}|\d{12})$/,
            code: 'GB'
        },
        HR: { // Croatia
            regex: /^\d{11}$/,
            code: 'HR'
        },
        HU: { // Hungary
            regex: /^\d{8}$/,
            code: 'HU'
        },
        IE: { // Ireland
            regex: /^(\d{7}[A-Z]{1,2}|\d[A-Z+*]\d{5}[A-Z])$/,
            code: 'IE'
        },
        IT: { // Italy
            regex: /^\d{11}$/,
            code: 'IT'
        },
        LT: { // Lithuania
            regex: /^(\d{9}|\d{12})$/,
            code: 'LT'
        },
        LU: { // Luxembourg
            regex: /^\d{8}$/,
            code: 'LU'
        },
        LV: { // Latvia
            regex: /^\d{11}$/,
            code: 'LV'
        },
        MT: { // Malta
            regex: /^\d{8}$/,
            code: 'MT'
        },
        NL: { // Netherlands
            regex: /^\d{9}B\d{2}$/,
            code: 'NL'
        },
        NO: { // Norway
            regex: /^\d{9}MVA$/,
            code: 'NO'
        },
        PL: { // Poland
            regex: /^\d{10}$/,
            code: 'PL'
        },
        PT: { // Portugal
            regex: /^\d{9}$/,
            code: 'PT'
        },
        RO: { // Romania
            regex: /^\d{2,10}$/,
            code: 'RO'
        },
        SE: { // Sweden
            regex: /^\d{12}$/,
            code: 'SE'
        },
        SI: { // Slovenia
            regex: /^\d{8}$/,
            code: 'SI'
        },
        SK: { // Slovakia
            regex: /^\d{10}$/,
            code: 'SK'
        },
    };


    // A dictionary that maps information from the GeoLite2 databases to VAT
    // exceptions. Top level keys are country codes, each pointing to a dictionary
    // with keys that are either a string of subdivision name and city name
    // separated with a /, or just a string of subdivision name.
    //
    // There is a key 'definitive' that indicates is the match is sufficiently
    // specific to fully map to the exemption. If 'definitive' is false, other
    // methods must be used to obtain place of supply proof.
    var GEOIP2_EXCEPTIONS = {
        AT: {
            'tyrol/reutte': {
                name: 'Jungholz',
                definitive: false
            },
            'vorarlberg/mittelberg': {
                name: 'Mittelberg',
                definitive: true
            }
        },
        DE: {
            'baden-württemberg region/konstanz': {
                name: 'Büsingen am Hochrhein',
                definitive: false
            },
            'schleswig-holstein/pinneberg': {
                name: 'Heligoland',
                definitive: false
            }
        },
        ES: {
            'canary islands': {
                name: 'Canary Islands',
                definitive: true
            },
            'ceuta': {
                name: 'Ceuta',
                definitive: true
            },
            'melilla': {
                name: 'Melilla',
                definitive: true
            }
        },
        GR: {
            // There is no direct entry for Mount Athos, so we just flag the
            // Central Macedonia region since it is part of that
            'central macedonia': {
                name: 'Mount Athos',
                definitive: false
            }
        },
        IT: {
            'lombardy/livigno': {
                name: 'Livigno',
                definitive: true
            },
            // There are no entries that cover Campione d'Italia, so instead we
            // just flag the whole region of Lombardy as not definitive.
            'lombardy': {
                name: "Campione d'Italia",
                definitive: false
            }
        },
        PT: {
            'azores': {
                name: 'Azores',
                definitive: true
            },
            'madeira': {
                name: 'Madeira',
                definitive: true
            }
        }
    };


    var CURRENCY_FORMATTING_RULES = {
        BGN: {
            symbol: ' Lev',
            symbolFirst: false,
            decimalMark: '.',
            thousandsSeparator: ',',
            decimalPlaces: 2
        },
        CZK: {
            symbol: ' Kč',
            symbolFirst: false,
            decimalMark: ',',
            thousandsSeparator: '.',
            decimalPlaces: 2
        },
        DKK: {
            symbol: ' Dkr',
            symbolFirst: false,
            decimalMark: ',',
            thousandsSeparator: '.',
            decimalPlaces: 2
        },
        EUR: {
            symbol: '€',
            symbolFirst: true,
            decimalMark: ',',
            thousandsSeparator: '.',
            decimalPlaces: 2
        },
        GBP: {
            symbol: '£',
            symbolFirst: true,
            decimalMark: '.',
            thousandsSeparator: ',',
            decimalPlaces: 2
        },
        HRK: {
            symbol: ' Kn',
            symbolFirst: false,
            decimalMark: ',',
            thousandsSeparator: '.',
            decimalPlaces: 2
        },
        HUF: {
            symbol: ' Ft',
            symbolFirst: false,
            decimalMark: ',',
            thousandsSeparator: '.',
            decimalPlaces: 2
        },
        NOK: {
            symbol: ' Nkr',
            symbolFirst: false,
            decimalMark: ',',
            thousandsSeparator: '.',
            decimalPlaces: 2
        },
        PLN: {
            symbol: ' Zł',
            symbolFirst: false,
            decimalMark: ',',
            thousandsSeparator: ' ',
            decimalPlaces: 2
        },
        RON: {
            symbol: ' Lei',
            symbolFirst: false,
            decimalMark: ',',
            thousandsSeparator: '.',
            decimalPlaces: 2
        },
        SEK: {
            symbol: ' Skr',
            symbolFirst: false,
            decimalMark: ',',
            thousandsSeparator: ' ',
            decimalPlaces: 2
        },
        USD: {
            symbol: '$',
            symbolFirst: true,
            decimalMark: '.',
            thousandsSeparator: ',',
            decimalPlaces: 2
        }
    };


    var RESIDENCE_OPTIONS = [
        ['Afghanistan', 'AF'],
        ['Åland Islands', 'AX'],
        ['Albania', 'AL'],
        ['Algeria', 'DZ'],
        ['American Samoa', 'AS'],
        ['Andorra', 'AD'],
        ['Angola', 'AO'],
        ['Anguilla', 'AI'],
        ['Antarctica', 'AQ'],
        ['Antigua and Barbuda', 'AG'],
        ['Argentina', 'AR'],
        ['Armenia', 'AM'],
        ['Aruba', 'AW'],
        ['Australia', 'AU'],
        ['Austria', 'AT', ['Jungholz', 'Mittelberg']],
        ['Azerbaijan', 'AZ'],
        ['Bahamas', 'BS'],
        ['Bahrain', 'BH'],
        ['Bangladesh', 'BD'],
        ['Barbados', 'BB'],
        ['Belarus', 'BY'],
        ['Belgium', 'BE'],
        ['Belize', 'BZ'],
        ['Benin', 'BJ'],
        ['Bermuda', 'BM'],
        ['Bhutan', 'BT'],
        ['Bolivia, Plurinational State of', 'BO'],
        ['Bonaire, Sint Eustatius and Saba', 'BQ'],
        ['Bosnia and Herzegovina', 'BA'],
        ['Botswana', 'BW'],
        ['Bouvet Island', 'BV'],
        ['Brazil', 'BR'],
        ['British Indian Ocean Territory', 'IO'],
        ['Brunei Darussalam', 'BN'],
        ['Bulgaria', 'BG'],
        ['Burkina Faso', 'BF'],
        ['Burundi', 'BI'],
        ['Cambodia', 'KH'],
        ['Cameroon', 'CM'],
        ['Canada', 'CA'],
        ['Cabo Verde', 'CV'],
        ['Cayman Islands', 'KY'],
        ['Central African Republic', 'CF'],
        ['Chad', 'TD'],
        ['Chile', 'CL'],
        ['China', 'CN'],
        ['Christmas Island', 'CX'],
        ['Cocos (Keeling) Islands', 'CC'],
        ['Colombia', 'CO'],
        ['Comoros', 'KM'],
        ['Congo', 'CG'],
        ['Congo, the Democratic Republic of the', 'CD'],
        ['Cook Islands', 'CK'],
        ['Costa Rica', 'CR'],
        ["Côte d'Ivoire", 'CI'],
        ['Croatia', 'HR'],
        ['Cuba', 'CU'],
        ['Curaçao', 'CW'],
        ['Cyprus', 'CY'],
        ['Czech Republic', 'CZ'],
        ['Denmark', 'DK'],
        ['Djibouti', 'DJ'],
        ['Dominica', 'DM'],
        ['Dominican Republic', 'DO'],
        ['Ecuador', 'EC'],
        ['Egypt', 'EG'],
        ['El Salvador', 'SV'],
        ['Equatorial Guinea', 'GQ'],
        ['Eritrea', 'ER'],
        ['Estonia', 'EE'],
        ['Ethiopia', 'ET'],
        ['Falkland Islands (Malvinas)', 'FK'],
        ['Faroe Islands', 'FO'],
        ['Fiji', 'FJ'],
        ['Finland', 'FI'],
        ['France', 'FR'],
        ['French Guiana', 'GF'],
        ['French Polynesia', 'PF'],
        ['French Southern Territories', 'TF'],
        ['Gabon', 'GA'],
        ['Gambia', 'GM'],
        ['Georgia', 'GE'],
        ['Germany', 'DE', ['Büsingen am Hochrhein', 'Heligoland']],
        ['Ghana', 'GH'],
        ['Gibraltar', 'GI'],
        ['Greece', 'GR', ['Mount Athos']],
        ['Greenland', 'GL'],
        ['Grenada', 'GD'],
        ['Guadeloupe', 'GP'],
        ['Guam', 'GU'],
        ['Guatemala', 'GT'],
        ['Guernsey', 'GG'],
        ['Guinea', 'GN'],
        ['Guinea-Bissau', 'GW'],
        ['Guyana', 'GY'],
        ['Haiti', 'HT'],
        ['Heard Island and McDonald Islands', 'HM'],
        ['Holy See (Vatican City State)', 'VA'],
        ['Honduras', 'HN'],
        ['Hong Kong', 'HK'],
        ['Hungary', 'HU'],
        ['Iceland', 'IS'],
        ['India', 'IN'],
        ['Indonesia', 'ID'],
        ['Iran, Islamic Republic of', 'IR'],
        ['Iraq', 'IQ'],
        ['Ireland', 'IE'],
        ['Isle of Man', 'IM'],
        ['Israel', 'IL'],
        ['Italy', 'IT', ["Campione d'Italia", 'Livigno']],
        ['Jamaica', 'JM'],
        ['Japan', 'JP'],
        ['Jersey', 'JE'],
        ['Jordan', 'JO'],
        ['Kazakhstan', 'KZ'],
        ['Kenya', 'KE'],
        ['Kiribati', 'KI'],
        ["Korea, Democratic People's Republic of", 'KP'],
        ['Korea, Republic of', 'KR'],
        ['Kosovo, Republic of', 'XK'],
        ['Kuwait', 'KW'],
        ['Kyrgyzstan', 'KG'],
        ["Lao People's Democratic Republic", 'LA'],
        ['Latvia', 'LV'],
        ['Lebanon', 'LB'],
        ['Lesotho', 'LS'],
        ['Liberia', 'LR'],
        ['Libya', 'LY'],
        ['Liechtenstein', 'LI'],
        ['Lithuania', 'LT'],
        ['Luxembourg', 'LU'],
        ['Macao', 'MO'],
        ['Macedonia, the former Yugoslav Republic of', 'MK'],
        ['Madagascar', 'MG'],
        ['Malawi', 'MW'],
        ['Malaysia', 'MY'],
        ['Maldives', 'MV'],
        ['Mali', 'ML'],
        ['Malta', 'MT'],
        ['Marshall Islands', 'MH'],
        ['Martinique', 'MQ'],
        ['Mauritania', 'MR'],
        ['Mauritius', 'MU'],
        ['Mayotte', 'YT'],
        ['Mexico', 'MX'],
        ['Micronesia, Federated States of', 'FM'],
        ['Moldova, Republic of', 'MD'],
        ['Monaco', 'MC'],
        ['Mongolia', 'MN'],
        ['Montenegro', 'ME'],
        ['Montserrat', 'MS'],
        ['Morocco', 'MA'],
        ['Mozambique', 'MZ'],
        ['Myanmar', 'MM'],
        ['Namibia', 'NA'],
        ['Nauru', 'NR'],
        ['Nepal', 'NP'],
        ['Netherlands', 'NL'],
        ['New Caledonia', 'NC'],
        ['New Zealand', 'NZ'],
        ['Nicaragua', 'NI'],
        ['Niger', 'NE'],
        ['Nigeria', 'NG'],
        ['Niue', 'NU'],
        ['Norfolk Island', 'NF'],
        ['Northern Mariana Islands', 'MP'],
        ['Norway', 'NO'],
        ['Oman', 'OM'],
        ['Pakistan', 'PK'],
        ['Palau', 'PW'],
        ['Palestine, State of', 'PS'],
        ['Panama', 'PA'],
        ['Papua New Guinea', 'PG'],
        ['Paraguay', 'PY'],
        ['Peru', 'PE'],
        ['Philippines', 'PH'],
        ['Pitcairn', 'PN'],
        ['Poland', 'PL'],
        ['Portugal', 'PT', ['Azores', 'Madeira']],
        ['Puerto Rico', 'PR'],
        ['Qatar', 'QA'],
        ['Réunion', 'RE'],
        ['Romania', 'RO'],
        ['Russian Federation', 'RU'],
        ['Rwanda', 'RW'],
        ['Saint Barthélemy', 'BL'],
        ['Saint Helena, Ascension and Tristan da Cunha', 'SH'],
        ['Saint Kitts and Nevis', 'KN'],
        ['Saint Lucia', 'LC'],
        ['Saint Martin (French part)', 'MF'],
        ['Saint Pierre and Miquelon', 'PM'],
        ['Saint Vincent and the Grenadines', 'VC'],
        ['Samoa', 'WS'],
        ['San Marino', 'SM'],
        ['Sao Tome and Principe', 'ST'],
        ['Saudi Arabia', 'SA'],
        ['Senegal', 'SN'],
        ['Serbia', 'RS'],
        ['Seychelles', 'SC'],
        ['Sierra Leone', 'SL'],
        ['Singapore', 'SG'],
        ['Sint Maarten (Dutch part)', 'SX'],
        ['Slovakia', 'SK'],
        ['Slovenia', 'SI'],
        ['Solomon Islands', 'SB'],
        ['Somalia', 'SO'],
        ['South Africa', 'ZA'],
        ['South Georgia and the South Sandwich Islands', 'GS'],
        ['South Sudan', 'SS'],
        ['Spain', 'ES', ['Canary Islands', 'Ceuta', 'Melilla']],
        ['Sri Lanka', 'LK'],
        ['Sudan', 'SD'],
        ['Suriname', 'SR'],
        ['Svalbard and Jan Mayen', 'SJ'],
        ['Swaziland', 'SZ'],
        ['Sweden', 'SE'],
        ['Switzerland', 'CH'],
        ['Syrian Arab Republic', 'SY'],
        ['Taiwan, Province of China', 'TW'],
        ['Tajikistan', 'TJ'],
        ['Tanzania, United Republic of', 'TZ'],
        ['Thailand', 'TH'],
        ['Timor-Leste', 'TL'],
        ['Togo', 'TG'],
        ['Tokelau', 'TK'],
        ['Tonga', 'TO'],
        ['Trinidad and Tobago', 'TT'],
        ['Tunisia', 'TN'],
        ['Turkey', 'TR'],
        ['Turkmenistan', 'TM'],
        ['Turks and Caicos Islands', 'TC'],
        ['Tuvalu', 'TV'],
        ['Uganda', 'UG'],
        ['Ukraine', 'UA'],
        ['United Arab Emirates', 'AE'],
        ['United Kingdom', 'GB', ['Akrotiri', 'Dhekelia']],
        ['United States', 'US'],
        ['United States Minor Outlying Islands', 'UM'],
        ['Uruguay', 'UY'],
        ['Uzbekistan', 'UZ'],
        ['Vanuatu', 'VU'],
        ['Venezuela, Bolivarian Republic of', 'VE'],
        ['Viet Nam', 'VN'],
        ['Virgin Islands, British', 'VG'],
        ['Virgin Islands, U.S.', 'VI'],
        ['Wallis and Futuna', 'WF'],
        ['Western Sahara', 'EH'],
        ['Yemen', 'YE'],
        ['Zambia', 'ZM'],
        ['Zimbabwe', 'ZW']
    ];


    // A dictionary of countries, each being dictionary with keys that are either
    // a string postal code regex, or a tuple of postal code regex and city name
    // regex.
    //
    // There is a code value because some jurisdictions have post offices
    // through multiple countries.
    //
    // These should only be used with billing addresses.
    var POSTAL_CODE_EXCEPTIONS = {
        AT: [
            {
                postalCode: /^6691$/,
                code: 'AT',
                name: 'Jungholz'
            },
            {
                postalCode: /^699[123]$/,
                city: /\bmittelberg\b/i,
                code: 'AT',
                name: 'Mittelberg'
            }
        ],
        CH: [
            {
                postalCode: /^8238$/,
                code: 'DE',
                name: 'Büsingen am Hochrhein'
            },
            {
                postalCode: /^6911$/,
                code: 'IT',
                name: "Campione d'Italia"
            },
            // The Italian city of Domodossola has a Swiss post office also
            {
                postalCode: /^3907$/,
                code: 'IT'
            }
        ],
        DE: [
            {
                postalCode: /^87491$/,
                code: 'AT',
                name: 'Jungholz'
            },
            {
                postalCode: /^8756[789]$/,
                city: /\bmittelberg\b/i,
                code: 'AT',
                name: 'Mittelberg'
            },
            {
                postalCode: /^78266$/,
                code: 'DE',
                name: 'Büsingen am Hochrhein'
            },
            {
                postalCode: /^27498$/,
                code: 'DE',
                name: 'Heligoland'
            }
        ],
        ES: [
            {
                postalCode: /^(5100[1-5]|5107[0-1]|51081)$/,
                code: 'ES',
                name: 'Ceuta'
            },
            {
                postalCode: /^(5200[0-6]|5207[0-1]|52081)$/,
                code: 'ES',
                name: 'Melilla'
            },
            {
                postalCode: /^(35\d{3}|38\d{3})$/,
                code: 'ES',
                name: 'Canary Islands'
            }
        ],
        // The UK RAF bases in Cyprus are taxed at the Cyprus rate
        GB: [
            // Akrotiri
            {
                postalCode: /^BFPO57|BF12AT$/,
                code: 'CY'
            },
            // Dhekelia
            {
                postalCode: /^BFPO58|BF12AU$/,
                code: 'CY'
            }
        ],
        GR: [
            {
                postalCode: /^63086$/,
                code: 'GR',
                name: 'Mount Athos'
            }
        ],
        IT: [
            {
                postalCode: /^22060$/,
                city: /\bcampione\b/i,
                code: 'IT',
                name: "Campione d'Italia"
            },
            {
                postalCode: /^23030$/,
                city: /\blivigno\b/i,
                code: 'IT',
                name: 'Livigno'
            }
        ],
        PT: [
            {
                postalCode: /^9[0-4]\d{2,}$/,
                code: 'PT',
                name: 'Madeira'
            },
            {
                postalCode: /^9[5-9]\d{2,}$/,
                code: 'PT',
                name: 'Azores'
            }
        ]
    };


    var COUNTRIES_WITHOUT_POSTAL_CODES = {
        AE: true,
        AG: true,
        AN: true,
        AO: true,
        AW: true,
        BF: true,
        BI: true,
        BJ: true,
        BS: true,
        BW: true,
        BZ: true,
        CD: true,
        CF: true,
        CG: true,
        CI: true,
        CK: true,
        CM: true,
        DJ: true,
        DM: true,
        ER: true,
        FJ: true,
        GD: true,
        GH: true,
        GM: true,
        GN: true,
        GQ: true,
        GY: true,
        HK: true,
        IE: true,
        JM: true,
        KE: true,
        KI: true,
        KM: true,
        KN: true,
        KP: true,
        LC: true,
        ML: true,
        MO: true,
        MR: true,
        MS: true,
        MU: true,
        MW: true,
        NR: true,
        NU: true,
        PA: true,
        QA: true,
        RW: true,
        SA: true,
        SB: true,
        SC: true,
        SL: true,
        SO: true,
        SR: true,
        ST: true,
        SY: true,
        TF: true,
        TK: true,
        TL: true,
        TO: true,
        TT: true,
        TV: true,
        TZ: true,
        UG: true,
        VU: true,
        YE: true,
        ZA: true,
        ZW: true
    };


    var exceptionConstructor = function(that_, message) {
        that_.message = message;
        var err = new Error();
        var stackFirstLine = that_.name;
        if (that_.message) {
            stackFirstLine += ': ' + that_.message;
        }
        if (typeof(Components) != 'undefined') {
            // Mozilla:
            that_.stack = err.stack.substring(err.stack.indexOf('\n')+1);
        } else if (typeof(chrome) != 'undefined' || typeof(process) != 'undefined') {
            // Google Chrome/Node.js:
            that_.stack = stackFirstLine + err.stack.replace(/^Error:?[ ]*\n[^\n]*/, '');
        } else {
            that_.stack = err.stack;
        }
    }


    errors.ValueError = function(message) {
        this.name = 'ValueError';
        exceptionConstructor(this, message);
    }


    errors.UndefinitiveError = function(message) {
        this.name = 'UndefinitiveError';
        exceptionConstructor(this, message);
    }


    errors.InvalidError = function(message) {
        this.name = 'InvalidError';
        exceptionConstructor(this, message);
    }


    /**
     * The VAT rate that should be collected based on address information provided
     *
     * @param  {string} country_code  The two-character country code
     * @param  {string} postal_code   The postal code for the user
     * @param  {string} city          The city name for the user
     * @throws {errors.ValueError}  If country code is not two characers, or postal_code or city are not strings. postal_code may be None or blank string for countries without postal codes.
     * @return {object}  An object with the keys "rate" {Big}, "countryCode" {string} and "exceptionName" {string} or {null}
     */
    billingAddress.calculateRate = function(countryCode, postalCode, city) {

        if (!countryCode || typeof(countryCode) !== 'string') {
            throw new errors.ValueError('Invalidly formatted country code');
        }

        countryCode = countryCode.replace(/^\s+|\s+$/g, '');
        if (countryCode.length !== 2) {
            console.log('here');
            throw new errors.ValueError('Invalidly formatted country code');
        }

        countryCode = countryCode.toUpperCase();

        if (!(countryCode in COUNTRIES_WITHOUT_POSTAL_CODES)) {
            if (!postalCode || typeof(postalCode) !== 'string') {
                throw new errors.ValueError('Postal code is not a string');
            }
        }

        if (!city || typeof(city) !== 'string') {
            throw new errors.ValueError('City is not a string');
        }

        if (typeof(postalCode) === 'string') {
            postalCode = postalCode.replace(/\s+/g, '');
            postalCode = postalCode.toUpperCase();

            // Remove the common european practice of adding the country code
            // to the beginning of a postal code, followed by a dash
            if (postalCode.length > 3 && postalCode.substring(0, 3) === countryCode + '-') {
                postalCode = postalCode.substring(3);
            }

            postalCode = postalCode.replace(/-/g, '');
        }

        city = city.toLowerCase().replace(/^\s+|\s+$/g, '');

        if (!(countryCode in rates.BY_COUNTRY) && !(countryCode in POSTAL_CODE_EXCEPTIONS)) {
            return {
                rate: Big('0.0'),
                countryCode: countryCode,
                exceptionName: null
            };
        }


        var countryDefault = Big('0.0');
        if (countryCode in rates.BY_COUNTRY) {
            countryDefault = rates.BY_COUNTRY[countryCode].rate;
        }


        if (!(countryCode in POSTAL_CODE_EXCEPTIONS)) {
            return {
                rate: countryDefault,
                countryCode: countryCode,
                exceptionName: null
            };
        }

        var exceptions = POSTAL_CODE_EXCEPTIONS[countryCode];
        for (var i = 0; i < exceptions.length; i++) {
            var exception = exceptions[i];

            if (!exception.postalCode.test(postalCode)) {
                continue;
            }

            if (exception.city && !exception.city.test(city)) {
                continue;
            }

            var mappedCountry = exception.code;

            // There is at least one entry where we map to a different country,
            // but are not mapping to an exception
            if (!('name' in exception)) {
                countryCode = mappedCountry;
                countryDefault = rates.BY_COUNTRY[countryCode].rate;
                break;
            }

            var mappedName = exception.name;

            var rate = rates.BY_COUNTRY[mappedCountry].exceptions[mappedName];
            return {
                rate: rate,
                countryCode: mappedCountry,
                exceptionName: mappedName
            };
        }

        return {
            rate: countryDefault,
            countryCode: countryCode,
            exceptionName: null
        };
    };


    /**
     * Return a sorted array of objects, each containing the keys "name", "code"
     * and "exceptions". These should be used to build a user interface for
     * customers to declare their country of residence. If their declared
     * country of residence includes any exceptions, the user must be presented
     * with an option to select their residence as residing in an area with a
     * VAT exception.
     *
     * The country codes and names are from ISO 3166-1.
     *
     * @return {array}  An array of objects each with the keys "name", "code" and "exceptions"
     */
    declaredResidence.options = function() {
        var output = [];
        for (var i = 0; i < RESIDENCE_OPTIONS.length; i++) {
            output.push({
                name: RESIDENCE_OPTIONS[i][0],
                code: RESIDENCE_OPTIONS[i][1],
                exceptions: RESIDENCE_OPTIONS[i][2] || []
            });
        }
        return output;
    }


    /**
     * Calculates the VAT rate for a customer based on their declared country
     * and any declared exception information.
     *
     * @param  {string} country_code    The two-character country code where the user resides
     * @param  {string} exception_name  The name of an exception for the country, as returned from declaredResidence.options()
     * @throws {errors.ValueError}  if countryCode is not two characers, or exceptionName is not null or a valid exception from options()
     * @return {object}  An object with the keys "rate" {Big}, "countryCode" {string} and "exceptionName" {string} or {null}
     */
    declaredResidence.calculateRate = function(countryCode, exceptionName) {

        if (!countryCode || typeof(countryCode) !== 'string' || countryCode.length != 2) {
            throw new errors.ValueError('Invalidly formatted country code');
        }

        if (exceptionName && typeof(exceptionName) !== 'string') {
            throw new errors.ValueError('Exception name is not None or a string');
        }

        countryCode = countryCode.toUpperCase();

        if (!(countryCode in rates.BY_COUNTRY)) {
            return {
                rate: Big('0.0'),
                countryCode: countryCode,
                exceptionName: null
            };
        }

        var countryInfo = rates.BY_COUNTRY[countryCode];

        if (!exceptionName) {
            return {
                rate: countryInfo.rate,
                countryCode: countryCode,
                exceptionName: null
            };
        }

        if (!(exceptionName in countryInfo.exceptions)) {
            throw new errors.ValueError('"' + exceptionName + '" is not a valid exception for ' + countryCode);
        }

        var rateInfo = countryInfo.exceptions[exceptionName];
        var rate;

        // Test if the object is an array, otherwise a Big() number
        if (rateInfo instanceof Big) {
            rate = rateInfo;
        } else {
            // This allows handling the complex case of the UK RAF bases in Cyprus
            // that map to the standard country rate. The country code and exception
            // name need to be changed in addition to gettting a special rate.
            rate = rateInfo[0];
            countryCode = rateInfo[1];
            exceptionName = rateInfo[2];
        }

        return {
            rate: rate,
            countryCode: countryCode,
            exceptionName: exceptionName
        };
    }


    /**
     *  Formats a decimal or Money object into an unambiguous string representation
     * for the purpose of invoices in English.
     *
     * @param  {Big}    amount    A Big or Money object
     * @param  {string} currency  If the amount is a Big, the currency of the amount
     * @throws {errors.ValueError}  If the amount is not a Money or Big object, or if the amount is a Big object and currency is not specified, or if currency is invalid
     * @return {string}  A string representation of the amount in the currency
     */
    exchangeRates.format = function(amount, currency) {
        if (typeof(currency) === 'undefined' && 'currency' in amount) {
            currency = amount.currency;
        }

        // Allow bigmoney.js Money objects
        if (!(amount instanceof Big) && 'val' in amount) {
            amount = amount.val;
        }

        if (typeof(currency) !== 'string') {
            throw new errors.ValueError('The currency specified is not a string');
        }

        if (!(currency in CURRENCY_FORMATTING_RULES)) {
            var validCurrencies = [];
            for (var key in CURRENCY_FORMATTING_RULES) {
                validCurrencies.push(key);
            }
            var formattedCurrencies = validCurrencies.join(', ');
            throw new errors.ValueError('The currency specified, "' + currency + '", is not a supported currency: ' + formattedCurrencies);
        }

        if (!(amount instanceof Big)) {
            throw new errors.ValueError('The amount specified is not a Big');
        }

        var rules = CURRENCY_FORMATTING_RULES[currency];

        result = amount.toFixed(rules.decimalPlaces);

        // Add thousands separators
        var parts = result.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        result = parts.join('.');

        result = result.replace(',', '_');
        result = result.replace('.', '|');

        result = result.replace('_', rules.thousandsSeparator);
        result = result.replace('|', rules.decimalMark);

        if (rules.symbolFirst) {
            result = rules.symbol + result;
        } else {
            result = result + rules.symbol;
        }

        return result;
    }


    /**
     * If using bigmoney.js, this will set up the exchange rate data. This
     * exchange rate data should be from the European Central Bank.
     *
     * If using the vat_moss Python library, it can be fetched via a call to
     * vat_moss.exchange_rates.fetch().
     *
     * @param {string} base   The currency code to use as the base
     * @param {object} rates  An object with three-character currency code keys, and rate {Big} values
     */
    exchangeRates.setMoneySettings = function(base, rates) {
        Money.settings = {
            base: base,
            rates: rates
        };
    }


    /**
     * Calculate the VAT rate from the data returned by a GeoLite2 database
     *
     * @param {string} countryCode         Two-character country code
     * @param {string} subdivision         The first subdivision name
     * @param {string} city                The city name
     * @param {string} addressCountryCode  The user's countryCode, as detected from billingAddress or declaredResidence. This prevents an UndefinitiveError from being thrown.
     * @param {string} addressEexception   The user's exception name, as detected from billingAddress or declaredResidence. This prevents an UndefinitiveError from being thrown.
     * @throws {errors.ValueError}  if countryCode is not two characers, or subdivision or city are not strings
     * @throws {errors.UndefinitiveError}  when no addressCountryCode and addressException are provided and the geoip2 information is not specific enough
     * @return  {object}  An object with the keys "rate" {Big}, "countryCode" {string} and "exceptionName" {string} or {null}
     */
    geoip2.calculateRate = function(countryCode, subdivision, city, addressCountryCode, addressException) {

        if (!countryCode || typeof(countryCode) !== 'string' || countryCode.length != 2) {
            throw new errors.ValueError('Invalidly formatted country code');
        }

        if (typeof(subdivision) !== 'string') {
            throw new errors.ValueError('Subdivision is not a string');
        }

        if (typeof(city) !== 'string') {
            throw new errors.ValueError('City is not a string');
        }

        countryCode = countryCode.toUpperCase();
        subdivision = subdivision.toLowerCase();
        city = city.toLowerCase();

        if (!(countryCode in rates.BY_COUNTRY)) {
            return {
                rate: Big('0.0'),
                countryCode: countryCode,
                exceptionName: null
            };
        }

        var countryDefault = rates.BY_COUNTRY[countryCode].rate;

        if (!(countryCode in GEOIP2_EXCEPTIONS)) {
            return {
                rate: countryDefault,
                countryCode: countryCode,
                exceptionName: null
            };
        }

        var exceptions = GEOIP2_EXCEPTIONS[countryCode];
        for (var matcher in exceptions) {
            var matchParts = matcher.split('/');

            var subMatch = matchParts[0];
            var cityMatch = matchParts[1];

            if (subMatch !== subdivision) {
                continue;
            }

            if (cityMatch && cityMatch !== city) {
                continue;
            }

            var info = exceptions[matcher];
            var exceptionName = info.name;
            if (!info.definitive) {
                if (typeof(addressCountryCode) === 'undefined') {
                    throw new errors.UndefinitiveError('It is not possible to determine the users VAT rates based on the information provided');
                }

                if (addressCountryCode !== countryCode) {
                    continue;
                }

                if (addressException !== exceptionName) {
                    continue;
                }
            }

            var rate = rates.BY_COUNTRY[countryCode].exceptions[exceptionName];
            return {
                rate: rate,
                countryCode: countryCode,
                exceptionName: exceptionName
            };
        }

        return {
            rate: countryDefault,
            countryCode: countryCode,
            exceptionName: null
        };
    }


    /**
     * Runs some basic checks to ensure a VAT ID looks properly formatted.
     *
     * @param {string} vatId  The VAT ID to check. Allows "GR" prefix for Greece, even though it should be "EL".
     *
     * @throws {errors.ValueError}    If the is not a string or is not in the format of two characters number an identifier
     * @throws {errors.InvalidError}  If the VAT ID is not valid
     * @return {object}  An object with the keys "countryCode" and "vatId" if ID looks like it may be valid. {null} if the VAT ID is blank or not for an EU country or Norway.
     */
    id.check = function(vatId) {

        if (!vatId) {
            return null;
        }

        if (typeof(vatId) !== 'string') {
            throw new errors.ValueError('VAT ID is not a string');
        }

        if (vatId.length < 3) {
            throw new errors.ValueError('VAT ID must be at least three character long');
        }

        // Normalize the ID for simpler regexes
        vatId = vatId.replace(/\s+/g, '');
        vatId = vatId.replace(/-/g, '');
        vatId = vatId.replace(/\./g, '');
        vatId = vatId.toUpperCase();

        var countryPrefix = vatId.substring(0, 2);

        // Fix people using GR prefix for Greece
        if (countryPrefix === 'GR') {
            vatId = 'EL' + vatId.substring(2);
            countryPrefix = 'EL';
        }

        if (!(countryPrefix in ID_PATTERNS)) {
            return null;
        }

        var number = vatId.substring(2);

        if (!ID_PATTERNS[countryPrefix].regex.test(number)) {
            throw new errors.InvalidError('VAT ID does not appear to be properly formatted for ' + countryPrefix);
        }

        return {
            countryCode: ID_PATTERNS[countryPrefix].code,
            vatId: vatId
        };
    }


    /**
     * Calculates the VAT rates based on a telephone number
     *
     * @param {string} phoneNumber         The phone number, in international format with leading +
     * @param {string} addressCountryCode  The user's countryCode, as detected from billingAddress or declaredResidence. This prevents an UndefinitiveError from being thrown.
     * @param {string} addressException    The user's exception name, as detected from billingAddress or declaredResidence. This prevents an UndefinitiveError from being thrown.
     * @throws {errors.ValueError}         error with phone number provided
     * @throws {errors.UndefinitiveError}  when no addressCountryCode and addressException are provided and the phone number area code matching isn't specific enough
     * @return {object}  An object with the keys "rate" {Big}, "countryCode" {string} and "exceptionName" {string} or {null}
     */
    phoneNumber.calculateRate = function(phoneNumber, addressCountryCode, addressException) {

        if (!phoneNumber) {
            throw new errors.ValueError('No phone number provided');
        }

        if (typeof(phoneNumber) !== 'string') {
            throw new errors.ValueError('Phone number is not a string');
        }

        phoneNumber = phoneNumber.replace(/^\s+|\s+$/g, '');
        phoneNumber = phoneNumber.replace(/[^+0-9]/g, '');

        if (!phoneNumber || phoneNumber[0] !== '+') {
            throw new errors.ValueError('Phone number is not in international format with a leading +');
        }

        phoneNumber = phoneNumber.substring(1);

        if (!phoneNumber) {
            throw new errors.ValueError('Phone number does not appear to contain any digits');
        }

        var countryCode = null;
        var leadingDigit = phoneNumber[0];

        if (leadingDigit in CALLING_CODE_MAPPING) {
            for (var i = 0; i < CALLING_CODE_MAPPING[leadingDigit].length; i++) {
                var mapping = CALLING_CODE_MAPPING[leadingDigit][i];
                if (!mapping[1].test(phoneNumber)) {
                    continue;
                }
                countryCode = mapping[0];
                break;
            }
        }

        if (!countryCode) {
            throw new errors.ValueError('Phone number does not appear to be a valid international phone number');
        }

        if (countryCode in CALLING_CODE_EXCEPTIONS) {
            for (var j = 0; j < CALLING_CODE_EXCEPTIONS[countryCode].length; j++) {
                var exception = CALLING_CODE_EXCEPTIONS[countryCode][j];

                if (!exception.regex.test(phoneNumber)) {
                    continue;
                }

                var mappedCountry = exception.code;
                var mappedName = exception.name;

                if (!exception.definitive) {
                    if (typeof(addressCountryCode) === 'null') {
                        throw new errors.UndefinitiveError('It is not possible to determine the users VAT rates based on the information provided');
                    }

                    if (addressCountryCode !== mappedCountry) {
                        continue;
                    }

                    if (addressException !== exception.name) {
                        continue;
                    }
                }

                var rate = rates.BY_COUNTRY[mappedCountry].exceptions[mappedName];
                return {
                    rate: rate,
                    countryCode: mappedCountry,
                    exceptionName: mappedName
                };
            }
        }

        if (!(countryCode in rates.BY_COUNTRY)) {
            return {
                rate: Big('0.0'),
                countryCode: countryCode,
                exceptionName: null
            };
        }

        return {
            rate: rates.BY_COUNTRY[countryCode].rate,
            countryCode: countryCode,
            exceptionName: null
        };
    }


})(typeof exports === 'undefined' ? this['vatMoss'] = {} : exports);
