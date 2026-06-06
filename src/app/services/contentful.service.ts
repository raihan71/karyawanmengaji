import { Injectable, NgZone } from '@angular/core';
import { createClient } from 'contentful';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContentfulService {

  private cdaClient = createClient({
    accessToken: import.meta.env['NG_APP_CKEY'],
    space: import.meta.env['NG_APP_CSPACE'],
    environment: import.meta.env['NG_APP_CENV']
  });

  constructor(private zone: NgZone) { }

  private fromContentful<T>(promise: Promise<T>): Observable<T> {
    return new Observable<T>((subscriber) => {
      promise.then(
        (value) => {
          this.zone.run(() => {
            subscriber.next(value);
            subscriber.complete();
          });
        },
        (error) => {
          this.zone.run(() => subscriber.error(error));
        },
      );
    });
  }

  private resolveInZone<T>(value: T): Promise<T> {
    return new Promise((resolve) => {
      this.zone.run(() => resolve(value));
    });
  }

  getEntry(id:any) {
    const promise = this.cdaClient.getEntry(id);
    return this.fromContentful(promise).pipe(map(entry => entry.fields));
  }

  getEntries(params:any) {
    const promise = this.cdaClient.getEntries(params)
    return this.fromContentful(promise).pipe(map(entries => entries.items));
  }

  getSingleImg(id:string) {
    return this.cdaClient.getAsset(id)
      .then(asset => asset.fields.file?.url)
      .then(url => this.resolveInZone(url));
  }

  getPost(id:any) {
    const promise = this.cdaClient.getEntry(id);
    return this.fromContentful(promise).pipe(map(entry => entry));
  }

}
