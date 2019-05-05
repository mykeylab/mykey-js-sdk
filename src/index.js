import { TextDecoder, TextEncoder } from 'text-encoding';
import 'isomorphic-fetch';
import {Api, JsonRpc, Serialize} from 'eosjs';

const defaultMykeyMgr = 'mykeymanager';
const defaultMykeyLogic = 'mykeylogica1';
const defaultEndpoint = 'https://public.eosinfra.io';

/**
 * Class Mykey, for developers easy access mykey account details.
 */
class Mykey {
  /**
   * Constructor for initialize Mykey instance
   * @constructor
   * @param {Object} opt - {endpoint: 'eosnode_rpc', defaultMykeyMgr: 'mykeymanager',  defaultMykeyLogic: 'mykeylogica1'}
   */
  constructor(opt = {}) {
    this.eosJsonRpc = new JsonRpc(opt.endpoint ? opt.endpoint : defaultEndpoint, {fetch});
    this.defaultMykeyMgr = opt.defaultMykeyMgr ? opt.defaultMykeyMgr : defaultMykeyMgr;
    this.defaultMykeyLogic = opt.defaultMykeyLogic ? opt.defaultMykeyLogic : defaultMykeyLogic;
    this.api = new Api({ rpc: this.eosJsonRpc, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
  }

  /**
   * Get contract name of mykey by specific account name (contract name are different in different deployment)
   * @param  {String}  name mykey account name
   * @return {String} Contract name on current deployment
   */
  async getMykeyMgr(name){
    const { permissions } = await this.eosJsonRpc.get_account(name)
    if (!permissions) {
       throw new Error(`permissions of account ${name} are not found.`);
    }
    const perm = permissions.find(p => p.perm_name === 'active')

    const { accounts} = perm.required_auth
    if (!accounts.length) {
        throw new Error(`permission of account ${name} are not accounts.`);
    }

    const mgrcontract = accounts[0].permission.actor;
    return mgrcontract;
  }


  /**
   * Get all public keys of mykey account, contains AdminKey and Operation Keys, details in
   * https://github.com/mykeylab/Documentation/blob/master/English/MYKEY%20on%20EOSIO.md#mykey-account-structure
   * @param  {String}  name account name
   * @return {Array}      Keys
   */
  async getAllKeys(name) {
      const mgrcontract = await this.getMykeyMgr(name)
      const result = await this.eosJsonRpc.get_table_rows({json:true, code:mgrcontract, scope:name, table:'keydata', limit:100})

      return result.rows
  }

  /**
   * Get AdminKey of mykey account which is top privilege, can manage other operation keys, details in
   * https://github.com/mykeylab/Documentation/blob/master/English/MYKEY%20on%20EOSIO.md#mykey-account-structure
   * @param  {String}  name account name
   * @return {String}      AdminKey
   */
  async getAdminKey(name) {
      const mgrcontract = await this.getMykeyMgr(name)
      const result = await this.eosJsonRpc.get_table_rows({json:true, code:mgrcontract, scope:name, table:'keydata', limit:1})
      const data = result.rows[0].key
      return data
  }

  /**
   * Get ReservedKey in mykey account which is for other actions without specific operation keys, details in
   * https://github.com/mykeylab/Documentation/blob/master/English/MYKEY%20on%20EOSIO.md#keys-in-table-keydata
   * @param  {String}  name account name
   * @return {String}      ReservedKey/the 3rd Operation Key
   */
  async getReservedKey(name) {
      const mgrcontract = await this.getMykeyMgr(name)
      const mykey_signkey_index = 3
      const keydata = await this.eosJsonRpc.get_table_rows({json:true, code:mgrcontract, scope:name, table:'keydata', lower_bound: mykey_signkey_index, limit:1})
      if(!keydata) return '';

      return keydata.rows[0].key.pubkey;
  }

  /**
   * Get wrapped hex_data of txid on mykeymanager
   * @param  {String}  txid transaction id
   * @return {String}      hex_data
   */
  async getMykeyActionData(txid){
      const tx = await this.eosJsonRpc.history_get_transaction(txid)
      const first_action = tx.trx.trx.actions[0]
      if(first_action.account === this.defaultMykeyMgr && first_action.name === 'sendaction'){
          return first_action.hex_data
      }else {
          throw new Error(`endpoint doesn't support history_plugin or action data of tx: ${txid} is not found.`);
      }
  }

  /**
   * Get readable action data object by hex_data
   * @param  {String}  hex_data hex data payload
   * @return {Object}      Action object
   */
  async deserializeMykeyActionData(hex_data) {
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      const send_action = 'sendaction'
      const mgr_contract = await this.api.getContract(this.defaultMykeyMgr)
      const logic_contract = await this.api.getContract(this.defaultMykeyLogic)
      const actdata_1 = await Serialize.deserializeActionData(mgr_contract, this.defaultMykeyMgr, send_action, hex_data, encoder, decoder)

      if(actdata_1.act === 'sendexternal') {
          const actdata_2 = await Serialize.deserializeActionData(logic_contract, this.defaultMykeyLogic, actdata_1.act, actdata_1.bin_data, encoder, decoder)
          const actdata_3 = await Serialize.deserializeActionData(mgr_contract, this.defaultMykeyMgr, 'forward', actdata_2.data, encoder, decoder)
          // let target_contract = await this.api.getContract(actdata_3.target_contract)
          // let actdata_4 = await Serialize.deserializeActionData(target_contract, actdata_3.target_contract, actdata_3.act, actdata_3.data, encoder, decoder)
          return actdata_3
      }else {
          throw new Error('only support sendexternal deserialize');
      }
  }
}

export default Mykey;
