import React from 'react';

export function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex items-center h-16 px-4 border-b shrink-0 bg-background/80 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold md:text-2xl font-headline text-primary">
          Innoscripta
        </h1>
      </div>
      <div className="ml-auto">
        {children}
      </div>
    </header>
  );
}
