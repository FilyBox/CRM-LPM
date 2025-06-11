import type { Recipient } from '@prisma/client';

type enhancedAssignees = {
  name: string | null;
  email: string;
};

type enhancedArtists = {
  artistName: string | null;
};

export const extractInitials = (text: string) =>
  text
    .split(' ')
    .map((name: string) => name.slice(0, 1).toUpperCase())
    .slice(0, 2)
    .join('');

export const recipientAbbreviation = (recipient: Recipient) => {
  return extractInitials(recipient.name) || recipient.email.slice(0, 1).toUpperCase();
};

export const usereAbbreviation = (user: enhancedAssignees) => {
  return extractInitials(user.name || '') || user.email.slice(0, 1).toUpperCase();
};

export const artistAbbreviation = (artist: enhancedArtists) => {
  return extractInitials(artist.artistName || '');
};
