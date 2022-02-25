import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CryptoService } from 'src/app/services/crypto.service';
import { PatchNotesService } from 'src/app/services/patch-notes.service';
import { AccountConnectDialogComponent } from '../account-connect-dialog/account-connect-dialog.component';
import { AccountDisconnectDialogComponent } from '../account-disconnect-dialog/account-disconnect-dialog.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  @Output() isConnect = new EventEmitter<boolean>();
  @Input() disconnectAccount?: boolean;
  @Input() accountId?: string;
  @Input() isLoading?: boolean;
  currentVersion?: string;

  constructor(public dialog: MatDialog, private patchNotesService: PatchNotesService, private cryptoService: CryptoService) { }

  ngOnInit(): void {
    this.currentVersion = this.patchNotesService.currentVersion;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AccountConnectDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isConnect.emit(result?.isConnect);
    });
  }

  onDisconnect(): void {

    const dialogRef = this.dialog.open(AccountDisconnectDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result)
        this.isConnect.emit(result?.isConnect);
    });
  }

}
