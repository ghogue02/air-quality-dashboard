'use client';

import { useEffect, useState } from 'react';

interface Measurement {
  parameter: string;
  value: number;
  unit: string;
}

interface Location {
  name: string;
  measurements: Measurement[];
}

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirQualityData = async () => {
      try {
        // Bounding box for NYC Tri-State area (approximate: SW Longitude, SW Latitude, NE Longitude, NE Latitude)
        // This is a rough estimate and can be refined.
        const boundingBox = '-75.5,39.5,-72.5,42.0';
        const response = await fetch(
          `https://api.openaq.org/v2/latest?limit=100&page=1&offset=0&sort=desc&radius=1000&order_by=lastUpdated&dumpRaw=false&coordinates=${boundingBox}&location_type=city&entity=community&value_from=0`,
          {
            headers: {
              'X-API-Key': process.env.NEXT_PUBLIC_OPENAQ_API_KEY || '',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setLocations(data.results);
      } catch (e: unknown) {
        if (e instanceof Error) {
        setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAirQualityData();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading air quality data...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">NYC Tri-State Air Quality Dashboard</h1>
      <p className="text-center mb-8">
        Explore real-time air quality data for the NYC Tri-State area, powered by OpenAQ.
      </p>

      {locations.length === 0 ? (
        <p className="text-center text-gray-500">No air quality data found for the specified area. Try adjusting the bounding box or filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div key={location.name} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">{location.name}</h2>
              <ul className="list-disc list-inside">
                {location.measurements.map((measurement, index) => (
                  <li key={index}>
                    {measurement.parameter}: {measurement.value} {measurement.unit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
        Data provided by <a href="https://openaq.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAQ</a>.
        Learn more about open source data and air quality monitoring.
      </p>
    </div>
  );
}