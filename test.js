let Mykey = require('./index');

(async()=> {
    let mykey = new Mykey()
    let account = 'mykeyhulu511'

    console.log(await mykey.getAdminKey(account))
    console.log(await mykey.getSignkey(account))

})()