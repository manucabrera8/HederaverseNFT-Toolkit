import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { BackupService } from 'src/app/services/backup.service';
import { CryptoService } from 'src/app/services/crypto.service';

@Component({
  selector: 'app-minted-token-logs',
  templateUrl: './minted-token-logs.component.html',
  styleUrls: ['./minted-token-logs.component.css']
})
export class MintedTokenLogsComponent implements AfterViewInit {

  tokens?: any[];
  displayedColumns: string[] = ['name', 'tokenId', 'maxSupply', 'mintedNFTs'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private cryptoService: CryptoService, private backupService: BackupService, private _snackBar: MatSnackBar) { 
    const localData = localStorage.getItem('userData');
    if(localData) {
      const userDataJson = JSON.parse(this.cryptoService.decrypt(localData!));

      if(userDataJson.data?.tokens){
        this.tokens = userDataJson.data.tokens;
        this.tokens?.sort((a, b) =>  -1);
      }
    }

    this.dataSource = new MatTableDataSource(this.tokens);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onExport() {
    this.backupService.export();
  }

  onImport(event: any) {
    var file = event.srcElement.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = (event) => {
          try {
            const importData = JSON.parse(JSON.stringify(this.cryptoService.decryptBackup((<FileReader>event.target).result as string)));
            const userDataJson = JSON.parse(this.cryptoService.decrypt(localStorage.getItem('userData')!));

            if(userDataJson.accountId == importData.accountId && userDataJson.testnet == importData.testnet) {

              this.backupService.Import(importData, userDataJson);

              this.tokens = userDataJson.data.tokens;
              this.tokens?.sort((a, b) =>  -1);
              this.dataSource = new MatTableDataSource(this.tokens);

              this._snackBar.open('Backup file successfully imported.', "Dismiss", {
                duration: 5000
              });
            } else {
              this._snackBar.open('This backup file does not belong to the connected account!', "Dismiss", {
                duration: 5000,
                panelClass: ['red-snackbar']
              });
            }

          } catch (error) {
            this._snackBar.open('This backup file is not valid!', "Dismiss", {
              duration: 5000,
              panelClass: ['red-snackbar']
            });
          }
        }
    }
  }

}
