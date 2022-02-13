import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import axios from 'axios';
import { CryptoService } from 'src/app/services/crypto.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @Output() hasNFTStorageApiKey = new EventEmitter<boolean>();
  @Output() isLoading = new EventEmitter<boolean>();

  isDisabled = true;
  apiKeyInput = false;
  blocked: any;
  form!: FormGroup;
  selectedMetadata?: number;

  constructor(private cryptoService: CryptoService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      apiKey: new FormControl({ value: '', disabled: this.apiKeyInput }, [
        Validators.required
      ]),
    });

    const localData = localStorage.getItem('userData');
    if(localData) {
      const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));

      if(userDataJson.nftStorageApiKey) {
        this.isDisabled = false;
        this.apiKeyInput = true;
        this.form.get('apiKey')?.setValue(userDataJson.nftStorageApiKey);
        this.form.get('apiKey')?.disable();
      }

      if(userDataJson.metadata) {
        this.selectedMetadata = userDataJson.metadata;
      } else {
        this.selectedMetadata = 2;
      }
      
    } else {
      this.selectedMetadata = 2;
    }
  }

  get _apiKey() { return this.form.get('apiKey')!; }

  getErrorMessageApiKey() {
    return this._apiKey.hasError('required') ? 'NFT Storage API key is required' :
        this._apiKey.hasError('authorization') ? 'NFT Storage API key is malformed or failed to parse' :
            '';
  }

  onGroupChange(event: MatRadioChange) {
    console.log(event.source.name, event.value);

    const localData = localStorage.getItem('userData');
    if(localData) {
      const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));
      userDataJson.metadata = event.value;

      localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify(userDataJson)));
    } else {
      localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify({metadata: event.value})));
    }

    this._snackBar.open("Metadata format changed!", "Dismiss", {
      duration: 5000
    });
  }

  onChange(event: any){
    this.isDisabled = event.checked;
    if(this.isDisabled) {
      this.apiKeyInput = false;
      this.form.get('apiKey')?.enable();
    } else {
      this.apiKeyInput = true;
      this.form.get('apiKey')?.disable();
    }
  }

  async save(form: FormGroup) {

    this.isLoading.emit(true);

    const apiKey = form.get('apiKey')?.value;

    try {
      const response = await axios.get(
        'https://api.nft.storage/',
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );
    } catch (e: any) {
      if(e.response.status == 401) {
        form.get('apiKey')?.setErrors({ authorization: true })
      }

      this.isLoading.emit(false);
      return;
    }
    

    const localData = localStorage.getItem('userData');
    if(localData) {
      const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));
      userDataJson.nftStorageApiKey = apiKey;

      this.isDisabled = false;
      this.apiKeyInput = true;
      this.form.get('apiKey')?.setValue(userDataJson.nftStorageApiKey);
      this.form.get('apiKey')?.disable();

      localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify(userDataJson)));
    } else {
      localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify({nftStorageApiKey: apiKey})));

      this.isDisabled = false;
      this.apiKeyInput = true;
      this.form.get('apiKey')?.setValue(apiKey);
      this.form.get('apiKey')?.disable();
    }

    this.hasNFTStorageApiKey.emit(true);
    this.isLoading.emit(false);

    this._snackBar.open("API key changed!", "Dismiss", {
      duration: 5000
    });
  }

}
