import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AccountId, Client, CustomFixedFee, CustomRoyaltyFee, Hbar, PrivateKey, TokenCreateTransaction, TokenSupplyType, TokenType } from '@hashgraph/sdk';

import { CryptoService } from 'src/app/services/crypto.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { IsLoadingService } from 'src/app/services/is-loading.service';

@Component({
  selector: 'app-create-token',
  templateUrl: './create-token.component.html',
  styleUrls: ['./create-token.component.css']
})
export class CreateTokenComponent implements OnInit {

  @ViewChild('formDirective') private formDirective?: NgForm;

  form!: FormGroup;
  disableSubmit?: boolean;

  private client!: Client;
  private accountId!: AccountId;
  private privateKey!: PrivateKey;

  matcher = new MyErrorStateMatcher();

  constructor(private cryptoService: CryptoService, private isLoadingService: IsLoadingService, private _snackBar: MatSnackBar) {

    const localData = localStorage.getItem('userData');
    if(localData) {
      const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));

      this.accountId = AccountId.fromString(userDataJson.accountId);
      this.privateKey = PrivateKey.fromString(userDataJson.privateKey);

      if(userDataJson.testnet) {
        this.client = Client.forTestnet().setOperator(this.accountId, this.privateKey);
      } else {
        this.client = Client.forMainnet().setOperator(this.accountId, this.privateKey);
      }

    }
    
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', [
        Validators.required
      ]),
      maxSupply: new FormControl('', [
        Validators.required
      ]),
      royaltyFee: new FormControl(),
      royaltyAccountId: new FormControl(),
      fallbackFee: new FormControl(),
    }, { validators: this.validateRoyaltyFee });
  }

  validateRoyaltyFee: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
      let fallbackFeeValue = group.get("fallbackFee")?.value;
      let royaltyFeeValue = group.get("royaltyFee")?.value;
      let royaltyAccountIdValue = group.get("royaltyAccountId")?.value;
      
      if (fallbackFeeValue && !royaltyFeeValue && !royaltyAccountIdValue || fallbackFeeValue && royaltyFeeValue && !royaltyAccountIdValue || fallbackFeeValue && !royaltyFeeValue && royaltyAccountIdValue || !royaltyFeeValue && royaltyAccountIdValue || royaltyFeeValue && !royaltyAccountIdValue) {
        return { 'royaltyFeeRequired': true };
      }
      return null;
    
  }

  async createToken({name, maxSupply, customRoyaltyFee }: any) {
    const supplyKey = PrivateKey.generate();
    //Create the NFT
    let nftCreate = await new TokenCreateTransaction()
            .setTokenName(name)
            .setTokenSymbol(name)
            .setTokenType(TokenType.NonFungibleUnique)
            .setDecimals(0)
            .setInitialSupply(0)
            .setTreasuryAccountId(this.accountId)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(maxSupply)
            .setSupplyKey(supplyKey)
            .setCustomFees(customRoyaltyFee)
            .freezeWith(this.client);
    //Sign the transaction with the treasury key
    let nftCreateTxSign = await nftCreate.sign(this.privateKey);
    //Submit the transaction to a Hedera network
	  let nftCreateSubmit = await nftCreateTxSign.execute(this.client);
    //Get the transaction receipt
	  let nftCreateRx = await nftCreateSubmit.getReceipt(this.client);
    //Get the token ID
    let tokenId = nftCreateRx.tokenId;
    //Log the token ID
    console.log(`- Created Token with Token ID: ${tokenId} \n`);

    const userDataJson = JSON.parse(this.cryptoService.decrypt(localStorage.getItem('userData')!));

    var tokens = [];

    if(userDataJson.data?.tokens)
      tokens.push(...userDataJson.data.tokens)
      
    tokens.push({
      name: name,
      tokenId: tokenId?.toString(),
      supplyKey: supplyKey.toStringRaw(),
      maxSupply: maxSupply,
      nftType: "multiple",
      mintedNFT: 0
    });
    userDataJson.data = {tokens: tokens}

    localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify(userDataJson)));

    return tokenId;
  }

  async create(form: FormGroup) {
    this.isLoadingService.isLoading$.next(true);
    this.disableSubmit = true;

    const name = form.get('name')?.value;
    const maxSupply = form.get('maxSupply')?.value;
    const royaltyFee = form.get('royaltyFee')?.value;
    const royaltyAccountId = form.get('royaltyAccountId')?.value;
    const fallbackFee = form.get('fallbackFee')?.value;
    const customRoyaltyFee: any = [];
    let tokenId;

    if(royaltyFee) {
      const customFee = new CustomRoyaltyFee()
                        .setNumerator(royaltyFee) // The numerator of the fraction
                        .setDenominator(100); // The denominator of the fraction
      if (fallbackFee) {
        customFee.setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(fallbackFee))); // The fallback fee
      }
      customFee.setFeeCollectorAccountId(royaltyAccountId); // The account that will receive the royalty fee

      customRoyaltyFee.push(customFee);
    }

    try {
      tokenId  = await this.createToken({name, maxSupply, customRoyaltyFee});
    } catch (error) {
      this.isLoadingService.isLoading$.next(false);
      this.disableSubmit = false;
  
      this._snackBar.open('There was a problem! Make sure you have enough balance!', "Dismiss", {
        duration: 5000,
        panelClass: ['red-snackbar']
      });
      return
    }

    this.isLoadingService.isLoading$.next(false);
    this.disableSubmit = false;

    form.reset();

    this.formDirective?.resetForm();

    this._snackBar.open(`Created Token with Token ID: ${tokenId}`, "Dismiss", {
      duration: 5000
    });
  }

}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidParent = !!(
      control
      && control.parent
      && control.parent.invalid
      && control.parent.dirty
      && control.parent.hasError('royaltyFeeRequired')
    );

    return invalidParent;
  }
}