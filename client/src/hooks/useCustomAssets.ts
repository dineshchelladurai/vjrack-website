import { useState, useEffect } from 'react';

export function useCustomAssets() {
  const [customAssets, setCustomAssets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/custom-assets');
      const data = await res.json();
      setCustomAssets(data || {});
    } catch (err) {
      console.error("Failed to fetch custom assets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return { customAssets, loading, refetchAssets: fetchAssets };
}
