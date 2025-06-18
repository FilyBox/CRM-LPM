import type { HTMLAttributes } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { List } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { getRootHref } from '@documenso/lib/utils/params';
import { Button } from '@documenso/ui/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@documenso/ui/primitives/dropdown-menu';

const navigationLinks = [
  { href: '/isrc', label: msg`ISRC` },
  { href: '/contracts', label: msg`Contracts` },
  { href: '/chatspace', label: msg`Chat` },
  { href: '/event', label: msg`Events` },
  // { href: '/buyer', label: msg`Buyers` },
];

export type AppNavDesktopProps = HTMLAttributes<HTMLDivElement> & {
  setIsCommandMenuOpen: (value: boolean) => void;
};

export const Dropmemu = (): JSX.Element => {
  const { _ } = useLingui();
  const params = useParams();
  const rootHref = getRootHref(params, { returnEmptyRootString: true });
  const dropdownLinks = navigationLinks;
  return (
    <div className="flex items-baseline gap-x-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-2">
            <List className="mr-2 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-200 overflow-y-auto">
          {dropdownLinks.map(({ href, label }) => (
            <DropdownMenuItem asChild key={href}>
              <Link to={`${rootHref}${href}`}>{_(label)}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
