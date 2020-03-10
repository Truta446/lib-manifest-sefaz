'use strict'

const xmlJs = require('xml-js')
const xmlCrypto = require('xml-crypto') 
const axios = require('axios')
const https = require('https') 
const moment = require('moment')

class ManifestSefaz {
  manifestXml = async (cnpj, nsu, chNFe, cert, key, passphrase) => {
    try {
      const xml = this._mountXml(chNFe, nsu, cnpj)
      const xmlSign = this._signingXml(xml, cert, key)

      await this._sendXml(xmlSign, cert, key, passphrase)

      console.log(
        `Finalizando o processo de manifestação da nota: ${chNFe}`,
      )
    } catch (err) {
      console.log(`Erro ao realizar as requisições: ${err}`)
    }
  }

  _mountXml = (chNFe, nsu, cnpj) => {
    const json = {
      elements: [
        {
          type: 'element',
          name: 'envEvento',
          attributes: {
            xmlns: 'http://www.portalfiscal.inf.br/nfe',
            versao: '1.00',
          },
          elements: [
            {
              type: 'element',
              name: 'idLote',
              elements: [
                {
                  type: 'text',
                  text: nsu,
                },
              ],
            },
            {
              type: 'element',
              name: 'evento',
              attributes: { versao: '1.00' },
              elements: [
                {
                  type: 'element',
                  name: 'infEvento',
                  attributes: { Id: `ID210210${chNFe}01` },
                  elements: [
                    {
                      type: 'element',
                      name: 'cOrgao',
                      elements: [
                        {
                          type: 'text',
                          text: '91',
                        },
                      ],
                    },
                    {
                      type: 'element',
                      name: 'tpAmb',
                      elements: [
                        {
                          type: 'text',
                          text: '1',
                        },
                      ],
                    },
                    {
                      type: 'element',
                      name: 'CNPJ',
                      elements: [
                        {
                          type: 'text',
                          text: cnpj,
                        },
                      ],
                    },
                    {
                      type: 'element',
                      name: 'chNFe',
                      elements: [
                        {
                          type: 'text',
                          text: chNFe,
                        },
                      ],
                    },
                    {
                      type: 'element',
                      name: 'dhEvento',
                      elements: [
                        {
                          type: 'text',
                          text: moment().format(),
                        },
                      ],
                    },
                    {
                      type: 'element',
                      name: 'tpEvento',
                      elements: [
                        {
                          type: 'text',
                          text: '210210',
                        },
                      ],
                    },
                    {
                      type: 'element',
                      name: 'nSeqEvento',
                      elements: [
                        {
                          type: 'text',
                          text: '1',
                        },
                      ],
                    },
                    {
                      type: 'element',
                      name: 'verEvento',
                      elements: [
                        {
                          type: 'text',
                          text: '1.00',
                        },
                      ],
                    },
                    {
                      type: 'element',
                      name: 'detEvento',
                      attributes: { versao: '1.00' },
                      elements: [
                        {
                          type: 'element',
                          name: 'descEvento',
                          elements: [
                            {
                              type: 'text',
                              text: 'Ciencia da Operacao',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    return xmlJs.json2xml(json)
  }

  _signingXml = (xml, cert, key) => {
    const sig = new xmlCrypto.SignedXml()

    sig.keyInfoProvider = new _MyKeyInfo(cert)
    sig.addReference("//*[local-name(.)='infEvento']", [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ])
    sig.canonicalizationAlgorithm =
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
    sig.signingKey = key
    sig.computeSignature(xml, {
      location: {
        reference: "//*[local-name(.)='infEvento']",
        action: 'after',
      },
    })

    return sig.getSignedXml()
  }

  _sendXml = async (xmlSign, cert, key, passphrase) => {
    try {
      const instance = axios.create({
        httpsAgent: new https.Agent({
          cert,
          key,
          passphrase,
        }),
        headers: { 'Content-Type': 'text/xml' },
      })

      await instance
        .post(
          'https://www.nfe.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx?wsdl',
          `
              <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfer="http://www.portalfiscal.inf.br/nfe/wsdl/NFeRecepcaoEvento4">
              <soapenv:Header/>
              <soapenv:Body>
                  <nfer:nfeDadosMsg>
                  ${xmlSign}
                  </nfer:nfeDadosMsg>
              </soapenv:Body>
              </soapenv:Envelope>
          `,
        )
        .then((response) => {
          const test12 = JSON.parse(
            xmlJs.xml2json(response.data.replace(/:/g, ''), {
              compact: true,
              textKey: 'value',
            }),
          )
          const xMotivo =
            test12.soapEnvelope.soapBody.nfeRecepcaoEventoNFResult.retEnvEvento
              .retEvento.infEvento.xMotivo.value
          const cStat =
            test12.soapEnvelope.soapBody.nfeRecepcaoEventoNFResult.retEnvEvento
              .retEvento.infEvento.cStat.value

          console.log(`${cStat} - ${xMotivo}`)
        })
    } catch (err) {
      console.log(`Erro ao tentar enviar a nota para a SEFAZ: ${err}`)
    }
  }
}

function _MyKeyInfo(cert) {
  this.getKeyInfo = function() {
    return `<X509Data><X509Certificate>${cert
      .split('-----')[2]
      .replace(/[\r\n]/g, '')}</X509Certificate></X509Data>`
  }
}

module.exports = ManifestSefaz
