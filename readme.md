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

### Determine VAT Rate from Declared Residence

### Determine VAT Rate from GeoLite2 Database

### Determine VAT Rate from International Phone Number

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
