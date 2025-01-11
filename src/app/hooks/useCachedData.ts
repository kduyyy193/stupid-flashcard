import { useCallback, useState } from "react";

const useLazyCachedData = <T>(
  defaultValue: T,
  key: string,
  apiUrl: string,
  expirationTime: number = 300000
) => {
  const [data, setData] = useState<T>(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getData = useCallback(async () => {
    try {
      setLoading(true);
      const cachedData = localStorage.getItem(key);
      const cachedTime = localStorage.getItem(`${key}_time`);
      const currentTime = new Date().getTime();
      if (
        cachedData &&
        cachedTime &&
        currentTime - Number(cachedTime) < expirationTime
      ) {
        setData(JSON.parse(cachedData));
      } else {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const jsonData: T = await response.json();

        localStorage.setItem(key, JSON.stringify(jsonData));
        localStorage.setItem(`${key}_time`, currentTime.toString());

        setData(jsonData);
      }
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [key, apiUrl, expirationTime]);

  return { data, error, loading, getData };
};

export default useLazyCachedData;
