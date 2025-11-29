import React from 'react';
    import { ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react';
    import { Button } from '@/components/ui/button';

    const SortableHeader = ({ children, columnKey, sortConfig, requestSort }) => {
      const isSorted = sortConfig && sortConfig.key === columnKey;
      const SortIcon = isSorted
        ? sortConfig.direction === 'ascending' ? ArrowUp : ArrowDown
        : ChevronsUpDown;

      return (
        <Button variant="ghost" onClick={() => requestSort(columnKey)} className="px-1 py-1 h-auto -ml-3">
          {children}
          <SortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    };

    export default SortableHeader;