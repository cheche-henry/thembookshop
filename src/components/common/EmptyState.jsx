import React from 'react';
import Icons from './Icons';

export default function EmptyState({ 
  message, 
  subtext, 
  action, 
  actionLabel,
  icon: IconComponent = Icons.Search 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-dashed border-gray-300">
      <div className="bg-gray-50 p-6 rounded-full mb-4 text-gray-400">
        <IconComponent className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500 mb-6 max-w-md">{subtext}</p>
      {action && actionLabel && (
        <button 
          onClick={action} 
          className="bg-primary-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primary-700 transition-colors uppercase tracking-wide"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}