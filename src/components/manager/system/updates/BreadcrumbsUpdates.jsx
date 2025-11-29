import React from 'react';
    import { Link } from 'react-router-dom';
    import { ChevronRight } from 'lucide-react';

    const BreadcrumbsUpdates = ({ items }) => {
      return (
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-1.5 text-sm text-muted-foreground">
            {items.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="h-4 w-4 mx-1.5 text-gray-400 dark:text-gray-500" />}
                {item.link ? (
                  <Link
                    to={item.link}
                    className="hover:text-primary dark:hover:text-purple-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground dark:text-white">{item.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      );
    };

    export default BreadcrumbsUpdates;