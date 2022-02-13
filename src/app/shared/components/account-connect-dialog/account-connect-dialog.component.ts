import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { PrivateKey } from '@hashgraph/sdk';

import { CryptoService } from '../../../services/crypto.service';
import { AccountExistValidator } from '../../validators/account-exist.validator';

@Component({
  selector: 'app-account-connect-dialog',
  templateUrl: './account-connect-dialog.component.html',
  styleUrls: ['./account-connect-dialog.component.css']
})
export class AccountConnectDialogComponent implements OnInit {

  connectForm!: FormGroup;
  testnetHedera: boolean = false;

  constructor(public dialogRef: MatDialogRef<AccountConnectDialogComponent>, private cryptoService: CryptoService, private accountExistValidator: AccountExistValidator) { }

  ngOnInit(): void {
    this.connectForm = new FormGroup({
      accountId: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^0\.0\.([0-9])+$'),
      ]),
      [this.accountExistValidator.validator()],
      ),
      privateKey: new FormControl('', [
        Validators.required,
        Validators.minLength(96)
      ],),
      testnetHedera: new FormControl(),
    });
  }

  get accountId() { return this.connectForm.get('accountId')!; }
  get privateKey() { return this.connectForm.get('privateKey')!; }

  getErrorMessageAccountId() {
    return this.accountId.hasError('required') ? 'Account id is required' :
        this.accountId.hasError('pattern') ? 'Please enter a valid account id.(Ex: 0.0.12345)' :
        this.accountId.hasError('accountNotExist') ? 'This account does not exist' :
            '';
  }

  getErrorMessagePrivateKey() {
    return this.privateKey.hasError('required') ? 'Private key is required' :
        this.privateKey.hasError('minlength') ? 'Private key too short' :
        this.privateKey.hasError('belong') ? 'Private Key does not belong to Account ID.' :
            '';
  }

  clickOK(): void {

    const _privateKey = PrivateKey.fromString(this.privateKey.value);
    const pubKey = localStorage.getItem("publicKey");

    if(pubKey == _privateKey.publicKey.toStringRaw()) {
      localStorage.removeItem("publicKey");
      const localData = localStorage.getItem('userData');
      if(localData) {
        const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));
        userDataJson.accountId = this.accountId.value;
        userDataJson.privateKey = this.privateKey.value;
        userDataJson.testnet = this.testnetHedera;

        localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify(userDataJson)));
      } else {
        localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify({
          accountId: this.accountId.value,
          privateKey: this.privateKey.value,
          testnet: this.testnetHedera
        })));
      }

      this.dialogRef.close({isConnect: true});
    } else {
      this.privateKey.setErrors({ belong: true })
    }
  }

  onChange(event: any): void {
    this.testnetHedera = event.checked;
    this.accountId.setValue(this.accountId.value);
  }

  onCancel(): void {
    this.dialogRef.close({isConnect: false});
  }

}