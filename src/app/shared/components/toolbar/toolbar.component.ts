import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CryptoService } from 'src/app/services/crypto.service';
import { AccountConnectDialogComponent } from '../account-connect-dialog/account-connect-dialog.component';

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

  constructor(public dialog: MatDialog, private cryptoService: CryptoService) { }

  ngOnInit(): void {
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
    const localData = localStorage.getItem('userData');
    if(localData) {
      const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));

      if(userDataJson.accountId && userDataJson.privateKey) {
        delete userDataJson.accountId;
        delete userDataJson.privateKey;
      }

      localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify(userDataJson)));

      this.isConnect.emit(false);
    }
  }

}
