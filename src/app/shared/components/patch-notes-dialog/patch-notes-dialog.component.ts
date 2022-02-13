import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-patch-notes-dialog',
  templateUrl: './patch-notes-dialog.component.html',
  styleUrls: ['./patch-notes-dialog.component.css']
})
export class PatchNotesDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,) { }

  ngOnInit(): void {
  }

}
