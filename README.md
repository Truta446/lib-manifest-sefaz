# manifest-sefaz

> Simple way to communicate with SEFAZ SOAP web services

## Install

```shell
$ npm install manifest-sefaz
```

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e6e0d59bda3a4d2f8a5f89514953dd08)](https://app.codacy.com/manual/Truta446/lib-manifest-sefaz?utm_source=github.com&utm_medium=referral&utm_content=Truta446/lib-manifest-sefaz&utm_campaign=Badge_Grade_Dashboard)
[![build status](https://travis-ci.org/Truta446/lib-manifest-sefaz.svg?branch=master)](https://travis-ci.org/Truta446/lib-manifest-sefaz)

## Usage

```js
const manifestSefaz = require('lib-manifest-sefaz')

const cnpj = '00.000.000/0000-00'
const nsu = '000000000002774'
const chNFe = '33200304214716000142950016001908041118869319'
const cert = 'Bag Attributes localKeyID: 01 00 00 00 friendlyName:'
const key = 'Bag Attributes localKeyID: 01 00 00 00 friendlyName: PRIVATE'
const passphrase = 'passphrase'

// Example
const nameOfFunction = async () => {
  try {
    await manifestSefaz.manifestXml(cnpj, nsu, chNFe, cert, key, passphrase)
  } catch(err) {
    console.error(err)
  }
}
```

## API

### manifestXml(cnpj, nsu, chNFe, cert, key, passphrase)

#### cnpj

Type: `string`
Length: 18

CNPJ of supplier company

#### NSU

Type: `string`
Length: 15

Order number about NF on SEFAZ

#### chNFe

Type: `string`
Length: 44

Key of NF

#### cert

Type: `string`

Certificate of supplier generate by SEFAZ

#### key

Type: `string`

Private certificate of supplier generate by SEFAZ

#### passphrase

Type: `string`

Passphrase of certificates

## Libraries used in this project:

 - [xml-js](https://github.com/nashwaan/xml-js)
 - [xml-crypto](https://github.com/yaronn/xml-crypto)
 - [axios](https://github.com/axios/axios)
 - [https](https://registry.npmjs.org/https/-/https-1.0.0.tgz)
 - [moment](https://github.com/moment/moment/)

## Command to extract certificate and private key:

```shell
$ openssl pkcs12 -in name_of_file.pfx -clcerts -nokeys -out cert.pem && openssl pkcs12 -in name_of_file.pfx -nocerts -out key.pem -nodes
```

## License

Martini is distributed by The [MIT License](./LICENSE), see LICENSE