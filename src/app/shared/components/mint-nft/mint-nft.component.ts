import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountId, Client, PrivateKey, TokenMintTransaction } from '@hashgraph/sdk';
import axios from 'axios';
import { NFTStorage } from 'nft.storage';
import { CryptoService } from 'src/app/services/crypto.service';
import { IsLoadingService } from 'src/app/services/is-loading.service';
import { Buffer } from 'buffer';

@Component({
  selector: 'app-mint-nft',
  templateUrl: './mint-nft.component.html',
  styleUrls: ['./mint-nft.component.css']
})
export class MintNFTComponent implements OnInit {

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

  tokens: any[] = [];
  tokensData: any[] = [];

  private client!: Client;
  private accountId!: AccountId;
  private privateKey!: PrivateKey;
  private nftStorageApiKey!: string;

  private selectedMetadata?: number;

  userDataJson: any;

  constructor(private cryptoService: CryptoService, private isLoadingService: IsLoadingService, private _snackBar: MatSnackBar) { 
    const localData = localStorage.getItem('userData');
    if(localData) {
      this.userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));

      this.tokensData = this.userDataJson.data.tokens;
      this.tokensData = this.tokensData.filter(token => token.mintedNFT < token.maxSupply);
      this.tokensData.sort((a, b) =>  -1);
      for(let _token of this.tokensData) {
        this.tokens.push({value: _token.tokenId, viewValue: `${_token.tokenId} - ${_token.name}`});
      }

      this.nftStorageApiKey = this.userDataJson.nftStorageApiKey;

      this.accountId = AccountId.fromString(this.userDataJson.accountId);
      this.privateKey = PrivateKey.fromString(this.userDataJson.privateKey);

      if(this.userDataJson.testnet) {
        this.client = Client.forTestnet().setOperator(this.accountId, this.privateKey);
      } else {
        this.client = Client.forMainnet().setOperator(this.accountId, this.privateKey);
      }

      if(this.userDataJson.metadata) {
        this.selectedMetadata = this.userDataJson.metadata;
      } else {
        this.selectedMetadata = 2;
      }

    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      token: new FormControl('', [
        Validators.required
      ]),
      name: new FormControl('', [
        Validators.required
      ]),
      description: new FormControl('', [
        Validators.required
      ]),
      creator: new FormControl('', [
        Validators.required
      ]),
      category: new FormControl('', [
        Validators.required
      ]),
      file: new FormControl('', [
        Validators.required
      ]),
    });
  }

  get file() { return this.form.get('file')!; }

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

  async mintNFT({token, supplyKey, metadata}: any) {

    // Mint new NFT
    let mintTx = await new TokenMintTransaction()
            .setTokenId(token)
            .setMetadata([Buffer.from(metadata)])
            .freezeWith(this.client);

    //Sign the transaction with the supply key
    let mintTxSign = await mintTx.sign(supplyKey);

    //Submit the transaction to a Hedera network
    let mintTxSubmit = await mintTxSign.execute(this.client);

    //Get the transaction receipt
    let mintRx = await mintTxSubmit.getReceipt(this.client);

    //Log the serial number
    console.log(`- Created NFT ${token} with serial: ${mintRx.serials[0]} \n`);

    return mintRx.serials[0];
  }

  async createAndMint(form: FormGroup) {
    this.isLoadingService.isLoading$.next(true);
    this.disableSubmit = true;

    const name = form.get('name')?.value;
    const description = form.get('description')?.value;
    const category = form.get('category')?.value;
    const creator = form.get('creator')?.value;
    const token = form.get('token')?.value;
    const media = this._file;

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

    const _tokenData = this.tokensData.find( ({ tokenId }) => tokenId === token );

    const supplyKey = PrivateKey.fromString(_tokenData.supplyKey);

    let serial;

    try {
      serial = await this.mintNFT({token, supplyKey, metadata});
    } catch (error) {

      this.isLoadingService.isLoading$.next(false);
      this.disableSubmit = false;
  
      this._snackBar.open('There was a problem! Make sure you have enough balance!', "Dismiss", {
        duration: 5000,
        panelClass: ['red-snackbar']
      });
      return
    }


    _tokenData.mintedNFT = _tokenData.mintedNFT + 1;
    this.tokensData[this.tokensData.findIndex((obj) => obj.tokenId === token)] = _tokenData;

    this.tokensData.sort((a, b) =>  -1);
    this.userDataJson.data.tokens = this.tokensData;
    localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify(this.userDataJson)));

    this.isLoadingService.isLoading$.next(false);
    this.disableSubmit = false;

    this._format = null;
    this._url = null;
    form.reset();
    this.formDirective?.resetForm();

    this._snackBar.open(`Created NFT ${token} with serial: ${serial}`, "Dismiss", {
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
