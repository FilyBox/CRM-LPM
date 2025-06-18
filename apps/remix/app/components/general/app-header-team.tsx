import { type HTMLAttributes, useEffect, useState } from 'react';

import { MenuIcon } from 'lucide-react';
import { useLocation } from 'react-router';

import type { SessionUser } from '@documenso/auth/server/lib/session/session';
import type { TGetTeamsResponse } from '@documenso/lib/server-only/team/get-teams';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

import { AppCommandMenu } from './app-command-menu';
import { AppNavDesktopTeams } from './app-nav-desktop-team';
import { AppNavMobileTeam } from './app-nav-mobile-team';
import { Dropmemu } from './dropdown-menu';
import { MenuSwitcher } from './menu-switcher';

export type HeaderProps = HTMLAttributes<HTMLDivElement> & {
  user: SessionUser;
  teams: TGetTeamsResponse;
};

export type AppNavDesktopProps = HTMLAttributes<HTMLDivElement> & {
  setIsCommandMenuOpen: (value: boolean) => void;
};
export const HeaderTeams = ({ className, user, teams, ...props }: HeaderProps) => {
  const { pathname } = useLocation();
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isPathTeamUrl = (teamUrl: string) => {
    if (!pathname || !pathname.startsWith(`/t/`)) {
      return false;
    }

    return pathname.split('/')[2] === teamUrl;
  };

  const selectedTeam = teams?.find((team) => isPathTeamUrl(team.url));

  return (
    <header
      className={cn(
        'supports-backdrop-blur:bg-background/60 bg-background/95 sticky top-0 z-[60] flex h-16 w-full items-center border-b border-b-transparent backdrop-blur duration-200',
        scrollY > 5 && 'border-b-border',
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-x-4 px-4 md:justify-normal md:px-0">
        <AppNavDesktopTeams setIsCommandMenuOpen={setIsCommandMenuOpen} />
        <Dropmemu />
        <div className="flex gap-x-4" title={selectedTeam ? selectedTeam.name : (user.name ?? '')}>
          <MenuSwitcher user={user} teams={teams} />
        </div>

        {/* <SearchIcon className="text-muted-foreground h-6 w-6" /> */}

        <Button
          variant="outline"
          className="text-muted-foreground flex w-full max-w-44 items-center justify-between rounded-lg md:hidden"
          onClick={() => setIsHamburgerMenuOpen(true)}
        >
          <MenuIcon className="text-muted-foreground h-6 w-6" />
        </Button>
        <AppCommandMenu open={isCommandMenuOpen} onOpenChange={setIsCommandMenuOpen} />
        <AppNavMobileTeam
          isMenuOpen={isHamburgerMenuOpen}
          onMenuOpenChange={setIsHamburgerMenuOpen}
        />
      </div>
    </header>
  );
};
