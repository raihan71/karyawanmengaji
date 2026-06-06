import { Component, HostListener, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, RouterOutlet, Router } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/pages/footer/footer.component';
import { AboutMeService } from './services/about-me.service';
import { ContentfulService } from './services/contentful.service';
import { aboutMe } from './models/aboutMe';
import { PipesModule } from './pipes/pipes.module';
import { environment } from '../environments/environment';
import { GoogleAnalyticsGTagComponent } from '../components/marketing/gtm-analytic/gtm-analytic.component';
import { GoogleAdsSenseComponent } from '../components/marketing/google-adsense/adsenses.component';

const CONFIG = environment.contentful_config.contentTypeIds;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    PipesModule,
    GoogleAnalyticsGTagComponent,
    GoogleAdsSenseComponent,
  ],
  templateUrl: './app.html',
})
export class AppComponent implements AfterViewInit {
  about: aboutMe = {};
  waMe: string = '//api.whatsapp.com/send?phone=';
  socials: Array<any> = [];
  activateGoTop: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private _aboutMe: AboutMeService,
    private cs: ContentfulService,
    public route: Router,
  ) {
    this._aboutMe.getData().subscribe((entry: aboutMe) => {
      this.about = entry;
      const { logo } = this.about;
      this.cs.getSingleImg(logo.sys.id).then((image: any) => {
        Object.assign(this.about, { image });
      });
    });
    this.cs.getEntries({ content_type: CONFIG.socials }).subscribe({
      next: (entries: Array<any>) => {
        this.socials = entries.map((entry) => {
          return {
            ...entry,
            icon: entry.fields.icon,
          };
        });
      },
    });

    if (isPlatformBrowser(this.platformId)) {
      this.route.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        this.scrollPageALittle();
      });
    }
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.scrollPageALittle();
  }

  private scrollPageALittle() {
    requestAnimationFrame(() => {
      window.scrollTo(10, 10);
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 100) {
      this.activateGoTop = true;
    } else {
      this.activateGoTop = false;
    }
  }
  scrollToTop() {
    return window.scrollTo(0, 0);
  }
}
