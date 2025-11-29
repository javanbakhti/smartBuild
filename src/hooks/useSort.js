import { useState, useMemo } from 'react';

    export const useSort = (items, config = null) => {
      const [sortConfig, setSortConfig] = useState(config);

      const sortedItems = useMemo(() => {
        if (!items) return [];
        let sortableItems = [...items];
        if (sortConfig !== null) {
          sortableItems.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            // Handle numeric sorting for appropriate keys
            if (sortConfig.key === 'floor') {
              const numA = parseInt(aValue, 10);
              const numB = parseInt(bValue, 10);
              if (!isNaN(numA) && !isNaN(numB)) {
                  if (numA < numB) return sortConfig.direction === 'ascending' ? -1 : 1;
                  if (numA > numB) return sortConfig.direction === 'ascending' ? 1 : -1;
                  return 0;
              }
            }

            // Handle string sorting (case-insensitive)
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              if (aValue.toLowerCase() < bValue.toLowerCase()) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
              }
              if (aValue.toLowerCase() > bValue.toLowerCase()) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
              }
              return 0;
            }
            
            // Handle boolean sorting
            if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
              if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
              if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
              return 0;
            }

            // Fallback for other types
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
          });
        }
        return sortableItems;
      }, [items, sortConfig]);

      const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
      };

      return { items: sortedItems, requestSort, sortConfig };
    };