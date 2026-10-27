export default function Home() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Wireless Activation Console
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          A demo retail/care console for activating wireless lines: browse the
          device catalog and rate plans, manage subscribers, submit activation
          orders, and track network provisioning. Built for the GitHub Copilot
          workshop.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Devices & Plans", body: "Catalog of handsets and rate plans." },
          { title: "Activation Orders", body: "Submit and track line activations." },
          { title: "Provisioning", body: "Monitor network provisioning status." },
        ].map((card) => (
          <div key={card.title} className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-carrier-700">{card.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
