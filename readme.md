# vat_moss

A library to determine the VAT rate for a customer of a company providing
digital services to individuals in the EU or Norway.

This readme primarily covers the JavaScript `vat_moss` library API. This is
a client-side port of features from the Python `vat_moss` libaray. Certain
features can not be directly implemented in the browser, such as validating a
VAT ID and fetching ECB exchange rates.

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
