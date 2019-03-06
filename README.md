# mykeyjs


## Basic Usage
```js
    const fetch = require('node-fetch');  
    const {JsonRpc} = require('eosjs');
    
    let mykey = new Mykey(new JsonRpc('https://public.eosinfra.io', { fetch }))
    
    //let mykey = new Mykey() // use default jsonrpc
    
    let account = 'mykeyhulu511'

    console.log(await mykey.getSignkey(account))
    console.log(await mykey.getAdminKey(account))
    console.log(await mykey.getOpKeys(account))
```
