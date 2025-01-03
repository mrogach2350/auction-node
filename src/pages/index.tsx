import { useState } from "react";
import { useRouter } from "next/router";
import { getAllVehicles } from "@/db";

export default function Home({ vehicles = [] }) {
  const router = useRouter();
  const [scraperUrl, setScrapeUrl] = useState<string>("");

  return (
    <div>
      <h1 className="title">Vehicles</h1>
      <div className="flex space-x-2 w-1/2 items-baseline">
        <h3 className="subtitle flex-none">Scrape Url</h3>
        <input
          className="input"
          value={scraperUrl}
          onChange={(e) => setScrapeUrl(e.target.value)}
        />
        <button className="button is-primary">Submit</button>
      </div>
      {vehicles.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Make</th>
              <th>Model</th>
              <th>Mileage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v: any) => (
              <tr>
                <td>{v.title}</td>
                <td>{v.make}</td>
                <td>{v.model}</td>
                <td>{v.mileage}</td>
                <td>
                  <button
                    onClick={() => router.push(`/vehicles/${v.id}`)}
                    className="button is-info">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  const vehicles = await getAllVehicles();
  return {
    props: {
      vehicles,
    },
  };
}
