import React from 'react';
    import { Link } from 'react-router-dom';
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
    import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

    const AccordionMenu = ({ icon, text, items, location, pathPrefix, onLinkClick, isCollapsed }) => {
      const isActiveParent = items.some(subItem => {
        if (subItem.type === 'accordion') {
          return subItem.items.some(nestedItem => location.pathname.startsWith(nestedItem.pathPrefix || nestedItem.path));
        }
        return location.pathname.startsWith(subItem.pathPrefix || subItem.path);
      });
      
      const handleSubItemClick = (subItem) => {
        if (subItem.action && typeof subItem.action === 'function') {
          subItem.action();
        }
        if (onLinkClick) {
          onLinkClick(subItem);
        }
      };

      if (isCollapsed) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center justify-center w-full p-2.5 text-sm font-medium rounded-lg transition-all group overflow-hidden whitespace-nowrap
                ${isActiveParent ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10'}`}>
                {React.cloneElement(icon, { className: 'h-5 w-5' })}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{text}</p>
              <nav className="flex flex-col space-y-1 mt-2">
                {items.map((subItem, index) => {
                  if (subItem.condition === false || subItem.type === 'separator' || subItem.type === 'subheader') return null;
                   if (subItem.type === 'accordion') {
                    return (
                        <div key={subItem.text + index} className="p-2">
                            <p className="font-semibold text-sm">{subItem.text}</p>
                            {subItem.items.map((nested, nIndex) => (
                               <Link key={nested.text + nIndex} to={nested.path} className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/5">
                                 {nested.icon} {nested.text}
                               </Link>
                            ))}
                        </div>
                    );
                  }
                  const isSubActive = location.pathname === subItem.path || (subItem.path !== '#' && location.pathname.startsWith(subItem.path));
                  return (
                     <Link
                      key={subItem.text + index}
                      to={subItem.disabled ? '#' : subItem.path}
                      onClick={() => handleSubItemClick(subItem)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${isSubActive ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10'}
                        ${subItem.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {subItem.icon}
                      {subItem.text}
                    </Link>
                  )
                })}
              </nav>
            </TooltipContent>
          </Tooltip>
        )
      }

      return (
        <Accordion type="single" collapsible className="w-full" defaultValue={isActiveParent ? text : null}>
          <AccordionItem value={text} className="border-none">
            <AccordionTrigger className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all hover:bg-primary/5 dark:hover:bg-primary/10 
              ${isActiveParent ? 'text-primary dark:text-primary-foreground' : 'text-muted-foreground hover:text-primary dark:hover:text-primary-foreground'}`}>
              <div className="flex items-center">
                {React.cloneElement(icon, { className: 'mr-3' })}
                {text}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0 pl-4">
              <nav className="flex flex-col space-y-1 border-l border-gray-200 dark:border-gray-700 ml-2 pl-4">
                {items.map((subItem, index) => {
                  if (subItem.condition === false) return null;
                  if (subItem.type === 'separator') return <hr key={subItem.key || `sep-${index}`} className="my-1 border-gray-200 dark:border-gray-700" />;
                  if (subItem.type === 'subheader') return <h4 key={subItem.key || `subheader-${index}`} className="px-2 py-1.5 text-xs font-semibold text-muted-foreground/70">{subItem.text}</h4>;
                  
                  if (subItem.type === 'accordion') {
                    return (
                        <div key={subItem.text + index} className="w-full -ml-3">
                           <AccordionMenu 
                                icon={subItem.icon}
                                text={subItem.text}
                                items={subItem.items}
                                location={location}
                                pathPrefix={subItem.pathPrefix}
                                onLinkClick={onLinkClick}
                                isCollapsed={false} // Nested accordion is never collapsed
                           />
                        </div>
                    );
                  }

                  const isSubActive = location.pathname === subItem.path || (subItem.path !== '#' && location.pathname.startsWith(subItem.path));
                  return (
                    <Link
                      key={subItem.text + index}
                      to={subItem.disabled ? '#' : subItem.path}
                      onClick={() => handleSubItemClick(subItem)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${isSubActive ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10'}
                        ${subItem.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      aria-disabled={subItem.disabled}
                      tabIndex={subItem.disabled ? -1 : undefined}
                    >
                      {subItem.icon}
                      {subItem.text}
                      {subItem.disabled && <span className="ml-auto text-xs opacity-70">(Soon)</span>}
                    </Link>
                  );
                })}
              </nav>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    };

    export default AccordionMenu;