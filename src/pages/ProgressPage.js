import React from 'react';

const ProgressPage = ({ userName }) => {
    return (
        <div className="flex-grow p-6">
            <header className="flex items-center justify-between">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Your Progress</h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Hello, {userName.split(' ')[0] || 'User'}</p>
                </div>
            </header>
            <section className="mt-8 text-center bg-card-light dark:bg-card-dark p-8 rounded-lg">
                <h2 className="text-xl font-bold mb-4">rahul jinda hai!</h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    This is where you'll see beautiful charts and graphs of your weight, calories, and macro trends over time.
                </p>
            </section>
        </div>
    );
};

export default ProgressPage;
