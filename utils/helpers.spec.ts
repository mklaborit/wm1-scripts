import { describe, expect, it } from "bun:test";
import { extractURLsFromSitemap, fetchHtmlDataResponse } from ".";

describe("helpers", () => {
  describe("extractURLsFromSitemap", () => {
    it("should extract URLs from XML content", () => {
      const XMLContent = `
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
            <loc>https://wm1.com.br/</loc>
          </url>
          <url>
            <loc>https://wm1.com.br/webstories</loc>
          </url>
        </urlset>
    `;

      expect(extractURLsFromSitemap(XMLContent)).toEqual([
        "https://wm1.com.br/",
        "https://wm1.com.br/webstories",
      ]);
    });
  });

  describe("fetchHtmlDataResponse", () => {
    it("should fetch HTML data response from URL", async () => {
      const URL = "https://example.com";
      const { html, statusCode, timeToLoad } = await fetchHtmlDataResponse(URL);
      expect(typeof html).toBe("string");
      expect(typeof statusCode).toBe("number");
      expect(typeof timeToLoad).toBe("number");
    });
  });
});
