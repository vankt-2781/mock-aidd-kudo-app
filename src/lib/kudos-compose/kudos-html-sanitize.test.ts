import { describe, expect, it } from "vitest";
import { sanitizeKudosHtml } from "./kudos-html-sanitize";

const EDITOR_FIXTURE =
  '<p>Hi <span data-type="mention" data-id="u1" data-label="An">@An</span> <strong>bold</strong> <em>it</em> <s>del</s></p>' +
  '<ol><li><p>one</p></li><li><p>two</p></li></ol><blockquote><p>quote</p></blockquote>' +
  '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com/a?b=1&amp;c=2">link</a></p>';

describe("sanitizeKudosHtml", () => {
  it("round-trips real editor output unchanged", () => {
    expect(sanitizeKudosHtml(EDITOR_FIXTURE).html).toBe(EDITOR_FIXTURE);
  });

  it("drops the free-form class attribute the editor emits on mention spans", () => {
    const { html } = sanitizeKudosHtml('<p><span data-type="mention" data-id="u1" data-label="An" class="mention fixed inset-0">@An</span></p>');
    expect(html).toBe('<p><span data-type="mention" data-id="u1" data-label="An">@An</span></p>');
  });

  it("strips script, handlers, style, iframe", () => {
    const { html } = sanitizeKudosHtml(
      '<p onclick="x()" style="color:red">a</p><script>alert(1)</script><iframe src="//e"></iframe><img src=x onerror=y>',
    );
    expect(html).toBe("<p>a</p>");
  });

  it("drops javascript:, data: hrefs but keeps text", () => {
    expect(sanitizeKudosHtml('<p><a href="javascript:alert(1)">x</a></p>').html).toBe("<p><a rel=\"noopener noreferrer nofollow\">x</a></p>");
    expect(sanitizeKudosHtml('<p><a href="data:text/html,1">x</a></p>').html).not.toContain("data:");
  });

  it("keeps mailto and forces rel", () => {
    const { html } = sanitizeKudosHtml('<p><a href="mailto:a@b.co" rel="opener">m</a></p>');
    expect(html).toContain('href="mailto:a@b.co"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
    expect(html).not.toContain("opener\"");
  });

  it("keeps only data-type=mention spans", () => {
    expect(sanitizeKudosHtml('<p><span data-type="evil" data-id="1">x</span></p>').html).toBe("<p>x</p>");
  });

  it("derives text: block separation, entities decoded, whitespace collapsed", () => {
    expect(sanitizeKudosHtml("<p>a</p><p>b</p>").text).toBe("a b");
    expect(sanitizeKudosHtml("<p>Tom &amp; Jerry &lt;3</p>").text).toBe("Tom & Jerry <3");
    expect(sanitizeKudosHtml("<p>a<br>b</p>").text).toBe("a b");
    expect(sanitizeKudosHtml("<ol><li><p>x</p></li><li><p>y</p></li></ol>").text).toBe("x y");
  });

  it("yields blank text for empty paragraphs and script-only input", () => {
    expect(sanitizeKudosHtml("<p></p>").text).toBe("");
    expect(sanitizeKudosHtml("<p>  </p><script>x</script>").text).toBe("");
  });
});
