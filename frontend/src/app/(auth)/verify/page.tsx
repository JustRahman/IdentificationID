export default function VerifyPage() {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold mb-2">Check your email</h1>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        We sent a verification link to your email.
        <br />
        Click it to activate your account.
      </p>
      <button className="border border-border text-foreground px-5 py-2.5 rounded-lg text-sm hover:bg-surface">
        Resend email
      </button>
    </div>
  );
}
