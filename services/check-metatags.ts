import chalk from "chalk";
import { sendSlackNotification } from "../integrations";
import {
  checkEnvironmentVariable,
  extractURLsFromSitemap,
  fetchHtmlDataResponse,
  getPageMetaTags,
} from "../utils";

class MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  canonical?: string;
  h1?: string;
  h2?: string;
}

export class CheckMetags {
  private sitemapURL?: string;
  private XMLContent?: string;
  private urls?: string[];
  private requiredMetaTags: (keyof MetaTags)[] = [
    "title",
    "description",
    "keywords",
    "author",
    "canonical",
    "h1",
    "h2",
  ];

  constructor(private readonly sitemapEnvURL: string) {}

  // Carregar as variáveis de ambiente
  loadEnvironmentVariables(): this {
    console.log(`\n 🔍 Checking environment variable...`);
    this.sitemapURL = checkEnvironmentVariable(this.sitemapEnvURL);
    console.log(`\n ✅ Found : ${this.sitemapURL}`);
    return this;
  }

  // Ler o conteúdo XML do sitemapURL
  async fetchXMLContent(): Promise<this> {
    console.log(`\n 🤔 Let's see if this sitemap is valid...`);
    const response = await fetch(this.sitemapURL as string);
    if (!response.ok) {
      console.log(`\n 🚨 you lied to me! the's something wrong with the URL`);
      throw new Error(`Failed to fetch sitemap - ${response.status}`);
    }
    this.XMLContent = await response.text();
    console.log(`\n 😉 just kidding... your sitemap looks good`);
    return this;
  }

  // Salvar as URLs extraídas do sitemap
  saveURLsOfTheSitemap(): this {
    this.urls = extractURLsFromSitemap(this.XMLContent as string);
    const size = this.urls.length;
    console.log(`\n 💪 I've read aaaaaall the URLs on your sitemap... ${size}`);
    return this;
  }

  // Extrair todas metatags
  async extractMetaTags(url: string) {
    const { html } = await fetchHtmlDataResponse(url);
    const metatags = getPageMetaTags(html);
    return metatags;
  }

  // Validar se tem as metatags obrigatórias
  private checkRequiredMetaTags(metaTags: MetaTags): string[] {
    const missingTags: string[] = [];
    this.requiredMetaTags.forEach((tag) => {
      if (!metaTags[tag]) {
        missingTags.push(tag);
      }
    });
    return missingTags;
  }

  async runSEOValidations(): Promise<this> {
    let analysis = [];
    let shouldNotifyOnSlack = [];
    console.log("\n");
    for (let index = 0; index < this.urls!.length; index++) {
      const size = this.urls!.length;
      const currentURL = this.urls![index];
      process.stdout.write(` 👀 analysing [${index + 1} of ${size} URLs]\r`);

      const result = await this.extractMetaTags(currentURL);
      const missing = this.checkRequiredMetaTags(result);
      const percentage = (missing.length / this.requiredMetaTags.length) * 100;
      const totalPercentage = (100 - percentage).toFixed(2);

      if (Number(totalPercentage) < 50) {
        shouldNotifyOnSlack.push({
          missing: missing.join(", "),
          percentage: `${totalPercentage}%`,
          url: currentURL,
        });
      }

      analysis.push({
        missing: missing.join(", "),
        percentage: `${totalPercentage}%`,
        url: currentURL,
      });
    }

    console.table(analysis);

    await sendSlackNotification("CHECK REQUIRED METATAGS", shouldNotifyOnSlack);
    return this;
  }
}

async function init() {
  console.log(
    `\n 🤖 Service Running: ${chalk.bgYellow.bold("CHECK REQUIRED METATAGS")}`
  );

  try {
    const instance = new CheckMetags("WM1_SITEMAP_URL");
    instance.loadEnvironmentVariables();
    await instance.fetchXMLContent();
    instance.saveURLsOfTheSitemap();
    await instance.runSEOValidations();
  } catch (error) {
    console.error(error);
  }
}

init();
