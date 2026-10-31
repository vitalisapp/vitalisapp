// A stable viewport and card shared by the email confirmation screens.
export default function VerificationLayout({ children }) {
  return (
    <main data-theme="dark" className="relative isolate flex min-h-svh w-full bg-[#0e0e0e] px-4 py-8 font-['DM_Sans'] text-[#e5e2e1] sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/auth-gym.jpg')] bg-cover bg-[center_30%] brightness-[0.28] saturate-[0.7]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0e0e0e_100%)]" />
      <section aria-label="Email verification" className="m-auto w-full min-w-0 max-w-[440px] rounded-[20px] border border-[var(--accent)]/10 bg-[#121210]/90 p-6 text-center shadow-xl sm:p-8">
        {children}
      </section>
    </main>
  );
}
