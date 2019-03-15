# mykeyjs-js-sdk

It helps dapps easy to compatiable with MYKEY. 

## What are the differences on MYKEY?

Please refer to this document:
[MYKEY on EOS](https://github.com/mykeylab/Documentation/blob/master/English/MYKEY%20on%20EOSIO.md)


## How to install

```
npm i @mykeylab/mykey-js-sdk
```

## Basic usage

```js

const Mykey = require('@mykeylab/mykey-js-sdk');

(async()=> {
    let mykey = new Mykey() // use default jsonrpc

    // const fetch = require('node-fetch');  
    // const {JsonRpc} = require('eosjs');
    // let mykey = new Mykey(new JsonRpc('https://public.eosinfra.io', { fetch }))

    let account = 'mykeyhulu511'
    console.log(await mykey.getSignkey(account))
    console.log(await mykey.getAdminKey(account))
    console.log(await mykey.getOpKeys(account))

    let txid = 'd65431c2aa72631cbeec80a16bd5605bf490a84d77df70768afe88f8741c4492' // mykey tx id
    let action_data = await mykey.getMykeyActionData(txid)
    console.log(await mykey.deserializeMykeyActionData(action_data))
})()

```
