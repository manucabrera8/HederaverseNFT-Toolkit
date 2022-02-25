import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BackupService } from 'src/app/services/backup.service';
import { CryptoService } from 'src/app/services/crypto.service';

@Component({
  selector: 'app-account-disconnect-dialog',
  templateUrl: './account-disconnect-dialog.component.html',
  styleUrls: ['./account-disconnect-dialog.component.css']
})
export class AccountDisconnectDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AccountDisconnectDialogComponent>, private backupService: BackupService, private cryptoService: CryptoService, private router: Router) { }

  ngOnInit(): void {
  }

  onDisconnect(): void { 
    const localData = localStorage.getItem('userData');
    if(localData) {
      const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));

      if(userDataJson.accountId && userDataJson.privateKey) {
        delete userDataJson.accountId;
        delete userDataJson.privateKey;
      }

      if(userDataJson.data)
        delete userDataJson.data;

      localStorage.setItem('userData', this.cryptoService.encrypt(JSON.stringify(userDataJson)));

      this.router.navigateByUrl("/");
      this.dialogRef.close({isConnect: false});
    }
  }

  onCancel(): void { 
    this.dialogRef.close({isConnect: true});
  }

  onExport(): void {
    this.backupService.export();
  }

}
