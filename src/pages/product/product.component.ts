import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { CardlistComponent } from '../../components';
import { environment } from '../../environments/environment';
import { ContentfulService } from '../../app/services/contentful.service';

const CONFIG = environment.contentful_config.contentTypeIds;

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CardlistComponent],
  templateUrl: './product.component.html'
})
export class ProductComponent implements OnInit {
  product:Array<any> = [];
  limit: number = 10;
  skip: number = 0;
  currentPage: number = 1;
  hasNextPage: boolean = true;

  constructor(
    private cs: ContentfulService, private metaService: Meta, private titleService: Title
  ) {
    this.updateMeta();
  }

  updateMeta() {
    this.titleService.setTitle(`Program - ${import.meta.env['NG_APP_NAME']}`);
    this.metaService.updateTag({ name: 'description', content: `Program Unggulan Kami Layanan yang kami tawarkan untuk perusahaan maupun lembaga kantor.` });
    this.metaService.updateTag({ property: 'og:title', content: `Program - ${import.meta.env['NG_APP_NAME']}` });
    this.metaService.updateTag({ property: 'og:description', content: `Program Unggulan Kami Layanan yang kami tawarkan untuk perusahaan maupun lembaga kantor.` });
    this.metaService.updateTag({ property: 'og:image', content: 'https://images.ctfassets.net/6g0kbenqa8m7/4CR7YyKMjU9eMhbHVariKr/ea38fbeef0db0714f199eca08b419e77/qlc-logo.png' });
  }

  ngOnInit(): void {
    this.fetchProduct();
  }

  async fetchProduct() {
    const params = {
      content_type: CONFIG.programs,
      limit: this.limit,
      skip: this.skip
    };

    this.cs.getEntries(params).subscribe((programs:any[]) => {
      this.product = (programs || []).map((program) => ({
        ...program,
        img: this.cs.assetUrl(program?.fields?.image),
      }));
      this.hasNextPage = this.product.length === this.limit;
    });
  }

  nextPage() {
    if (!this.hasNextPage) {
      return;
    }
    this.skip += this.limit;
    this.currentPage++;
    this.fetchProduct();
  }

  previousPage() {
    this.skip -= this.limit;
    if (this.skip < 0) {
      this.skip = 0;
    }
    this.currentPage--;
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    this.fetchProduct();
  }

}
