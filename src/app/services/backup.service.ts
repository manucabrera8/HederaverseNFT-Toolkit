import { Injectable } from '@angular/core';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class BackupService {

  constructor(private cryptoService: CryptoService) { }

  export() {
    const localData = localStorage.getItem('userData');
    const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));
    if(userDataJson.privateKey)
      delete userDataJson.privateKey;

    if(userDataJson.nftStorageApiKey)
      delete userDataJson.nftStorageApiKey;

    const encryptedData = this.cryptoService.encryptBackup(userDataJson);

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(encryptedData));
    element.setAttribute('download', `${userDataJson.accountId}_${new Date().toLocaleDateString()}.backup`);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

  Import(importData: any, userDataJson: any) {
    if(userDataJson.data) {
      for(let _token of importData.data.tokens) {
        const tokensData = userDataJson.data.tokens as any[];
        if(!tokensData.some((obj) => obj.tokenId === _token.tokenId)) {
          userDataJson.data.tokens.push(_token);
        }
      }
    } else {
      userDataJson.data = importData.data;
    }

    localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify(userDataJson)));
  }
}


