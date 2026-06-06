import { Pipe, PipeTransform } from '@angular/core';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { Document } from '@contentful/rich-text-types';

@Pipe({
  name: 'toHtml',
})
export class ToHtmlPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    const renderEntry = (node: any): string => {
      const target = node?.data?.target;
      const contentTypeId = target?.sys?.contentType?.sys?.id;

      if (contentTypeId === 'videoEmbed') {
        return `
          <iframe
            src="${target?.fields?.embedUrl ?? ''}"
            height="100%"
            width="100%"
            frameBorder="0"
            scrolling="no"
            title="${target?.fields?.title ?? ''}"
            allowFullScreen="true"
          ></iframe>
        `;
      }

      return '';
    };

    const renderAsset = (node: any): string => {
      const fields = node?.data?.target?.fields;
      const file = fields?.file;
      const url = file?.url ? `https:${file.url}` : '';
      const height = file?.details?.image?.height;
      const width = file?.details?.image?.width;

      return `
        <img
          src="${url}"
          ${height ? `height="${height}"` : ''}
          ${width ? `width="${width}"` : ''}
          alt="${fields?.description ?? ''}"
        />
      `;
    };

    const options = {
      renderMark: {
        [MARKS.BOLD]: (text: string) => `<strong>${text}</strong>`,
        [MARKS.ITALIC]: (text: string) => `<em>${text}</em>`,
        [MARKS.UNDERLINE]: (text: string) => `<u>${text}</u>`,
        [MARKS.CODE]: (text: string) => `<code>${text}</code>`,
      },
      renderNode: {
        [BLOCKS.EMBEDDED_ENTRY]: renderEntry,
        [BLOCKS.EMBEDDED_RESOURCE]: renderEntry,
        [BLOCKS.EMBEDDED_ASSET]: renderAsset,
        [INLINES.HYPERLINK]: (node: any, next: (nodes: any[]) => string) => {
          const uri = node?.data?.uri ?? '';

          return `<a href="${uri}" target="_blank" rel="noopener noreferrer">${next(node.content)}</a>`;
        },
      },
      renderText: (text: string) =>
        text
          .replace(/\r\n?/g, '\n')
          .replace(/[\u2028\u2029]/g, '\n')
          .replace(/([^\s])\s+(\d+[.)][\u2060\uFEFF]?\s*)/g, '$1\n$2')
          .split('\n')
          .map((segment, index) => `${index > 0 ? '<br/>' : ''}${segment}`)
          .join(''),
    };
    return documentToHtmlString(value as Document, options);
  }
}
