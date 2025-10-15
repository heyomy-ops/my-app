import React, { useState, useEffect } from 'react';

const calculateAge = (dob) => {
    if (!dob || !dob.year || !dob.month || !dob.day) return 'N/A';
    const birthDate = new Date(dob.year, dob.month - 1, dob.day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const ProfilePage = ({ surveyHistory, onUpdate, onLogout }) => {
    const [currentWeight, setCurrentWeight] = useState(0);
    const [activityLevel, setActivityLevel] = useState('sedentary');
    const [weeklyRate, setWeeklyRate] = useState(0.5);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (surveyHistory && surveyHistory.data) {
            setCurrentWeight(surveyHistory.data.weight || 0);
            setActivityLevel(surveyHistory.data.activityLevel || 'sedentary');
            setWeeklyRate(surveyHistory.data.weeklyRate || 0.5);
        }
    }, [surveyHistory]);

    if (!surveyHistory || !surveyHistory.data) {
        return (
            <div className="flex-grow p-6 text-center">
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    Loading profile data...
                </p>
            </div>
        );
    }

    const { name, dob, height, goal } = surveyHistory.data;
    const age = calculateAge(dob);

    const handleSaveChanges = () => {
        onUpdate({
            weight: parseFloat(currentWeight),
            activityLevel,
            weeklyRate: parseFloat(weeklyRate),
        });
        setIsEditing(false);
    };
    
    const activityLevels = [
        { id: 'sedentary', label: 'Sedentary' },
        { id: 'light', label: 'Lightly Active' },
        { id: 'moderate', label: 'Moderately Active' },
        { id: 'active', label: 'Very Active' }
    ];

    const goalRates = [
        { value: 0.25, label: 'Gentle (0.25 kg/week)' },
        { value: 0.5, label: 'Steady (0.5 kg/week)' },
        { value: 0.75, label: 'Ambitious (0.75 kg/week)' },
        { value: 1.0, label: 'Intense (1.0 kg/week)' }
    ];


    return (
        <div className="flex-grow p-6 bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Profile</h1>
                <button 
                    onClick={onLogout} 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                    Logout
                </button>
            </header>

            <div className="space-y-6">
                {/* User Info Card */}
                <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold capitalize mb-4">{name}</h2>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Age</p>
                            <p className="text-xl font-semibold">{age}</p>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Height</p>
                            <p className="text-xl font-semibold">{height} cm</p>
                        </div>
                    </div>
                </div>

                {/* Editable Details Card */}
                <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Your Details</h3>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="font-semibold text-blue-500">Edit</button>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Current Weight (kg)</label>
                            <input 
                                type="number"
                                value={currentWeight}
                                onChange={(e) => setCurrentWeight(e.target.value)}
                                disabled={!isEditing}
                                className="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-lg outline-none focus:border-blue-500 border-2 border-transparent disabled:opacity-70"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Activity Level</label>
                            <select 
                                value={activityLevel} 
                                onChange={(e) => setActivityLevel(e.target.value)}
                                disabled={!isEditing}
                                className="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-lg outline-none focus:border-blue-500 border-2 border-transparent disabled:opacity-70"
                            >
                                {activityLevels.map(level => <option key={level.id} value={level.id}>{level.label}</option>)}
                            </select>
                        </div>
                        {goal !== 'maintain' && (
                             <div>
                                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Weekly Pace</label>
                                <select 
                                    value={weeklyRate} 
                                    onChange={(e) => setWeeklyRate(e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-lg outline-none focus:border-blue-500 border-2 border-transparent disabled:opacity-70"
                                >
                                    {goalRates.map(rate => <option key={rate.value} value={rate.value}>{rate.label}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setIsEditing(false)} className="w-full py-3 rounded-lg font-semibold bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                            <button onClick={handleSaveChanges} className="w-full py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-500">Save Changes</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
