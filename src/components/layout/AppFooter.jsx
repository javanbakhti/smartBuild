import React from 'react';

    const AppFooter = () => {
      return (
        <footer className="py-4 px-4 md:px-8 border-t bg-background/95">
          <div className="container flex items-center justify-center md:h-12">
            <p className="text-balance text-center text-xs leading-loose text-muted-foreground md:text-sm">
              &copy; {new Date().getFullYear()} Smart Intercom System. All Rights Reserved.
            </p>
          </div>
        </footer>
      );
    };

    export default AppFooter;