import { User } from "@/src/types/user";
import FormField from "./FormField";

interface ArtistSelectFieldProps {
  artists: User[];
  selectedArtistIds: string[];
  onToggle: (artistId: string) => void;
}

export default function ArtistSelectField({ artists, selectedArtistIds, onToggle }: ArtistSelectFieldProps) {
  return (
    <FormField label="작가">
      {artists.length === 0 ? (
        <div className="rounded border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-500">
          등록된 작가가 없습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-1 rounded border border-zinc-800 bg-zinc-900 p-2">
          {artists.map((artist) => {
            const selected = selectedArtistIds.includes(artist.id);
            return (
              <label
                key={artist.id}
                className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggle(artist.id)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-white">{artist.name}</span>
              </label>
            );
          })}
        </div>
      )}

      {selectedArtistIds.length > 0 && (
        <p className="mt-2 text-xs text-zinc-500">{selectedArtistIds.length}명 선택됨</p>
      )}
    </FormField>
  );
}