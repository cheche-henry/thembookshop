import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 animate-pulse flex flex-col h-full">
      <div className="aspect-[3/4] bg-gray-200" />
      <div className="p-4 flex-1 flex flex-col">
        <div className="h-3 w-12 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
        <div className="mt-auto flex justify-between items-center">
          <div className="h-6 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}