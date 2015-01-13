# vat_moss

A Javascript library for VAT MOSS tasks required of non-EU companies selling
software to customers in the EU and Norway. Functionality includes:

 - Determining the VAT rate for a customer based on any of the following:
   - Billing address
   - Declared country of residence
   - IP address geolocation via a GeoLite2 database
   - Telephone number
 - Checking EU and Norwegian VAT IDs against basic formatting rules
 - Tools for generating VAT-compliant invoices:
   - Configuring exchange rate information for the `bigmoney.js` library
   - Formatting foreign currencies when displaying VAT tax due in national currency

This library has codified all of the standard rate VAT tax rules as of January
2015, and includes code to handle the various VAT exemptions that occur in the
EU. This was primarily built to support companies selling software licenses or
SaaS. *Ebook tax rates may be different - this library does not currently
differentiate for those.*

## Resources

In the process of writing this library, I performed quite a bit of research
about VAT, VAT MOSS and how to deal with it as a small software company.
Hopefully the information below will prove useful to others:

 - [VAT MOSS Overview](https://github.com/wbond/vat_moss-python/blob/master/overview.md) -
   a document discussing the non-code aspects of VAT MOSS, such as general
   concepts and terms, proof of supply details, exchange rates, invoices,
   registration and returns
 - [VAT MOSS Implementation Approach](https://github.com/wbond/vat_moss-python/blob/master/approach.md) -
   a document discussing how I am using this library and `vat_moss-python` to
   deal with VAT MOSS
 - [vat_moss-python](https://github.com/wbond/vat_moss-python) - the original
   library that this was ported from. The Python library includes extra features
   that are not possible in the browser, such as full validation of VAT IDs
   and fetching of exchange rate information.

## Runtime Dependencies

 - **Required:** [big.js](https://github.com/MikeMcl/big.js/) 3.x
 - **Optional:** [bigmoney.js](https://github.com/demchenkoe/bigmoney.js/)

## API

 - [Determine VAT Rate from Billing Address](#determine-vat-rate-from-billing-address)
 - [Determine VAT Rate from Declared Residence](#determine-vat-rate-from-declared-residence)
 - [Determine VAT Rate from GeoLite2 Database](#determine-vat-rate-from-geolite2-database)
 - [Determine VAT Rate from International Phone Number](#determine-vat-rate-from-international-phone-number)
 - [Check VAT ID Formatting](#check-vat-id-formatting)
 - [Configure bigmoney.js Exchange Rates](#configure-bigmoneyjs-exchange-rates)
 - [Format European Currencies for Invoices](#format-european-currencies-for-invoices)

### Determine VAT Rate from Billing Address

The user's VAT Rate can be determined by processing a payment and using the
billing address returned by the payment provider.

The method signature is
`vatMoss.billingAddress.calculateRate(countryCode, postalCode, city)`.
This will return an object with the keys:

 - `rate` - a `Big` object representing the tax rate
 - `countryCode` - the country the tax rate is based on (with exception this doesn't always matching billing address country)
 - `exceptionName` - if the address is detected as being in a VAT exception area, that name of the exception, else `null`

The exception name will be one of the exemptions to the normal VAT rates. See
the end of http://ec.europa.eu/taxation_customs/resources/documents/taxation/vat/how_vat_works/rates/vat_rates_en.pdf
for a full list.

```js
try {
    // Values from payment provider
    var countryCode = 'US';
    var postalCode = '01950';
    var city = 'Newburyport';

    var result = vatMoss.billingAddress.calculateRate(countryCode, postalCode, city);

    // Combine with other rate detection and then show user tax rate/amount

} catch (e) {
    // vatMoss.errors.ValueError - One of the user input values is empty or not a string
}
```

For place of supply proof, you should save the country code, postal code, city
name, detected rate and any exception name.

### Determine VAT Rate from Declared Residence

The user's VAT Rate can be determined by prompting the user with a list of
valid countries obtained from `vatMoss.declaredResidence.options()`. If the
user chooses a country with one or more exceptions, the user should be
presented with another list of "None" and each exception name. This should be
labeled something like: "Special VAT Rate".

The method signature to get the appropriate rate is
`vatMoss.declaredResidence.calculateRate(countryCode, exceptionName)`.
This will return an object with the keys:

 - `rate` - a `Big` object representing the tax rate
 - `countryCode` - the country the tax rate is based on (with exception this doesn't always matching billing address country)
 - `exceptionName` - if the address is detected as being in a VAT exception area, that name of the exception, else `null`

The exception name will be one of the exemptions to the normal VAT rates. See
the end of http://ec.europa.eu/taxation_customs/resources/documents/taxation/vat/how_vat_works/rates/vat_rates_en.pdf
for a full list.

```js
try {
    // Loop through this array of objects and build a <select> using the 'name'
    // key as the text and 'code' key as the value. The 'exceptions' key is an
    // array of valid VAT exception names for that country. You will probably
    // want to show a checkbox if the selected country has exceptions, and then
    // present the user with another <select> allowing then to pick "None" or
    // one of the exception names.
    var residenceOptions = vatMoss.declaredResidence.options();

    // Values from user input
    var countryCode = 'DE';
    var exceptionName = 'Heligoland';

    var result = vatMoss.declaredResidence.calculateRate(countryCode, exceptionName);

    // Combine with other rate detection and then show user tax rate/amount

} catch (e) {
    // vatMoss.errors.ValueError - One of the user input values is empty or not a string
}
```

For place of supply proof, you should save the country code, detected rate and
any exception name.

### Determine VAT Rate from GeoLite2 Database

The company MaxMind offers a
[http://dev.maxmind.com/geoip/geoip2/geolite2/](free geo IP lookup database).

For this you'll need to install something like the [nginx module](https://github.com/leev/ngx_http_geoip2_module),
[apache module](https://github.com/maxmind/mod_maxminddb) or one of the various
[programming language packages](http://dev.maxmind.com/geoip/geoip2/web-services/).
And then make the data available to JS.

Personally I like to do it at the web server level since it is fast and always
available.

Once you have the data, you need to feed the country code, subdivision name and
city name into the method
`vatMoss.geoip2.calculateRate(countryCode, subdivision, city, addressCountryCode, addressException)`.
The `subdivision` should be the first subdivision name from the GeoLite2
database. The `addressCountryCode` and `addressException` should be from
`vatMoss.billingAddress.calculateRate()` or
`vatMoss.declaredResidence.calculateRate()`. This information is necessary
since some exceptions are city-specific and can't solely be detected by the
user's IP address. This will return an object with the keys:

 - `rate` - a `Big` object representing the tax rate
 - `countryCode` - the country the tax rate is based on (with exception this doesn't always matching billing address country)
 - `exceptionName` - if the address is detected as being in a VAT exception area, that name of the exception, else `null`

The exception name will be one of the exemptions to the normal VAT rates. See
the end of http://ec.europa.eu/taxation_customs/resources/documents/taxation/vat/how_vat_works/rates/vat_rates_en.pdf
for a full list.

```js
try {
    // Values from web server or API
    var ip = '8.8.4.4';
    var countryCode = 'US';
    var subdivisionName = 'Massachusetts';
    var cityName = 'Newburyport';

    // Values from the result of vatMoss.billingAddress.calculateRate() or
    // vatMoss.declaredResidence.calculateRate()
    var addressCountryCode = 'US';
    var addressException = null;

    var result = vatMoss.geoip2.calculateRate(countryCode, subdivisionName, cityName, addressCountryCode, addressException);

    // Save place of supply proof and show user tax rate/amount

} catch (e) {
    // vatMoss.errors.ValueError - One of the user input values is empty or not a string
}
```

For place of supply proof, you should save the IP address; country code,
subdivision name and city name from GeoLite2; the detected rate and any
exception name.

#### Omitting addressCountryCode and addressException

If the `addressCountryCode` and `addressException` are not provided, in some
situations this function will not be able to definitively determine the
VAT rate for the user. This is because some exemptions are for individual
cities, which are only tracked via GeoLite2 at the district level. This sounds
confusing, but if you look at the GeoLite2 data, you'll see some of the city
entries are actually district names. Lame, I know.

In those situations, a `vatMoss.errors.UndefinitiveError()` exception will be
thrown.

### Determine VAT Rate from International Phone Number

Prompt the user for their international phone number (with leading +). Once
you have the data, you need to feed the phone number to
`vatMoss.phoneNumber.calculateRate(phoneNumber, addressCountryCode, addressException)`.
The `addressCountryCode` and `addressException` should be from
`vatMoss.billingAddress.calculateRate()` or
`vatMoss.declaredResidence.calculateRate()`. This information is necessary
since some exceptions are city-specific and can't solely be detected by the
user's phone number. This will return an object with the keys:

 - `rate` - a `Big` object representing the tax rate
 - `countryCode` - the country the tax rate is based on (with exception this doesn't always matching billing address country)
 - `exceptionName` - if the address is detected as being in a VAT exception area, that name of the exception, else `null`

The exception name will be one of the exemptions to the normal VAT rates. See
the end of http://ec.europa.eu/taxation_customs/resources/documents/taxation/vat/how_vat_works/rates/vat_rates_en.pdf
for a full list.

```js
try {
    // Values from user
    var phoneNumber = '+19785720330';

    // Values from the result of vatMoss.billingAddress.calculateRate() or
    // vatMoss.declaredResidence.calculateRate()
    var addressCountryCode = 'US';
    var addressException = null;

    var result = vatMoss.phoneNumber.calculateRate(phoneNumber, addressCountryCode, addressException);

    // Save place of supply proof and show user tax rate/amount

} catch (e) {
    // vatMoss.errors.ValueError - One of the user input values is empty or not a string
}
```

For place of supply proof, you should save the phone number, detected rate and
any exception name.

#### Omitting addressCountryCode and addressException

If the `addressCountryCode` and `addressException` are not provided, in some
situations this function will not be able to definitively determine the
VAT rate for the user. This is because some exemptions are for individual
cities, which can not be definitely determined by the user's phone number area
code.

In those situations, a `vatMoss.errors.UndefinitiveError()` exception will be
thrown.

### Check VAT ID Formatting

### Configure bigmoney.js Exchange Rates

### Format Eurpean Currencies for Invoices

## Tests

To run tests, you'll need node and npm installed. The following command will
install dependencies required:

```bash
npm --local install big.js nodeunit nodeunit-dataprovider
```

Test are run by executing:

```bash
node tests.js
```

## Minification

If you want a minified version and have node installed on your machine, the
following command will create it.

```bash
npm --local install uglify-js
./node_modules/uglify-js/bin/uglifyjs --compress --mangle -- vat_moss.js > vat_moss.min.js
```
