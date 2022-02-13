import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { catchError, map, Observable, of } from "rxjs";
import { HederaApiService } from "src/app/services/hedera-api.service";

@Injectable({ 
  providedIn: 'root' 
})
export class AccountExistValidator {

    constructor(private hederaApiService: HederaApiService) { }

    validator(): AsyncValidatorFn {
      return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return this.hederaApiService.checkAccountExist(control.value, control.parent?.get("testnetHedera")?.value).pipe(
          map(account => {
              localStorage.setItem("publicKey", account.key.key);
              return null;
          }),
          catchError(() => {
              return of({ accountNotExist: true })
          }),
        );
      };
    }
}
