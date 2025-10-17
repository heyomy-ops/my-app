import React from 'react';
import { XIcon, SparklesIcon } from './Icons';

export const MealInsightCard = ({ insight, isLoading, error, onClear }) => {
    if (!insight && !isLoading && !error) return null;
    return (
        <div className="w-full mt-6 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up relative">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center"><SparklesIcon /><span className="ml-2">Daily Insight</span></h3>
            {isLoading && <div className="flex items-center justify-center space-x-2 py-4"><div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div><p className="text-slate-600 dark:text-slate-300">Generating your personalized insight...</p></div>}
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
            {insight && !isLoading && <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{insight}</p>}
            {(insight || error) && !isLoading && <button onClick={onClear} className="absolute top-4 right-4 p-1 text-slate-500 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><XIcon /></button>}
        </div>
    );
};