import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Initial class is set by the inline script in index.html (saved choice, else OS preference).
export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // storage blocked: theme still applies for this page load
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      className={cn(
        'rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className
      )}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
