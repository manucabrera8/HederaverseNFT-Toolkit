import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateTokenMultipleNFTComponent } from '../shared/components/create-token-multiple-nft/create-token-multiple-nft.component';
import { CreateTokenUniqueNFTComponent } from '../shared/components/create-token-unique-nft/create-token-unique-nft.component';
import { CreateTokenComponent } from '../shared/components/create-token/create-token.component';
import { MintNFTComponent } from '../shared/components/mint-nft/mint-nft.component';
import { MintedTokenLogsComponent } from '../shared/components/minted-token-logs/minted-token-logs.component';
import { NftComponent } from '../shared/components/nft/nft.component';

import { IndexComponent } from './index/index.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    data: { breadcrumb: 'Home' },
    children: [
      { path : '', pathMatch:'full', component: NftComponent },
      {
        path: 'create-token-unique-nft',
        component: CreateTokenUniqueNFTComponent,
        data: { breadcrumb: 'Create and mint unique NFTs' }
      },
      {
        path: 'create-token-multiple-nft',
        data: { breadcrumb: 'Collection' },
        children: [
          { path : '', pathMatch:'full', component: CreateTokenMultipleNFTComponent },
          {
            path: 'create-token',
            component: CreateTokenComponent,
            data: { breadcrumb: 'Create Token' }
          },
          {
            path: 'mint-nft',
            component: MintNFTComponent,
            data: { breadcrumb: 'Mint NFT' }
          }
        ]
      },
      {
        path: 'minted-token-logs',
        component: MintedTokenLogsComponent,
        data: { breadcrumb: 'Logs' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
