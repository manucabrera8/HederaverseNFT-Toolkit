import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsLoadingService {

  isLoading$ = new Subject<any>();

  constructor() { }
}
