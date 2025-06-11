import React from 'react';

import { Check } from 'lucide-react';

import { Avatar, AvatarFallback } from '@documenso/ui/primitives/avatar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@documenso/ui/primitives/command';
import { ScrollArea } from '@documenso/ui/primitives/scroll-area';

type artistData = {
  teamId: number | null;
  id: number;
  userId: number | null;
  createdAt: Date;
  artistId: number;
  artistName: string;
}[];
interface PopoverMembersProps {
  selectedArtists: artistData;
  setSelectedArtists: React.Dispatch<React.SetStateAction<artistData>>;
}

interface PopoverMembersProps {
  selectedArtists: artistData;
  setSelectedArtists: React.Dispatch<React.SetStateAction<artistData>>;
  userArray: readonly {
    readonly artistName: string;
    readonly id: number;
    readonly artistId: number;
  }[];
}

export const PopoverArtists = ({
  selectedArtists,
  userArray,
  setSelectedArtists,
}: PopoverMembersProps) => {
  return (
    <Command className="z-9999 rounded-t-none border-t bg-transparent">
      <CommandInput placeholder="Search user..." />
      <CommandList className="!h-fit">
        <CommandEmpty>No hay historial de miembros</CommandEmpty>
        <CommandGroup className="p-2">
          <ScrollArea className="h-56">
            {userArray.map((user) => (
              <CommandItem
                key={user.id}
                className="relative flex items-center px-2"
                onSelect={() => {
                  if (
                    selectedArtists.some(
                      (selectedArtist) => selectedArtist.artistName === user.artistName,
                    )
                  ) {
                    // Si el usuario ya está seleccionado, lo quitamos
                    setSelectedArtists(
                      selectedArtists.filter(
                        (selectedArtist) => selectedArtist.artistId !== user.artistId,
                      ),
                    );
                  } else {
                    // Si no está seleccionado, lo añadimos a la lista actual
                    setSelectedArtists([
                      ...selectedArtists,
                      {
                        teamId: null,
                        id: user.id,
                        userId: null,
                        createdAt: new Date(),
                        artistId: user.artistId,
                        artistName: user.artistName || '',
                      },
                    ]);
                  }
                }}
              >
                <Avatar
                  key={user.id}
                  className="border-background inline-block border-2 bg-gray-200"
                >
                  {user.artistName && <AvatarFallback>{user.artistName[0]}</AvatarFallback>}
                </Avatar>
                <div className="">
                  <p className="text-sm font-medium leading-none">{user.artistName}</p>
                </div>
                {selectedArtists.some(
                  (selectedArtist) => selectedArtist.artistId === user.artistId,
                ) ? (
                  <Check className="text-primary bg-foreground absolute right-2 ml-auto flex h-6 w-6 rounded-full p-1" />
                ) : null}
              </CommandItem>
            ))}
          </ScrollArea>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
