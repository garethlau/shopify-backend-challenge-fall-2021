import { Request } from 'express';

function parseSizes(req: Request): number[][] {
  if (!req.body.sizes) {
    return [];
  }
  const sizes: number[][] = req.body.sizes
    .toString()
    .split(',')
    .map((size: string) => {
      const [width, height] = size.split('x');

      if (isNaN(parseInt(width)) || isNaN(parseInt(height))) {
        // will throw error if width or height is undefined
        throw new Error('Malformed input string.');
      }

      return [parseInt(width), parseInt(height)];
    });

  return sizes;
}

function parseTags(req: Request): string[] {
  const rawTags: string = req.body.tags;
  if (!rawTags || rawTags === ' ') {
    return [];
  }

  const tags: string[] = rawTags.split(',').filter((tag) => tag && tag !== ' ');
  return tags;
}

export { parseSizes, parseTags };

export default {
  parseSizes,
  parseTags
};
