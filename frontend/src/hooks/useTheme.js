import { useCallback, useState } from 'react';

const KEY = 'worksphere-theme';
const read = () => { try { return localStorage.getItem(KEY) === 'dark'; } catch { return false; } };

// Same storage key the app already used; now it flips the `dark` class on <html>
// so landing, auth and workspace all share one theme.
export default function useTheme() {
  const [dark, setDark] = useState(read);
  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try { localStorage.setItem(KEY, next ? 'dark' : 'light'); } catch { /* storage blocked */ }
      return next;
    });
  }, []);
  return { dark, toggle };
}
