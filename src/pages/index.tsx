import { useState } from "react";
export default function Home() {
  const [scraperUrl, setScrapeUrl] = useState<string>("");
  return (
    <div>
      <h1 className="title">Vehicles</h1>
      <div className="flex space-x-2 flex-shrink w-1/2 align-baseline">
        <span className="subtitle">Scrape Url</span>
        <input
          className="input"
          value={scraperUrl}
          onChange={(e) => setScrapeUrl(e.target.value)}
        />
        <button className="button is-primary">Submit</button>
      </div>
    </div>
  );
}
