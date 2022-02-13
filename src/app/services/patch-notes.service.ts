import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PatchNotesDialogComponent } from '../shared/components/patch-notes-dialog/patch-notes-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class PatchNotesService {

  currentVersion = "1.0.0";
  patchNotes = [
    {
      title: "1.0.0",
      content: `<p>First version of Hederaverse Toolkit.</p>    
                <ul>
                  <li>Mainnet and Testnet</li>
                  <li>Image and Video</li> 
                  <li>Royalties/Fallback</li> 
                  <li>Standard metadata by HashPack</li>       
                </ul>`
    }
  ];

  constructor(public dialog: MatDialog) { }

  showModal() {
    const dialogRef = this.dialog.open(PatchNotesDialogComponent, {
      width: '500px',
      data: this.patchNotes,
    });

    dialogRef.afterClosed().subscribe(result => {
      
    });
  }
}
