import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { CreateTokenComponent } from './components/create-token/create-token.component';
import { AccountConnectDialogComponent } from './components/account-connect-dialog/account-connect-dialog.component';
import { SettingsComponent } from './components/settings/settings.component';
import { PatchNotesDialogComponent } from './components/patch-notes-dialog/patch-notes-dialog.component';
import { NftComponent } from './components/nft/nft.component';
import { RouterModule } from '@angular/router';
import { CreateTokenMultipleNFTComponent } from './components/create-token-multiple-nft/create-token-multiple-nft.component';
import { CreateTokenUniqueNFTComponent } from './components/create-token-unique-nft/create-token-unique-nft.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { MintedTokenLogsComponent } from './components/minted-token-logs/minted-token-logs.component';
import { MintNFTComponent } from './components/mint-nft/mint-nft.component';
import { AccountDisconnectDialogComponent } from './components/account-disconnect-dialog/account-disconnect-dialog.component';


@NgModule({
  declarations: [
    ToolbarComponent,
    TabsComponent,
    CreateTokenComponent,
    AccountConnectDialogComponent,
    SettingsComponent,
    PatchNotesDialogComponent,
    NftComponent,
    CreateTokenMultipleNFTComponent,
    CreateTokenUniqueNFTComponent,
    BreadcrumbComponent,
    MintedTokenLogsComponent,
    MintNFTComponent,
    AccountDisconnectDialogComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    ToolbarComponent,
    TabsComponent,
    NftComponent,
    CreateTokenUniqueNFTComponent,
    CreateTokenMultipleNFTComponent,
    CreateTokenComponent,
    SettingsComponent,
    PatchNotesDialogComponent
  ],
})
export class SharedModule { }
