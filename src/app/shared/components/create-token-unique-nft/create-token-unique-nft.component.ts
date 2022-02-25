import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AccountId, Client, CustomFixedFee, CustomRoyaltyFee, Hbar, PrivateKey, TokenCreateTransaction, TokenMintTransaction, TokenSupplyType, TokenType } from '@hashgraph/sdk';

import { NFTStorage } from 'nft.storage';
import { CryptoService } from 'src/app/services/crypto.service';
import { Buffer } from 'buffer';
import axios from 'axios';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { IsLoadingService } from 'src/app/services/is-loading.service';

@Component({
  selector: 'app-create-token-unique-nft',
  templateUrl: './create-token-unique-nft.component.html',
  styleUrls: ['./create-token-unique-nft.component.css']
})
export class CreateTokenUniqueNFTComponent implements OnInit {

  @Output() isLoading = new EventEmitter<boolean>();

  @ViewChild('formDirective') private formDirective?: NgForm;

  form!: FormGroup;
  disableSubmit?: boolean;

  _file!: File;
  _format: any;
  _url: any;

  categories: any[] = [
    {value: 'Art', viewValue: 'Art'},
    {value: 'Collectible', viewValue: 'Collectible'},
    {value: 'Digital art', viewValue: 'Digital art'},
    {value: 'Photo', viewValue: 'Photo'},
    {value: 'Video', viewValue: 'Video'}
  ];

  private client!: Client;
  private accountId!: AccountId;
  private privateKey!: PrivateKey;
  private nftStorageApiKey!: string;

  private selectedMetadata?: number;

  matcher = new MyErrorStateMatcher();

  constructor(private cryptoService: CryptoService, private isLoadingService: IsLoadingService, private _snackBar: MatSnackBar) { 
    const localData = localStorage.getItem('userData');
    if(localData) {
      const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));

      this.nftStorageApiKey = userDataJson.nftStorageApiKey;

      this.accountId = AccountId.fromString(userDataJson.accountId);
      this.privateKey = PrivateKey.fromString(userDataJson.privateKey);

      if(userDataJson.testnet) {
        this.client = Client.forTestnet().setOperator(this.accountId, this.privateKey);
      } else {
        this.client = Client.forMainnet().setOperator(this.accountId, this.privateKey);
      }

      if(userDataJson.metadata) {
        this.selectedMetadata = userDataJson.metadata;
      } else {
        this.selectedMetadata = 2;
      }

    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', [
        Validators.required
      ]),
      description: new FormControl('', [
        Validators.required
      ]),
      creator: new FormControl('', [
        Validators.required
      ]),
      quantity: new FormControl('', [
        Validators.required
      ]),
      category: new FormControl('', [
        Validators.required
      ]),
      file: new FormControl('', [
        Validators.required
      ]),
      royaltyFee: new FormControl(),
      royaltyAccountId: new FormControl(),
      fallbackFee: new FormControl(),
    }, { validators: this.validateRoyaltyFee });
  }

  get file() { return this.form.get('file')!; }

  validateRoyaltyFee: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
      let fallbackFeeValue = group.get("fallbackFee")?.value;
      let royaltyFeeValue = group.get("royaltyFee")?.value;
      let royaltyAccountIdValue = group.get("royaltyAccountId")?.value;
      
      if (fallbackFeeValue && !royaltyFeeValue && !royaltyAccountIdValue || fallbackFeeValue && royaltyFeeValue && !royaltyAccountIdValue || fallbackFeeValue && !royaltyFeeValue && royaltyAccountIdValue || !royaltyFeeValue && royaltyAccountIdValue || royaltyFeeValue && !royaltyAccountIdValue) {
        return { 'royaltyFeeRequired': true };
      }
      return null;
    
  }


  async storeFile(media: File) {

    const { data } = await axios.post(
      'https://api.nft.storage/upload', media,
      {
        headers: {
          'Content-Type': media.type,
          Authorization: `Bearer ${this.nftStorageApiKey}`,
        },
      },
    );

    return data.value.cid;
  }

  async createMetaData(token: any): Promise<string> {
    const client = new NFTStorage({ token: this.nftStorageApiKey });

    const metadata = await client.store(token)

    return metadata.url;
  }

  async storeDirectory(media: File) {
    const client = new NFTStorage({ token: this.nftStorageApiKey });

    const cid = await client.storeDirectory([media]);

    return cid
  }

  async createNFT({name, supply, metadata, customRoyaltyFee}: any) {

    const supplyKey = PrivateKey.generate();
    //Create the NFT
    let nftCreate = await new TokenCreateTransaction()
            .setTokenName(name)
            .setTokenSymbol(metadata)
            .setTokenType(TokenType.NonFungibleUnique)
            .setDecimals(0)
            .setInitialSupply(0)
            .setTreasuryAccountId(this.accountId)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(supply)
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
    console.log(`- Created NFT with Token ID: ${tokenId} \n`);

    /* Mint the token */
    const limitChunk = 5;
    const max = supply;
    for (let idx = 0; idx < max; idx += limitChunk) {
        const limit = idx + limitChunk > max ? max - idx : limitChunk;
        const mintTx = new TokenMintTransaction().setTokenId(tokenId!);

        for (let i = 0; i < limit; i++) {
          mintTx.addMetadata(Buffer.from(metadata));
        }
        /* Sign with the supply private key of the token */
        const mintTxSign = await mintTx
            .freezeWith(this.client)
            .sign(supplyKey);
        /* Submit the transaction to a Hedera network */
        const mintTxSubmit = await mintTxSign.execute(this.client);
        const mintRx = await mintTxSubmit.getReceipt(this.client);
        /* Get the Serial Number */
        const serialNumber = mintRx.serials;

        /* Get the NftId */
        for (const nftSerial of serialNumber.values()) {
            console.log(`- Created NFT ${tokenId} with serial: ${nftSerial} \n`);
        }
    }

    const userDataJson = JSON.parse(this.cryptoService.decrypt(localStorage.getItem('userData')!));

    var tokens = [];

    if(userDataJson.data?.tokens)
      tokens.push(...userDataJson.data.tokens)
      
    tokens.push({
      name: name,
      tokenId: tokenId?.toString(),
      supplyKey: supplyKey.toStringRaw(),
      maxSupply: supply,
      nftType: "unique",
      mintedNFT: supply
    });
    userDataJson.data = {tokens: tokens}

    localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify(userDataJson)));

    return tokenId;
  }

  async createAndMint(form: FormGroup) {
    this.isLoadingService.isLoading$.next(true);
    this.disableSubmit = true;

    const name = form.get('name')?.value;
    const description = form.get('description')?.value;
    const category = form.get('category')?.value;
    const creator = form.get('creator')?.value;
    const media = this._file;
    const supply = form.get('quantity')?.value;

    const royaltyFee = form.get('royaltyFee')?.value;
    const royaltyAccountId = form.get('royaltyAccountId')?.value;
    const fallbackFee = form.get('fallbackFee')?.value;
    const customRoyaltyFee: any = [];

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

    let metadata = '';

    if(this.selectedMetadata == 2) {
      /**
      * MetaData v2
      */
      if(this._format == 'image') {

        metadata = await this.createMetaData({
          name,
          description,
          creator,
          category,
          supply,
          image: this._file,
          type: this._file.type
        });

      } else if(this._format == 'video') {

        const cidFile = await this.storeFile(media);

        const { data } = await axios.post(
          'https://api.nft.storage/upload',
          {
            name,
            description,
            creator,
            category,
            supply,
            files: [{
              uri: `ipfs://${cidFile}`,
              type: this._file.type
            }],
          },
          {
            headers: {
              Authorization: `Bearer ${this.nftStorageApiKey}`,
            },
          },
        );
      
        metadata = `ipfs://${data.value.cid}`;

      }

    } else {
      
      const cidFile = await this.storeFile(media);

      const { data } = await axios.post(
        'https://api.nft.storage/upload',
        {
          name,
          description: { type: 'string', description: description },
          creator,
          category,
          supply,
          image: {
            type: 'string',
            description: `https://cloudflare-ipfs.com/ipfs/${cidFile}`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.nftStorageApiKey}`,
          },
        },
      );
    
      metadata = `ipfs://${data.value.cid}`;

    }

    let tokenId;

    try {
      tokenId  = await this.createNFT({name, supply, metadata, customRoyaltyFee});
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

    this._format = null;
    this._url = null;
    form.reset();

    this.formDirective?.resetForm();

    this._snackBar.open(`Created NFT with Token ID: ${tokenId}`, "Dismiss", {
      duration: 5000
    });
  }

  onSelectFile(event: any) {
    if(event.target.files && event.target.files[0]) {
      this._file = event.target.files[0];

      var reader = new FileReader();
      reader.readAsDataURL(this._file);
      if(this._file.type.indexOf('image')> -1){
        this._format = 'image';
      } else if(this._file.type.indexOf('video')> -1){
        this._format = 'video';
      }
      reader.onload = (event) => {
        this._url = (<FileReader>event.target).result;
      }
    }
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