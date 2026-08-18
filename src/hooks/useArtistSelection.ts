import { useState } from "react";

export function useArtistSelection() {
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);

  function toggleArtist(artistId: string) {
    setSelectedArtistIds((prev) =>
      prev.includes(artistId) ? prev.filter((id) => id !== artistId) : [...prev, artistId]
    );
  }

  return { selectedArtistIds, toggleArtist };
}