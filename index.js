const fetch = require('node-fetch');
const { TextDecoder, TextEncoder } = require('text-encoding'); 
const {Api, JsonRpc, Serialize} = require('eosjs');

let Mykey = function (rpc){
    if(!rpc) rpc = new JsonRpc('https://public.eosinfra.io', { fetch });      
    this.eosJsonRpc = rpc
    this.api = new Api({ rpc: rpc, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    this.defaultMykeyMgr = "mykeymanager"
    this.defaultMykeyLogic = "mykeylogica1"
    
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

    this.getMykeyActionData = async(txid) => {
        let tx = await this.eosJsonRpc.history_get_transaction(txid)
        let first_action = tx.trx.trx.actions[0]
        if(first_action.account === this.defaultMykeyMgr && first_action.name === "sendaction"){
            return first_action.hex_data
        }else {
            throw new Error(`action data of tx: ${txid} is not found.`);
        }
    }

    this.deserializeMykeyActionData = async(action_data) => {
        let encoder = new TextEncoder()
        let decoder = new TextDecoder()
        let send_action = "sendaction"
        let mgr_contract = await this.api.getContract(this.defaultMykeyMgr)
        let logic_contract = await this.api.getContract(this.defaultMykeyLogic)
        let actdata_1 = await Serialize.deserializeActionData(mgr_contract, this.defaultMykeyMgr, send_action, action_data, encoder, decoder)

        if(actdata_1.act === "sendexternal") {
            let actdata_2 = await Serialize.deserializeActionData(logic_contract, this.defaultMykeyLogic, actdata_1.act, actdata_1.bin_data, encoder, decoder)
            let actdata_3 = await Serialize.deserializeActionData(mgr_contract, this.defaultMykeyMgr, "forward", actdata_2.data, encoder, decoder)
            // let target_contract = await this.api.getContract(actdata_3.target_contract)
            // let actdata_4 = await Serialize.deserializeActionData(target_contract, actdata_3.target_contract, actdata_3.act, actdata_3.data, encoder, decoder)
            return actdata_3
        }else {
            throw new Error(`only support sendexternal deserialize`);            
        }
    }
};

module.exports = Mykey