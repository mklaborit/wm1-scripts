import puppeteer from "puppeteer";

export function extractURLsFromSitemap(XMLContent: string): string[] {
  const regex = /<loc>(.*?)<\/loc>/g;
  return Array.from(XMLContent.matchAll(regex), (match) => match[1]);
}

export async function fetchHtmlDataResponse(
  URL: string
): Promise<{ html: string; statusCode: number; timeToLoad: number }> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const response = await page.goto(URL);
  const html = await page.content();
  const metrics = await page.metrics();

  await browser.close();

  return {
    html,
    statusCode: Number(response?.status()),
    timeToLoad: metrics.TaskDuration!,
  };
}

export function getPageMetaTags(html: string): { [key: string]: string | string[] } {
  const metaTags: { [key: string]: string | string[] } = {};
  const metaRegex = /<meta\s+([^>]+)>/gi;
  const titleRegex = /<title[^>]*>([^<]+)<\/title>/i;
  const h1Regex = /<h1[^>]*>([^<]+)<\/h1>/gi;
  const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
  const linkRegex = /<link\s+([^>]+)>/gi;

  // Match meta tags
  let match;
  while ((match = metaRegex.exec(html)) !== null) {
    const metaTagString = match[1];
    let metaTagName = '';
    let metaTagContent = '';

    const attrRegex = /\b(\w+)\s*=\s*("([^"]*)"|'([^']*)'|([^'">\s]+))/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(metaTagString)) !== null) {
      const attrName = attrMatch[1];
      const attrValue = attrMatch[3] || attrMatch[4] || attrMatch[5];
      if (attrName && attrValue) {
        if (attrName.toLowerCase() === 'name' || attrName.toLowerCase() === 'property') {
          metaTagName = attrValue;
        } else if (attrName.toLowerCase() === 'content') {
          metaTagContent = attrValue;
        }
      }
    }

    if (metaTagName) {
      if (metaTags[metaTagName]) {
        if (Array.isArray(metaTags[metaTagName])) {
          (metaTags[metaTagName] as string[]).push(metaTagContent);
        } else {
          metaTags[metaTagName] = [metaTags[metaTagName] as string, metaTagContent];
        }
      } else {
        metaTags[metaTagName] = metaTagContent;
      }
    }
  }

  // Match title
  const titleMatch = titleRegex.exec(html);
  if (titleMatch && titleMatch[1]) {
    metaTags['title'] = titleMatch[1];
  }

  // Match H1
  const h1Matches = html.match(h1Regex);
  if (h1Matches) {
    metaTags['h1'] = h1Matches.map(match => match.replace(/<[^>]*>/g, ''));
  }

  // Match H2
  const h2Matches = html.match(h2Regex);
  if (h2Matches) {
    metaTags['h2'] = h2Matches.map(match => match.replace(/<[^>]*>/g, ''));
  }

  // Match links
  let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const linkTagString = linkMatch[1];
    let relAttribute = '';
    let hrefAttribute = '';

    const attrRegex = /\b(\w+)\s*=\s*("([^"]*)"|'([^']*)'|([^'">\s]+))/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(linkTagString)) !== null) {
      const attrName = attrMatch[1];
      const attrValue = attrMatch[3] || attrMatch[4] || attrMatch[5];
      if (attrName && attrValue) {
        if (attrName.toLowerCase() === 'rel') {
          relAttribute = attrValue;
        } else if (attrName.toLowerCase() === 'href') {
          hrefAttribute = attrValue;
        }
      }
    }

    if (relAttribute.toLowerCase() === 'canonical') {
      metaTags['canonical'] = hrefAttribute;
    }
  }

  return metaTags;
}
