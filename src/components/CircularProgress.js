import React from 'react';

export const CircularProgress = ({ value, goal, icon, label, unit }) => {
    const progress = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;

    // Circle settings
    const radius = 15.9155; // matches your SVG path
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress / 100);

    const iconClass = label === 'Water' 
        ? 'text-sky-400 dark:text-sky-300' 
        : 'text-text-secondary-light dark:text-text-secondary-dark';

    const progressColorClass =
        label === 'Calories' ? 'text-orange-500' :
        label === 'Protein' ? 'text-lime-500' :
        label === 'Water' ? 'text-sky-500' :
        'text-accent';

    return (
        <div className="relative flex flex-col items-center justify-center rounded-lg bg-card-light dark:bg-card-dark p-2 shadow-sm h-full w-full">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <circle
                    className="text-gray-200 dark:text-gray-700/50"
                    cx="18" cy="18" r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                />
                {/* Progress circle */}
                <circle
                    className={`${progressColorClass} transition-all duration-500`}
                    cx="18" cy="18" r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={`material-symbols-outlined text-lg ${iconClass}`}>{icon}</span>
                <p className="text-xl font-bold text-text-main-light dark:text-text-main-dark leading-tight">{Number(value).toFixed(1)}</p>
                <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark leading-tight">of {goal}{unit}</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">{label}</p>
            </div>
        </div>
    );
};