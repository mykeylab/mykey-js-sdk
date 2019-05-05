import MyKey from '../src/index';
import { assert , expect} from 'chai';
import 'mocha';

describe('Init', () => {

	const mykey = new MyKey(); // Instance of class MyKey

	/*
		Query table keydata with scope {accountName} in https://bloks.io/account/mykeymanager
		Results:
			0	{ "pubkey": "EOS6dbLfCLhjfxqDDyarob8ZcgZDNbK1gSHyuPGCNrWT1NuCKGzsU", "status": 0, "nonce": 0 }
			1	{ "pubkey": "EOS6BV67iwvy2pKvxfVdwzgLwcyKTVMxwE1qZp3ohocqC5LSF5ihG", "status": 0, "nonce": 22 }
			2	{ "pubkey": "EOS6tAtEQPdkE29QguefBChWxRbEkyY7Sxh5Ls7GvdEN7utmxJyhX", "status": 0, "nonce": 0 }
			3	{ "pubkey": "EOS4vK4xdvskgWz9DAiajxtvPAe9D4AzGAHZspdvdmKVmPnBW12EW", "status": 0, "nonce": 2 }
	*/

	const accountName = 'mykeyhulu511'


	it('init class', () => {
		assert.typeOf(MyKey, 'function');
	});

	it('getMykeyMgr', async () => {
		const contractAccount = await mykey.getMykeyMgr(accountName);
		expect(contractAccount).to.equal('mykeymanager');
	});

	it('getAdminKey', async () => {
		const adminKey = await mykey.getAdminKey(accountName);
		assert.equal(adminKey.pubkey, 'EOS6dbLfCLhjfxqDDyarob8ZcgZDNbK1gSHyuPGCNrWT1NuCKGzsU');
	});

	it('getAllKeys', async () => {
		const opKeys = await mykey.getAllKeys(accountName);
		assert.equal(opKeys[0]['key'].pubkey, 'EOS6dbLfCLhjfxqDDyarob8ZcgZDNbK1gSHyuPGCNrWT1NuCKGzsU');
		assert.equal(opKeys[1]['key'].pubkey, 'EOS6BV67iwvy2pKvxfVdwzgLwcyKTVMxwE1qZp3ohocqC5LSF5ihG');
		assert.equal(opKeys[2]['key'].pubkey, 'EOS6tAtEQPdkE29QguefBChWxRbEkyY7Sxh5Ls7GvdEN7utmxJyhX');
		assert.equal(opKeys[3]['key'].pubkey, 'EOS4vK4xdvskgWz9DAiajxtvPAe9D4AzGAHZspdvdmKVmPnBW12EW');
	});

	it('getReservedKey', async () => {
		const signKeys = await mykey.getReservedKey(accountName);
		assert.equal(signKeys, 'EOS4vK4xdvskgWz9DAiajxtvPAe9D4AzGAHZspdvdmKVmPnBW12EW');
	});

	it('getActionDataAndDeserialize', async() => {
		const txid = 'd65431c2aa72631cbeec80a16bd5605bf490a84d77df70768afe88f8741c4492' // mykey tx id
		const action_data = await mykey.getMykeyActionData(txid);
		assert(action_data, `10cdbc2a7795a6c2bd01002065c24490afc44e66fe1d061b125af974e64064a36731a5b00c4365ab9576f07850d7d9a57363a632ea1b7878c0e3c9e53069d8a77173ab4f867eacf8b17242427a00a6823403ea3055000000572d3ccdcd7055
		ceea4c97b362617055ceea4c97b362309d4c462197b23ae80300000000000004454f530000000040616374696f6e3a6265742c736565643a583976774b53496868374d55435675496d7a2c726f6c6c556e6465723a35302c7265663a6d796b
		657975736572787878`);
		const deserialize_data = await mykey.deserializeMykeyActionData(action_data);
		assert(deserialize_data.target_contract, 'eosio.token');
		assert(deserialize_data.act, 'transfer');
		assert(deserialize_data.signer, 'gettinbetter');
	});

});
