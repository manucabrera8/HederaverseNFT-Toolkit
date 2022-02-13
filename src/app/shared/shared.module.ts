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


@NgModule({
  declarations: [
    ToolbarComponent,
    TabsComponent,
    CreateTokenComponent,
    AccountConnectDialogComponent,
    SettingsComponent,
    PatchNotesDialogComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
  ],
  exports: [ToolbarComponent, TabsComponent, CreateTokenComponent, SettingsComponent, PatchNotesDialogComponent],
})
export class SharedModule { }
