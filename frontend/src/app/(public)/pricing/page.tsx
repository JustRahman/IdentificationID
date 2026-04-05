import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "For trying it out",
    features: ["10 products", "Basic product page", "Email support"],
  },
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    desc: "For growing businesses",
    features: ["100 products", "Priority support", "Analytics"],
    popular: true,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/mo",
    desc: "For large manufacturers",
    features: ["Unlimited products", "API access", "Dedicated support"],
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-2xl font-semibold text-center mb-2">Pricing</h1>
      <p className="text-muted text-center mb-12">
        Start free. No credit card required.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-background rounded-xl p-6 border ${
              plan.popular ? "border-accent ring-1 ring-accent" : "border-border"
            }`}
          >
            {plan.popular && (
              <span className="text-xs font-medium text-accent mb-3 block">
                Most popular
              </span>
            )}
            <h3 className="text-base font-semibold">{plan.name}</h3>
            <p className="text-sm text-muted mb-4">{plan.desc}</p>
            <div className="mb-5">
              <span className="text-3xl font-semibold">{plan.price}</span>
              <span className="text-sm text-muted">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-muted flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={`block text-center py-2.5 rounded-lg text-sm font-medium ${
                plan.popular
                  ? "bg-accent text-white hover:bg-accent-hover"
                  : "border border-border text-foreground hover:bg-surface"
              }`}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
