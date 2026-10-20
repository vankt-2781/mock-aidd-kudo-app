export function LoginFooter({ text }: { text: string }) {
  return (
    // mm:662:14447
    // Fixed per TC 33a1dacf: footer stays visible at the bottom regardless of scrolling.
    <footer className="fixed bottom-0 inset-x-0 z-10 flex items-center justify-center border-t border-[#2E3940] bg-[#00101A] h-[91px] px-4 md:px-[90px]">
      {/* mm:I662:14447;342:1413 */}
      <p className="m-0 text-center font-[family-name:var(--font-montserrat-alternates)] text-base font-bold leading-6">
        {text}
      </p>
    </footer>
  );
}
