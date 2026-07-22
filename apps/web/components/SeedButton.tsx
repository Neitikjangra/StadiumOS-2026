'use client';

import { useState } from 'react';

export function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setResult(data.message || 'Seed complete');
    } catch (e) {
      setResult('Seed failed — check console');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="px-4 py-2 bg-success text-white rounded-lg text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2"
      >
        {loading ? 'Seeding...' : 'Seed Initial Data'}
      </button>
      {result && (
        <span className="text-sm text-text-muted">{result}</span>
      )}
    </div>
  );
}
