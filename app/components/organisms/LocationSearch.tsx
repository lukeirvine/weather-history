'use client';

import { useState, useRef, useEffect } from 'react';
import type { Location } from '@/app/lib/weather';
import LocationResultItem, { type GeoResult } from '@/app/components/molecules/LocationResultItem';

interface Props {
  onSelect: (location: Location) => void;
  selectedLocation: Location | null;
}

export default function LocationSearch({ onSelect, selectedLocation }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reflect externally-set location (e.g. restored from URL) in the input field
  useEffect(() => {
    if (selectedLocation) {
      setQuery(
        `${selectedLocation.name}${selectedLocation.admin1 ? `, ${selectedLocation.admin1}` : ''}, ${selectedLocation.country}`
      );
    }
  }, [selectedLocation]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function handleSelect(r: GeoResult) {
    onSelect({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      admin1: r.admin1,
    });
    setQuery(`${r.name}${r.admin1 ? `, ${r.admin1}` : ''}, ${r.country}`);
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <label className="input input-bordered flex items-center gap-2 w-full">
        {/* Search icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4 shrink-0 opacity-50"
        >
          <path
            fillRule="evenodd"
            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          className="grow"
          placeholder="Search for a city…"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {searching && <span className="loading loading-spinner loading-xs" />}
        {selectedLocation && !searching && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-success shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </label>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-base-100 border border-base-300 rounded-box shadow-lg overflow-hidden">
          {results.map((r) => (
            <LocationResultItem key={r.id} result={r} onSelect={handleSelect} />
          ))}
        </ul>
      )}
    </div>
  );
}
