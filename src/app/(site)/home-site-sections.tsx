import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeaderContainer } from "@/components/home/home-header-container";
import { WidgetMenu } from "@/components/home/widget-menu";
import { getCurrentViewer } from "@/lib/auth/get-current-viewer";
import { getHomeMessages } from "@/lib/i18n/home-dictionary";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { AWARDS_PATH, HOME_PATH, KUDOS_PATH } from "@/lib/site/site-routes";

// cacheComponents: cookie/session reads must sit under a <Suspense> boundary; the layout provides them.

export async function HomeHeaderSection() {
  const [locale, viewer] = await Promise.all([getRequestLocale(), getCurrentViewer()]);
  const { nav, header, accountMenu } = getHomeMessages(locale);
  return <HomeHeaderContainer initialLocale={locale} messages={{ nav, header, accountMenu }} viewer={viewer} />;
}

export async function HomeFooterSection() {
  const locale = await getRequestLocale();
  const m = getHomeMessages(locale);
  const links = [
    { label: m.nav.about, href: HOME_PATH },
    { label: m.nav.awards, href: AWARDS_PATH },
    { label: m.nav.kudos, href: KUDOS_PATH },
    // No destination yet (see plan, unresolved item 1): plain text, never a dead "#" link.
    { label: m.footer.standardsLabel },
  ];
  return (
    <>
      <HomeFooter links={links} copyright={m.footer.copyright} />
      <WidgetMenu label={m.widget.label} sendKudosLabel={m.widget.sendKudos} backToTopLabel={m.widget.backToTop} />
    </>
  );
}
