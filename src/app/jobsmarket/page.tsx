import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs Market | Chancedee",
  description: "Find your dream job at Chancedee Jobs Market",
};

export default function JobsMarketHomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Jobs Market
      </h1>
      <p className="text-center text-muted-foreground">
        Welcome to Chancedee Jobs Market. Coming soon!
      </p>
    </div>
  );
}
