import Image from "next/image";
import { GoogleLoginButton, type GoogleLoginButtonProps } from "./google-login-button";

export interface LoginHeroProps extends Pick<GoogleLoginButtonProps, "onLogin" | "loading"> {
  subtitle: string;
  tagline: string;
  buttonLabel: string;
  /** Localized OAuth failure text, shown under the button. */
  errorMessage?: string;
}

export function LoginHero({
  onLogin,
  loading,
  subtitle,
  tagline,
  buttonLabel,
  errorMessage,
}: LoginHeroProps) {
  return (
    // mm:662:14393
    <main className="relative z-10 flex flex-1 items-center px-4 py-12 md:px-12 xl:px-36">
      {/* mm:662:14394 */}
      <div className="flex w-full flex-col gap-12 md:gap-20">
        {/* mm:2939:9548 */}
        <h1 className="m-0">
          <Image
            src="/images/login/root-further-logo.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            priority
            className="h-auto w-[260px] md:w-[451px]"
          />
        </h1>
        {/* mm:662:14755 */}
        <div className="flex flex-col gap-6 pl-4">
          {/* mm:662:14753 */}
          <p className="m-0 max-w-[480px] text-base font-bold leading-10 tracking-[0.5px] md:text-xl">
            {subtitle}
            <br />
            {tagline}
          </p>
          {/* mm:662:14425 */}
          <div className="flex flex-col gap-3">
            <GoogleLoginButton onLogin={onLogin} loading={loading} label={buttonLabel} />
            {errorMessage && (
              <p role="alert" className="m-0 max-w-[305px] text-sm font-bold leading-5 text-red-500">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
