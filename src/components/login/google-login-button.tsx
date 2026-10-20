export interface GoogleLoginButtonProps {
  onLogin?: () => void;
  loading?: boolean;
  disabled?: boolean;
  label: string;
}

export function GoogleLoginButton({
  onLogin,
  loading = false,
  disabled = false,
  label,
}: GoogleLoginButtonProps) {
  const inactive = disabled || loading;
  return (
    // mm:662:14426
    <button
      type="button"
      onClick={onLogin}
      disabled={inactive}
      aria-busy={loading}
      className="flex h-[60px] w-full max-w-[305px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] px-6 py-4 text-[#00101A] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,234,158,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      {/* mm:I662:14426;186:1568 */}
      <span className="text-[22px] font-bold leading-7">{label}</span>
      {loading ? (
        <span
          aria-hidden
          className="h-6 w-6 animate-spin rounded-full border-2 border-[#00101A]/30 border-t-[#00101A]"
        />
      ) : (
        // mm:I662:14426;186:1766
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/images/login/icon-google.svg" alt="" width={24} height={24} />
      )}
    </button>
  );
}
