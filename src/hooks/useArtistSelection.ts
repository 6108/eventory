import { useState } from "react";

export function useArtistSelection(initialArtistIds: string[] = []) {
  const [selectedArtistIds, setSelectedArtistIds] =
    useState<string[]>(initialArtistIds);

  function toggleArtist(artistId: string) {
    setSelectedArtistIds((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId]
    );
  }

  return {
    selectedArtistIds,
    toggleArtist,
  };
}