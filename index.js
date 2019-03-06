const fetch = require('node-fetch');  
const {JsonRpc} = require('eosjs');

function Mykey(rpc){

    if(!rpc)
        rpc = new JsonRpc('https://public.eosinfra.io', { fetch });
    this.eosJsonRpc = rpc

    this.getMykeyMgr = async (name) =>  {
        const { permissions } = await this.eosJsonRpc.get_account(name)
        if (!permissions) {
            throw new Error(`permissions of account ${name} are not found.`);
        }
        const perm = permissions.find(p => p.perm_name === "active")

        const { accounts} = perm.required_auth
        if (!accounts.length) {
            throw new Error(`permission of account ${name} are not accounts.`);
        }

        let mgrcontract = accounts[0].permission.actor
        return mgrcontract
    }

    this.getAdminKey = async (name) =>  {
        let mgrcontract = await this.getMykeyMgr(name)
        let result = await this.eosJsonRpc.get_table_rows({json:true, code:mgrcontract, scope:name, table:'keydata', limit:1})
        let data = result.rows[0].key
        return data
    }

    this.getOpKeys = async (name) =>  {
        let mgrcontract = await this.getMykeyMgr(name)
        let result = await this.eosJsonRpc.get_table_rows({json:true, code:mgrcontract, scope:name, table:'keydata', limit:100})

        return result.rows
    }

    this.getSignkey = async(name) => {
        let mgrcontract = await this.getMykeyMgr(name)
        let mykey_signkey_index = 3
        let keydata = await this.eosJsonRpc.get_table_rows({json:true, code:mgrcontract, scope:name, table:'keydata', lower_bound: mykey_signkey_index, limit:1})
        if(!keydata) return "";

        return keydata.rows[0].key.pubkey;
    }   
};

module.exports = Mykey