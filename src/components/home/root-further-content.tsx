import Image from "next/image";

export interface RootFurtherContentProps {
  /** Paragraph blocks (one string per paragraph) */
  introParagraphs: string[];
  quote: string;
  quoteTranslation: string;
  outroParagraphs: string[];
}

const BODY = "text-justify text-base font-bold leading-6 text-white md:text-2xl md:leading-8";

export function RootFurtherContent({ introParagraphs, quote, quoteTranslation, outroParagraphs }: RootFurtherContentProps) {
  return (
    // mm:3204:10152
    <section className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-8 px-4 md:px-8 xl:px-0">
      {/* mm:3204:10153 */}
      <h2 className="flex flex-col items-start">
        <span className="sr-only">Root Further</span>
        {/* mm:3204:10155 */}
        <Image src="/images/home/root-text.png" alt="" width={189} height={67} aria-hidden />
        {/* mm:3204:10154 */}
        <Image src="/images/home/further-text.png" alt="" width={290} height={67} aria-hidden />
      </h2>
      {/* mm:5001:14827 */}
      <div className="flex w-full flex-col gap-8">
        {/* mm:3204:10156 */}
        <div className={BODY}>
          {introParagraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        {/* mm:3204:10161 */}
        <p className="text-center text-xl font-bold leading-8 text-white">
          {quote}
          <br />
          {quoteTranslation}
        </p>
        {/* mm:3204:10162 */}
        <div className={BODY}>
          {outroParagraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
