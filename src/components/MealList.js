import React from 'react';
import { XIcon } from './Icons';

export const MealList = ({ meals, onRemove }) => (
    <section className="mt-8 w-full">
        <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Today's Meals 🍲</h2>
        {meals.length === 0 ? (
            <p className="text-center text-text-secondary-light dark:text-text-secondary-dark py-4">No meals logged yet. Add one to get started!</p>
        ) : (
            <div className="mt-4 space-y-4">
                {meals.map((meal) => (
                    <div key={meal.id} className="flex items-center gap-4 rounded-lg bg-card-light dark:bg-card-dark p-4 shadow-sm animate-fade-in-up">
                        <div 
                            className="h-14 w-14 flex-shrink-0 rounded-lg bg-cover bg-center" 
                            style={{backgroundImage: `url(${meal.image || 'https://placehold.co/600x400/234C6A/F5F3F2?text=Meal'})`}}
                        ></div>
                        <div className="flex-grow">
                            <p className="font-medium text-text-main-light dark:text-text-main-dark capitalize">{meal.name}</p>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{(meal.calories || 0).toFixed(1)} kcal, {Number(meal.protein || 0).toFixed(1)}g protein</p>
                        </div>
                        <button onClick={() => onRemove(meal)} className="p-2 text-slate-500 rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors">
                            <XIcon />
                        </button>
                    </div>
                ))}
            </div>
        )}
    </section>
);