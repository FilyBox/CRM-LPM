'use client';

import { type ReactNode } from 'react';

import { TriggerAuthContext } from '@trigger.dev/react-hooks';

export function TriggerProvider({
  accessToken,
  children,
}: {
  accessToken: string;
  children: ReactNode;
}) {
  return (
    <TriggerAuthContext.Provider value={{ accessToken }}>{children}</TriggerAuthContext.Provider>
  );
}
