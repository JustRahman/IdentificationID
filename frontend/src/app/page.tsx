import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <Link href="/" className="text-lg font-semibold">
            Identification ID
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-muted hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="text-muted hover:text-foreground">
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-2xl mx-auto text-center pt-20 pb-16 px-6">
        <h1 className="text-4xl font-semibold leading-tight mb-4">
          Digital passport for
          <br />
          every product
        </h1>
        <p className="text-lg text-muted mb-8 leading-relaxed">
          Register your products, get a unique ID, and let customers
          instantly access manuals, specs, and certificates.
        </p>

        {/* Quick Search */}
        <div className="max-w-md mx-auto mb-6">
          <form className="flex gap-2" action="/lookup">
            <input
              type="text"
              name="q"
              placeholder="Enter ID, e.g. IID-4F9A-2K7Q"
              className="flex-1 border border-border rounded-lg px-4 py-3 text-sm bg-background"
            />
            <button
              type="submit"
              className="bg-accent text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/register"
            className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover"
          >
            Register as Manufacturer
          </Link>
          <Link
            href="/lookup"
            className="border border-border text-foreground px-5 py-2.5 rounded-lg text-sm hover:bg-surface"
          >
            Look Up a Product
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface border-y border-border py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Register your product",
                desc: "Add product details and upload manuals. You get a unique Identification ID.",
              },
              {
                step: "2",
                title: "Print the ID",
                desc: "Put the ID on your packaging, labels, or documentation.",
              },
              {
                step: "3",
                title: "Customers look it up",
                desc: "Anyone can enter the ID on our site and instantly access product info.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-semibold">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-4xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface border border-border rounded-xl p-8">
            <h3 className="text-lg font-semibold mb-4">For Manufacturers</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li>Reduce support calls with accessible digital manuals</li>
              <li>Prove product authenticity with verified IDs</li>
              <li>Update product info anytime without reprinting</li>
              <li>Track how many customers look up your products</li>
            </ul>
          </div>
          <div className="bg-surface border border-border rounded-xl p-8">
            <h3 className="text-lg font-semibold mb-4">For Consumers</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li>Find manuals and specs instantly by product ID</li>
              <li>No apps to install — just search on the website</li>
              <li>Verify that a product comes from a real manufacturer</li>
              <li>Download PDF manuals, warranties, and certificates</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted">
          <span className="font-semibold text-foreground">Identification ID</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/lookup" className="hover:text-foreground">Product Lookup</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
