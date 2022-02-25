import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CryptoService } from 'src/app/services/crypto.service';
import { IsLoadingService } from 'src/app/services/is-loading.service';
import { PatchNotesService } from 'src/app/services/patch-notes.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  @ViewChild('NFT', { static: true }) nft!: TemplateRef<any>;
  @ViewChild('Settings', { static: true }) settings!: TemplateRef<any>;

  allTabs: any;
  isConnect?: boolean;
  isLoading?: boolean;
  hasNFTStorageApiKey?: boolean;
  accountId?: string;

  isLoadingSub: Subscription;

  constructor(private cryptoService: CryptoService, private isLoadingService: IsLoadingService, private patchNotes: PatchNotesService) {

    this.isLoadingSub = this.isLoadingService.isLoading$.subscribe($event => {
      this.setIsLoading($event);
    });

    const localData = localStorage.getItem('userData');
    if(localData) {
      const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));

      if(userDataJson.accountId && userDataJson.privateKey) {
        this.setIsConnect(true);
      }

      if(userDataJson.nftStorageApiKey) {
        this.setHasNFTStorageApiKey(true);
      }
    }

    const lastViewedPatchnotesVersion = localStorage.getItem("last_viewed_patchnotes_version");
    if(lastViewedPatchnotesVersion && lastViewedPatchnotesVersion == this.patchNotes.currentVersion) {
      localStorage.setItem("last_viewed_patchnotes_version", this.patchNotes.currentVersion);
    } else {
      this.patchNotes.showModal();
      localStorage.setItem("last_viewed_patchnotes_version", this.patchNotes.currentVersion);
    }
    
  }

  ngOnInit(): void {
    this.allTabs = [
      {name: 'NFT', template: this.nft},
      {name: 'Settings', template: this.settings}
    ];
  }

  setIsConnect(isConnect: boolean) {
    this.isConnect = isConnect;

    const localData = localStorage.getItem('userData');
    if(localData) {
      const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));
      if(userDataJson.accountId)
        this.accountId = userDataJson.accountId;
    }
  }

  setHasNFTStorageApiKey(hasNFTStorageApiKey: boolean) {
    this.hasNFTStorageApiKey = hasNFTStorageApiKey;
  }

  setIsLoading($event: any): void {
    this.isLoading = $event;
  }

  componentAdded(componentRef: any) {
    console.log("componentRef", componentRef);
  }
}
