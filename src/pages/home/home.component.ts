import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import {
  FeatureComponent,
  CardlistComponent,
  ClientsComponent,
  FaqComponent,
} from '../../components';
import { CarouselComponent } from '../../components/shared/carousel/carousel.component';
import { ContentfulService } from '../../app/services/contentful.service';
import { environment } from '../../environments/environment';
import { AboutMeService } from '../../app/services/about-me.service';
import { aboutMe } from '../../app/models/aboutMe';

const CONFIG = environment.contentful_config;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ClientsComponent,
    FeatureComponent,
    CardlistComponent,
    FaqComponent,
    CarouselComponent,
    RouterLink,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  items: Array<any> = [1, 2, 3];
  galleryOptions: object = {
    loop: true,
    autoplay: false,
    center: true,
    dots: true,
    autoHeight: true,
    autoWidth: true,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      1000: {
        items: 1,
      },
    },
  };
  photoOptions: object = {
    loop: true,
    autoplay: true,
    center: true,
    dots: true,
    autoHeight: true,
    autoWidth: true,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      1000: {
        items: 1,
      },
    },
  };
  heros: Array<any> = [];
  galleries: Array<any> = [];
  clients: Array<any> = [];
  features: Array<any> = [];
  programs: Array<any> = [];
  faqs: Array<any> = [];
  aboutMe: aboutMe = {};

  constructor(
    private cs: ContentfulService,
    private title: Title,
    private meta: Meta,
    private _aboutMe: AboutMeService
  ) {
    this.title.setTitle(`${import.meta.env['NG_APP_NAME']}`);
    this.meta.updateTag({
      name: 'description',
      content: `${import.meta.env['NG_APP_NAME']}`,
    });
    this.meta.updateTag({
      property: 'og:title',
      content: `${import.meta.env['NG_APP_NAME']}`,
    });
    this.meta.updateTag({
      property: 'og:description',
      content: `${import.meta.env['NG_APP_NAME']}`,
    });
    this.meta.updateTag({
      property: 'og:image',
      content:
        'https://images.ctfassets.net/6g0kbenqa8m7/4CR7YyKMjU9eMhbHVariKr/ea38fbeef0db0714f199eca08b419e77/qlc-logo.png',
    });
    this._aboutMe.getData().subscribe((entry: aboutMe) => {
      this.aboutMe = entry;
    });
  }

  ngOnInit(): void {
    this.fetchHeroes();
    this.fetchGallery();
    this.fetchClient();
    this.fetchFeature();
    this.fetchProduct();
    this.fetchFaq();
  }

  private withImage(entry: any, field = 'image', target = 'img') {
    return {
      ...entry,
      [target]: this.cs.assetUrl(entry?.fields?.[field]),
    };
  }

  async fetchHeroes() {
    const params = {
      content_type: CONFIG.contentTypeIds.heroCarousel,
    };

    this.cs.getEntries(params).subscribe((heroes: any[]) => {
      this.heros = (heroes || []).map((hero) => this.withImage(hero));
    });
  }

  async fetchGallery() {
    const params = {
      content_type: CONFIG.contentTypeIds.galleryCarousel,
    };

    this.cs.getEntries(params).subscribe((galleries: any[]) => {
      this.galleries = (galleries || []).map((gallery) => ({
        ...gallery,
        img1: this.cs.assetUrl(gallery?.fields?.image),
        img2: this.cs.assetUrl(gallery?.fields?.image2),
      }));
    });
  }

  async fetchClient() {
    const params = {
      content_type: CONFIG.contentTypeIds.mitraCarousel,
    };

    this.cs.getEntries(params).subscribe((clients: any[]) => {
      this.clients = (clients || []).map((client) => this.withImage(client, 'logo'));
    });
  }

  async fetchFeature() {
    const params = {
      content_type: CONFIG.contentTypeIds.feature,
    };

    this.cs.getEntries(params).subscribe({
      next: (entries: Array<any>) => {
        this.features = entries.map((entry) => {
          return {
            ...entry,
            icon: entry.fields.icon,
          };
        });
      },
    });
  }

  async fetchProduct() {
    const params = {
      content_type: CONFIG.contentTypeIds.programs,
      limit: 3,
    };

    this.cs.getEntries(params).subscribe((programs: any[]) => {
      this.programs = (programs || []).map((program) => this.withImage(program));
    });
  }

  async fetchFaq() {
    const params = {
      content_type: CONFIG.contentTypeIds.faqs,
    };

    this.cs.getEntries(params).subscribe({
      next: (entries: Array<any>) => {
        this.faqs = entries.map((entry) => {
          return {
            ...entry,
            answer: entry.fields.answer,
            open: false,
          };
        });
      },
    });
  }
}
