import React from 'react';

export const GoalRecommendationCard = ({ maintenanceCalories, dailyGoal, userGoal }) => {
    if (!maintenanceCalories || !dailyGoal || !userGoal) {
        return null; // Don't render if data isn't ready
    }

    let recommendationText = '';
    let difference = 0;

    switch (userGoal) {
        case 'lose':
            difference = maintenanceCalories - dailyGoal;
            recommendationText = `This is a ${difference} kcal deficit from your maintenance level to promote steady weight loss.`;
            break;
        case 'gain':
            difference = dailyGoal - maintenanceCalories;
            recommendationText = `This is a ${difference} kcal surplus over your maintenance level to support muscle gain.`;
            break;
        case 'maintain':
            recommendationText = 'This is your maintenance level, perfect for keeping your current weight.';
            break;
        default:
            recommendationText = 'Your calorie goal is set to help you achieve your objective.';
    }

    return (
        <section className="mt-8 w-full p-6 bg-card-light dark:bg-card-dark rounded-lg shadow-sm animate-fade-in-up">
            <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-4 text-center">Your Calorie Plan</h2>
            <div className="flex justify-around items-center text-center">
                <div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Maintenance</p>
                    <p className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{maintenanceCalories} <span className="text-lg">kcal</span></p>
                </div>
                <div className="text-blue-500 dark:text-blue-400 font-bold text-3xl">
                    →
                </div>
                <div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark capitalize">{userGoal} Goal</p>
                    <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">{dailyGoal} <span className="text-lg">kcal</span></p>
                </div>
            </div>
            <p className="mt-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">{recommendationText}</p>
        </section>
    );
};