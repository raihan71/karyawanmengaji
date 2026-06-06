import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';
import { PLATFORM_ID } from '@angular/core';

declare global {
  interface Window {
    DISQUS?: {
      reset: (config: { reload: boolean; config: () => void }) => void;
    };
    disqus_config?: () => void;
  }
}

@Component({
  selector: 'app-disqus-embed',
  standalone: true,
  templateUrl: './disqus-component.html',
  styleUrl: './disqus-component.css',
})
export class DisqusEmbedComponent implements OnInit, OnChanges, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scriptId = 'disqus-embed-script';
  private readonly shortname = import.meta.env['NG_APP_DISQUS'] ?? '';
  private isLoaded = false;

  @Input({ required: true }) pageUrl = '';
  @Input({ required: true }) pageIdentifier = '';
  @Input() title = 'Comments';

  @HostBinding('class.block') hostBlock = true;

  ngOnInit(): void {
    this.loadDisqus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!isPlatformBrowser(this.platformId) || !this.shortname) {
      return;
    }

    if (changes['pageUrl'] || changes['pageIdentifier']) {
      this.resetDisqus();
    }
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const script = document.getElementById(this.scriptId);
    if (script) {
      script.remove();
    }
  }

  get hasShortname(): boolean {
    return Boolean(this.shortname);
  }

  private loadDisqus(): void {
    if (
      !isPlatformBrowser(this.platformId) ||
      !this.shortname ||
      !this.pageUrl ||
      !this.pageIdentifier
    ) {
      return;
    }

    if (this.isLoaded || document.getElementById(this.scriptId)) {
      return;
    }

    window.disqus_config = this.createConfig();

    const script = document.createElement('script');
    script.id = this.scriptId;
    script.src = `https://${this.shortname}.disqus.com/embed.js`;
    script.setAttribute('data-timestamp', `${Date.now()}`);
    script.async = true;
    script.onload = () => {
      this.isLoaded = true;
    };
    document.body.appendChild(script);
  }

  private resetDisqus(): void {
    if (!isPlatformBrowser(this.platformId) || !this.shortname || !window.DISQUS) {
      return;
    }

    window.DISQUS.reset({
      reload: true,
      config: this.createConfig(),
    });
  }

  private createConfig() {
    const pageUrl = this.pageUrl;
    const pageIdentifier = this.pageIdentifier;

    return function (this: { page: { url: string; identifier: string } }) {
      this.page.url = pageUrl;
      this.page.identifier = pageIdentifier;
    };
  }
}
