import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Data, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter, startWith } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

  readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

  constructor(private router: Router) { 

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(this.router)
   ).subscribe(event => {
     const root = this.router.routerState.snapshot.root; 
      const breadcrumbs: Breadcrumb[] = []; 
      this.addBreadcrumb(root, [], breadcrumbs); 
 
      this._breadcrumbs$.next(breadcrumbs); 
    });
  }

  private addBreadcrumb(route: ActivatedRouteSnapshot, parentUrl: string[], breadcrumbs: Breadcrumb[]) { 
    if (route) { 
      const routeUrl = parentUrl.concat(route.url.map(url => url.path)); 
 
      if (route.data['breadcrumb']) { 
        const url = '/' + routeUrl.join('/');
        const breadcrumb = { 
          label: this.getLabel(route.data), 
          url: url 
        }; 

        const found = breadcrumbs.some(breadcrumb => breadcrumb.url == url);
        if(!found)
          breadcrumbs.push(breadcrumb); 
      } 
 
      this.addBreadcrumb(route.firstChild!, routeUrl, breadcrumbs); 
    } 
  } 
 
  private getLabel(data: Data) { 
    return data['breadcrumb']; 
  }
}
