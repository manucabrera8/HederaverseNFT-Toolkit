import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HederaApiService {

  baseUrlMainnet: string = "https://mainnet-public.mirrornode.hedera.com/";
  baseUrlTestnet: string = "https://testnet.mirrornode.hedera.com/";

  constructor(private http: HttpClient) { }

  checkAccountExist(accountId: string, testnetHedera: boolean): Observable<any> {
    let baseUrl = "";

    if(testnetHedera) {
      baseUrl = this.baseUrlTestnet;
    } else {
      baseUrl = this.baseUrlMainnet;
    }

    return this.http.get<any>(baseUrl+"api/v1/accounts/"+accountId);
  }
}
