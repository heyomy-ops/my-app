import React from 'react';
import { FireIcon, XIcon, SparklesIcon } from '../components/Icons';
import { StreakCounter } from '../components/StreakCounter';
import { CircularProgress } from '../components/CircularProgress';
import { LogOutIcon } from '../components/Icons';
import { GoalRecommendationCard } from '../components/GoalRecommendationCard';
import { MealList } from '../components/MealList';
import { MealInsightCard } from '../components/MealInsightCard';

const HomePage = ({
    userName, 
    currentDate, 
    setIsStreakModalOpen, 
    handleLogout, 
    streakData, 
    totalCalories, 
    dailyGoal, 
    totalProtein, 
    dailyProteinGoal, 
    todaysWaterIntake, 
    dailyWaterGoal, 
    handleAddWater, 
    maintenanceCalories, 
    surveyHistory, 
    getMealInsights, 
    isInsightLoading, 
    insight, 
    insightError, 
    clearInsight, 
    meals, 
    removeMeal, 
    weeklyProgress
}) => {
    return (
        <div className="flex-grow p-6">
            <header className="flex items-center justify-between">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Hello, {userName.split(' ')[0] || 'User'} 👋</h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{currentDate}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsStreakModalOpen(true)} className="flex items-center gap-2 p-2 rounded-full bg-card-light dark:bg-card-dark text-text-secondary-light dark:text-text-secondary-dark">
                        <StreakCounter streakData={streakData} />
                    </button>
                    <button onClick={handleLogout} title="Log Out" className="flex h-12 w-12 items-center justify-center rounded-full bg-card-light dark:bg-card-dark text-text-secondary-light dark:text-text-secondary-dark">
                        <LogOutIcon />
                    </button>
                </div>
            </header>
            <section className="mt-8 grid grid-cols-3 gap-4">
                <CircularProgress value={totalCalories} goal={dailyGoal} icon="local_fire_department" label="Calories" unit="kcal" />
                <CircularProgress value={totalProtein} goal={dailyProteinGoal} icon="restaurant" label="Protein" unit="g" />
                <button onClick={handleAddWater} className="w-full h-full">
                    <CircularProgress value={(todaysWaterIntake / 1000).toFixed(1)} goal={(dailyWaterGoal / 1000).toFixed(1)} icon="water_drop" label="Water" unit="L" />
                </button>
            </section>

            <GoalRecommendationCard
                maintenanceCalories={maintenanceCalories}
                dailyGoal={dailyGoal}
                userGoal={surveyHistory?.data?.goal}
            />

            {meals.length > 0 && !isInsightLoading && !insight && !insightError && (
                <div className="text-center mt-6 animate-fade-in-up">
                    <button onClick={getMealInsights} disabled={isInsightLoading} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/50 hover:shadow-xl">
                        <SparklesIcon /><span className="ml-2">✨ Get Meal Insights</span>
                    </button>
                </div>
            )}
            <MealInsightCard insight={insight} isLoading={isInsightLoading} error={insightError} onClear={clearInsight} />
            <MealList meals={meals} onRemove={removeMeal} />
        </div>
    );
};

export default HomePage;