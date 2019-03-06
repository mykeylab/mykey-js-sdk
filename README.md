# mykeyjs


## Basic Usage
```js
    let mykey = new Mykey()
    let account = 'mykeyhulu511'

    console.log(await mykey.getSignkey(account))
    console.log(await mykey.getAdminKey(account))
    console.log(await mykey.getOpKeys(account))
```
