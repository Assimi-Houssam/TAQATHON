'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCallback } from 'react';

const filters = [
  { value: 'all', label: 'All Bids' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

export function QuickFilters() {
  const handleFilterChange = useCallback((value: string) => {
    console.log('Filter changed to:', value)
  }, [])

  return (
    <Tabs 
      defaultValue="all" 
      onValueChange={handleFilterChange}
    >
      <TabsList className="bg-zinc-100/50 p-1 rounded-md">
        {filters.map((filter) => (
          <TabsTrigger
            key={filter.value}
            value={filter.value}
            className="relative px-3 py-1.5 text-sm font-medium text-zinc-600 transition-all
              data-[state=active]:bg-white 
              data-[state=active]:text-zinc-900 
              data-[state=active]:shadow-sm
              hover:text-zinc-900"
          >
            {filter.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

