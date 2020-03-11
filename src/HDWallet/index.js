import Web3 from 'web3';
import bip39 from 'bip39';
import bip32 from 'bip32';
export const initMasterAccount = async(_mnemonic) => {
  if(!_mnemonic) _mnemonic = await bip39.generateMnemonic();
  return new Promise((resolve, reject) => {
    try {
      if (bip39.validateMnemonic(_mnemonic)) {
        const sKeys = [];
        const seed = bip39.mnemonicToSeed(_mnemonic);
        const rootNode = bip32.fromSeed(seed);
        let encryptKey = null;
        let userKey = null;

        for (let idx = 0; idx < 3; idx++) {
          const addrNode = rootNode.derivePath("m/44'/60'/0'/0/" + idx);
          const sKeyBuffer = addrNode.privateKey;
          const sKey = '0x' + sKeyBuffer.toString('hex');
          // const pKeyBuffer = addrNode.publicKey;
          // const pKey = '0x' + pKeyBuffer.toString('hex');

          if (idx === 2) {
            userKey = web3.eth.accounts.privateKeyToAccount(sKey).address;
            userKey = web3.utils.toChecksumAddress(userKey);
            encryptKey = sKey;
          }
          sKeys.push(sKey);
        }

        resolve({ mnemonic: _mnemonic, privateKeys: sKeys, seed, encryptKey, userKey });
      }
      else {
        throw new Error('Invalid mnemonic');
      }
    } catch (err) {
      console.log('initMasterAccount error : ' + err);
      reject(err);    
    }
  });
}