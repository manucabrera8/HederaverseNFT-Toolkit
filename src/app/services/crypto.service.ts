import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }

  generateKey() {
    return CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(32))
  }

  encrypt(value : string) : string {

    var encryptSecretKey;
    var salt;
    var keySize = 256;
    var iterations = 10000;
    var key;
    var iv;

    if (localStorage.getItem('userKeyInfo') !== null) {
      const userKeyInfo = JSON.parse(localStorage.getItem('userKeyInfo')!);

      encryptSecretKey = userKeyInfo.AESKey;

      salt = userKeyInfo.salt;

      key = userKeyInfo.hash;

      iv = userKeyInfo.iv;

    } else {

      encryptSecretKey = this.generateKey();

      salt = CryptoJS.lib.WordArray.random(128/8);

      key = CryptoJS.PBKDF2(encryptSecretKey, salt, {
        keySize: keySize/16,
        iterations: iterations
      });

      iv = CryptoJS.lib.WordArray.random(128/8);

      const userKeyInfo = {
        AESKey: encryptSecretKey,
        hash: {
          sigBytes: key.sigBytes,
          words: key.words
        },
        iterations: iterations,
        iv: iv,
        salt: salt
      };
      localStorage.setItem('userKeyInfo', JSON.stringify(userKeyInfo));
    }
    
    var encrypted = CryptoJS.AES.encrypt(value, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    return encrypted.toString();
  }

  decrypt(value : string): string {

    const userKeyInfo = JSON.parse(localStorage.getItem('userKeyInfo')!);

    var iv = CryptoJS.lib.WordArray.create(userKeyInfo.iv.words, userKeyInfo.iv.sigBytes);
    var key = CryptoJS.lib.WordArray.create(userKeyInfo.hash.words, userKeyInfo.hash.sigBytes);

    var decrypted = CryptoJS.AES.decrypt(value, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  encryptBackup(data: string): string {
    const encryptSecretKey = this.generateKey();
    return CryptoJS.AES.encrypt(JSON.stringify(data), encryptSecretKey).toString() + encryptSecretKey;
  }

  decryptBackup(data: string): string {
    const bytes = CryptoJS.AES.decrypt(data.substring(0, data.length - 44), data.substring(data.length - 44));
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

}
