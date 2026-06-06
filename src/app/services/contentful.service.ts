import { Injectable, NgZone } from '@angular/core';
import { createClient } from 'contentful';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContentfulService {
  private requestCache = new Map<string, Observable<any>>();

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

  private cacheRequest<T>(key: string, promiseFactory: () => Promise<T>): Observable<T> {
    const cached = this.requestCache.get(key);
    if (cached) {
      return cached;
    }

    const request = this.fromContentful(promiseFactory()).pipe(shareReplay(1));
    this.requestCache.set(key, request);
    return request;
  }

  private cacheKey(prefix: string, value: any): string {
    return `${prefix}:${JSON.stringify(value, Object.keys(value || {}).sort())}`;
  }

  assetUrl(asset: any): string | undefined {
    const url = asset?.fields?.file?.url;
    if (!url) {
      return undefined;
    }
    return url.startsWith('//') ? `https:${url}` : url;
  }

  getEntry(id:any) {
    return this.cacheRequest(`entry:${id}`, () => this.cdaClient.getEntry(id))
      .pipe(map((entry: any) => entry.fields));
  }

  getEntries(params:any) {
    return this.cacheRequest(this.cacheKey('entries', params), () => this.cdaClient.getEntries(params))
      .pipe(map((entries: any) => entries.items));
  }

  getSingleImg(id:string) {
    return this.cdaClient.getAsset(id)
      .then(asset => this.assetUrl(asset))
      .then(url => this.resolveInZone(url));
  }

  getPost(id:any) {
    return this.cacheRequest(`post:${id}`, () => this.cdaClient.getEntry(id))
      .pipe(map(entry => entry));
  }

}
