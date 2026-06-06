import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { PipesModule } from '../../../app/pipes/pipes.module';
import { ContentfulService } from '../../../app/services/contentful.service';
import { environment } from '../../../environments/environment';
import { SidenewsComponent } from '../../../components/sidenews/sidenews.component';
import { DisqusEmbedComponent } from '../../../components/disqus-component/disqus-component';

const CONFIG = environment.contentful_config.contentTypeIds;

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [DisqusEmbedComponent, PipesModule, CommonModule, SidenewsComponent],
  templateUrl: './detail.component.html',
})
export class DetailComponent implements OnInit {
  news: any = {};
  newses: Array<any> = [];
  readonly pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  readonly pageIdentifier = 'articles-detail';

  constructor(
    private cs: ContentfulService,
    private route: ActivatedRoute,
    private meta: Meta,
    private title: Title,
  ) {
    this.fetchData();
  }

  ngOnInit(): void {
    this.fetchArticles();
  }

  async fetchData() {
    const params = this.route.snapshot.paramMap.get('id');
    this.cs.getPost(params).subscribe({
      next: (entry: any) => {
        if (entry) {
          const img = this.cs.assetUrl(entry?.fields?.image);
          if (img) {
            this.meta.updateTag({ property: 'og:image', content: img });
          }
          this.news = {
            ...entry,
            img,
          };
          this.title.setTitle(`${entry.fields.title} - Artikel`);
          this.meta.updateTag({ name: 'description', content: `${entry.fields.title}` });
          this.meta.updateTag({ property: 'og:title', content: `${entry.fields.title}` });
          this.meta.updateTag({ property: 'og:description', content: `${entry.fields.title}` });
        }
      },
    });
  }

  async fetchArticles() {
    const params = {
      content_type: CONFIG.news,
      limit: 5,
    };

    this.cs.getEntries(params).subscribe((articles: any[]) => {
      this.newses = (articles || []).map((article) => ({
        ...article,
        img: this.cs.assetUrl(article?.fields?.image),
      }));
    });
  }
}
