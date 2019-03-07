let Mykey = require('./index');

(async()=> {
    let mykey = new Mykey()
    let account = 'mykeyhulu511'

    console.log(await mykey.getAdminKey(account))
    console.log(await mykey.getSignkey(account))

    let txid = 'd65431c2aa72631cbeec80a16bd5605bf490a84d77df70768afe88f8741c4492' // mykey tx id
    let action_data = await mykey.getMykeyActionData(txid)
    console.log(JSON.stringify( action_data, null, 2))

    console.log(await mykey.deserializeMykeyActionData(action_data))
})()