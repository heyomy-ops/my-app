import React from 'react';
import { FireIcon } from './Icons';

export const StreakCounter = ({ streakData }) => {
    const [currentStreak, setCurrentStreak] = React.useState(0);

    React.useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        let loopDate = new Date(today);
        const todayKey = today.toISOString().split('T')[0];

        // If today isn't done, the streak is based on days ending yesterday.
        if (!streakData[todayKey]) {
            loopDate.setDate(today.getDate() - 1);
        }

        // Loop backwards from the starting date (today or yesterday)
        for (let i = 0; i < 365 * 5; i++) {
            const checkDate = new Date(loopDate);
            checkDate.setDate(loopDate.getDate() - i);
            const checkDateKey = checkDate.toISOString().split('T')[0];

            if (streakData[checkDateKey]) {
                streak++;
            } else {
                // End of consecutive streak
                break;
            }
        }
        setCurrentStreak(streak);
    }, [streakData]);

    const todayCompleted = streakData[new Date().toISOString().split('T')[0]] || false;

    return (
        <div className="flex items-center gap-2 cursor-pointer">
            <FireIcon lit={todayCompleted} />
            <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{currentStreak}</span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-tight">day<br/>streak</span>
            </div>
        </div>
    );
};