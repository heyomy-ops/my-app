import React from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// --- Helper & Utility Functions ---

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Use Project ID for the app identifier
const appId = firebaseConfig.projectId;


// --- SVG Icon Components ---
const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const RefreshCwIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);
const FireIcon = ({ lit }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
        className={`lucide lucide-flame transition-colors duration-500 ${lit ? 'text-orange-500 fill-current' : 'text-slate-500'}`}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
);
const LogOutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);


// --- Child Components ---

const AuthScreen = () => {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-500 tracking-tight">NutriScan AI</h1>
                    <p className="text-slate-400 mt-2">Your personal AI-powered nutrition coach.</p>
                </div>
                <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">{isLogin ? 'Log In' : 'Sign Up'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-400 block mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none text-slate-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-400 block mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none text-slate-200"
                                required
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full p-4 bg-blue-600 text-white rounded-lg text-lg font-bold hover:bg-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-600"
                        >
                            {isLoading ? 'Processing...' : isLogin ? 'Log In' : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-slate-400 mt-6">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-blue-400 hover:underline ml-1">
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const OnboardingSurvey = ({ onComplete }) => {
    const [step, setStep] = React.useState(0);
    const [surveyData, setSurveyData] = React.useState({
        goal: 'lose',
        gender: 'male',
        age: 25,
        weight: 70,
        height: 175,
        activityLevel: 'sedentary',
        targetWeight: 65,
    });
    
    const totalSteps = 7;

    const handleNext = () => setStep(s => Math.min(s + 1, totalSteps - 1));
    const handleBack = () => setStep(s => Math.max(s - 1, 0));
    const handleDataChange = (key, value) => setSurveyData(prev => ({ ...prev, [key]: value }));

    const calculateBMR = (data) => {
        const { gender, weight, height, age } = data;
        if (gender === 'male') return 10 * weight + 6.25 * height - 5 * age + 5;
        return 10 * weight + 6.25 * height - 5 * age - 161;
    };
    
    const calculateMaintenanceCalories = (data) => {
        const bmr = calculateBMR(data);
        const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
        return Math.round(bmr * activityMultipliers[data.activityLevel]);
    };
    
    const calculateFinalGoal = (data) => {
        const maintenance = calculateMaintenanceCalories(data);
        switch (data.goal) {
            case 'lose': return Math.round((maintenance - 500) / 10) * 10;
            case 'gain': return Math.round((maintenance + 300) / 10) * 10;
            default: return Math.round(maintenance / 10) * 10;
        }
    };
    
    const handleFinish = () => {
        onComplete({ 
            goal: calculateFinalGoal(surveyData), 
            maintenance: calculateMaintenanceCalories(surveyData),
            initialSurvey: surveyData
        });
    };

    const renderStep = () => {
        switch (step) {
            case 0: // Goal
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">What's your primary goal?</h2>
                        <div className="space-y-3">
                            {['lose', 'maintain', 'gain'].map(g => (
                                <button key={g} onClick={() => { handleDataChange('goal', g); handleNext(); }} className={`w-full p-4 rounded-lg text-lg font-semibold transition-colors ${surveyData.goal === g ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {g.charAt(0).toUpperCase() + g.slice(1)} Weight
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 1: // Gender
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">Which one are you?</h2>
                        <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => { handleDataChange('gender', 'male'); handleNext(); }} className={`p-4 rounded-lg text-lg font-semibold transition-colors ${surveyData.gender === 'male' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Male</button>
                             <button onClick={() => { handleDataChange('gender', 'female'); handleNext(); }} className={`p-4 rounded-lg text-lg font-semibold transition-colors ${surveyData.gender === 'female' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Female</button>
                        </div>
                    </div>
                );
            case 2: // Age, Weight, Height
                return (
                     <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>
                        <div>
                            <label className="block text-lg font-semibold">Age</label>
                            <input type="number" value={surveyData.age} onChange={e => handleDataChange('age', parseInt(e.target.value) || 0)} className="w-full mt-1 p-3 text-center text-xl bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none"/>
                        </div>
                         <div>
                            <label className="block text-lg font-semibold">Weight (kg)</label>
                            <input type="number" value={surveyData.weight} onChange={e => handleDataChange('weight', parseInt(e.target.value) || 0)} className="w-full mt-1 p-3 text-center text-xl bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none"/>
                        </div>
                         <div>
                            <label className="block text-lg font-semibold">Height (cm)</label>
                            <input type="number" value={surveyData.height} onChange={e => handleDataChange('height', parseInt(e.target.value) || 0)} className="w-full mt-1 p-3 text-center text-xl bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none"/>
                        </div>
                    </div>
                );
            case 3: // Target Weight
                 return (
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold mb-6">What's your target weight?</h2>
                        <div>
                            <label className="block text-lg font-semibold">Target Weight (kg)</label>
                            <input
                                type="number"
                                value={surveyData.targetWeight}
                                onChange={e => handleDataChange('targetWeight', parseInt(e.target.value) || 0)}
                                className="w-full mt-1 p-3 text-center text-xl bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                            />
                        </div>
                        <p className="text-sm text-slate-400 pt-2">
                            Current weight: {surveyData.weight} kg.
                        </p>
                    </div>
                );
            case 4: // Activity Level
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">How active are you?</h2>
                        <div className="space-y-3">
                             {[{id: 'sedentary', label: 'Sedentary (little or no exercise)'}, {id: 'light', label:'Light (exercise 1-3 days/week)'}, {id: 'moderate', label: 'Moderate (exercise 3-5 days/week)'}, {id: 'active', label: 'Active (exercise 6-7 days/week)'}].map(level => (
                                <button key={level.id} onClick={() => { handleDataChange('activityLevel', level.id); handleNext(); }} className={`w-full p-4 rounded-lg text-lg font-semibold transition-colors text-left ${surveyData.activityLevel === level.id ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 5: // Summary & Projection
                const goal = calculateFinalGoal(surveyData);
                const maintenance = calculateMaintenanceCalories(surveyData);
                const dailyDelta = goal - maintenance;
                const weightToChange = surveyData.weight - surveyData.targetWeight;
                const daysToGoal = Math.abs(Math.round((weightToChange * 7700) / dailyDelta));
                const weeksToGoal = Math.round(daysToGoal / 7);

                const weightChangePerDay = dailyDelta / 7700; // in kg

                const projections = [
                    { label: 'Now', weight: parseFloat(surveyData.weight) },
                    { label: '1 Month', weight: parseFloat(surveyData.weight) + (weightChangePerDay * 30) },
                    { label: '2 Months', weight: parseFloat(surveyData.weight) + (weightChangePerDay * 60) },
                    { label: '3 Months', weight: parseFloat(surveyData.weight) + (weightChangePerDay * 90) },
                ];
                
                return (
                     <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Your Personal Plan</h2>
                        <div className="bg-blue-900/50 p-4 rounded-xl mb-6">
                            <p className="text-lg">Recommended Daily Intake:</p>
                            <span className="text-4xl font-extrabold text-blue-400">{goal}</span>
                            <span className="text-xl text-slate-300"> kcal</span>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-4">Your Projected Journey</h3>
                        {isFinite(weeksToGoal) && weeksToGoal > 0 ? (
                             <p className="text-md text-slate-300 mb-6">
                                You could reach your goal of <strong>{surveyData.targetWeight} kg</strong> in approximately <strong>{weeksToGoal} weeks</strong>.
                            </p>
                        ) : (
                            <p className="text-md text-slate-300 mb-6">
                                You've set a maintenance goal. Stick to this calorie target to keep your current weight.
                            </p>
                        )}

                        <div className="w-full">
                            <div className="relative h-1 bg-slate-700 rounded-full">
                                <div className="absolute w-full -top-2.5 flex justify-between">
                                    {projections.map((p, i) => (
                                         <div key={i} className="w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-800 transform -translate-x-1/2"></div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between mt-4 text-sm font-semibold">
                                {projections.map((p, i) => (
                                    <div key={i} className="text-center w-1/4">
                                        <p>{p.label}</p>
                                        <p className="text-blue-400">{p.weight.toFixed(1)} kg</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
             case 6: // Final Confirmation
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">Ready to Start?</h2>
                        <p className="text-lg mb-8">Let's begin your journey to a healthier you!</p>
                        <button onClick={handleFinish} className="w-full p-4 bg-blue-600 text-white rounded-lg text-xl font-bold hover:bg-blue-500 transition-transform transform hover:scale-105">
                            Let's Go!
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 text-slate-200 rounded-2xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden">
                <div className="p-2">
                    <div className="flex items-center gap-2 mb-4">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className="flex-1 h-1 rounded-full bg-slate-700">
                                <div
                                    className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                                    style={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 min-h-[450px] flex flex-col justify-center">
                    {renderStep()}
                </div>
                
                <div className="p-4 flex justify-between items-center">
                     <button onClick={handleBack} disabled={step === 0} className="px-6 py-2 rounded-lg font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
                     {step < totalSteps - 1 && <button onClick={handleNext} className="px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-500">Next</button>}
                </div>
            </div>
        </div>
    );
};

const MonthlyCheckInModal = ({ isOpen, onClose, onUpdate, surveyHistory }) => {
    const [newWeight, setNewWeight] = React.useState(surveyHistory?.data?.weight || 0);
    const [recalculated, setRecalculated] = React.useState(null);
    
    React.useEffect(() => {
        if (surveyHistory?.data?.weight) {
            setNewWeight(surveyHistory.data.weight);
        }
    }, [surveyHistory]);

    if (!isOpen) return null;

    const calculatePredictedWeight = () => {
        const { data } = surveyHistory;
        const maintenance = calculateMaintenanceCalories(data);
        const goal = calculateFinalGoal(data);
        const dailyDelta = goal - maintenance;
        const weightChangePerDay = dailyDelta / 7700;
        return (data.weight + (weightChangePerDay * 30)).toFixed(1);
    };

    const handleRecalculate = () => {
        const updatedSurveyData = { ...surveyHistory.data, weight: newWeight };
        const newMaintenance = calculateMaintenanceCalories(updatedSurveyData);
        const newGoal = calculateFinalGoal(updatedSurveyData);
        setRecalculated({ goal: newGoal, maintenance: newMaintenance });
    };

    const handleUpdatePlan = () => {
        onUpdate({
            ...recalculated,
            newWeight: newWeight,
        });
        onClose();
    };
    
    const calculateBMR = (data) => {
        const { gender, weight, height, age } = data;
        if (gender === 'male') return 10 * weight + 6.25 * height - 5 * age + 5;
        return 10 * weight + 6.25 * height - 5 * age - 161;
    };
    const calculateMaintenanceCalories = (data) => {
        const bmr = calculateBMR(data);
        const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
        return Math.round(bmr * activityMultipliers[data.activityLevel]);
    };
    const calculateFinalGoal = (data) => {
        const maintenance = calculateMaintenanceCalories(data);
        switch (data.goal) {
            case 'lose': return Math.round((maintenance - 500) / 10) * 10;
            case 'gain': return Math.round((maintenance + 300) / 10) * 10;
            default: return Math.round(maintenance / 10) * 10;
        }
    };

    const predictedWeight = calculatePredictedWeight();

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 text-slate-200 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale">
                <h2 className="text-3xl font-bold text-center text-slate-100 mb-4">Monthly Check-in!</h2>
                <p className="text-center text-slate-400 mb-6">It's been a month! Let's update your plan based on your progress.</p>
                
                <div className="text-center bg-slate-700/50 p-4 rounded-lg mb-6">
                    <p className="text-slate-300">Based on your plan, we predicted you would be around:</p>
                    <p className="text-2xl font-bold text-blue-400">{predictedWeight} kg</p>
                </div>

                <div className="space-y-4">
                    <label className="block text-lg font-semibold text-center">What is your current weight? (kg)</label>
                    <input 
                        type="number"
                        value={newWeight}
                        onChange={e => setNewWeight(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 p-3 text-center text-xl bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                    />
                    <button onClick={handleRecalculate} className="w-full p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors">
                        Recalculate My Goal
                    </button>
                </div>

                {recalculated && (
                    <div className="mt-6 text-center animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4">Your New Recommended Plan</h3>
                        <div className="bg-blue-900/50 p-4 rounded-xl mb-6">
                            <p className="text-lg">New Daily Intake:</p>
                            <span className="text-4xl font-extrabold text-blue-400">{recalculated.goal}</span>
                            <span className="text-xl text-slate-300"> kcal</span>
                        </div>
                        <button onClick={handleUpdatePlan} className="w-full p-4 bg-blue-600 text-white rounded-lg text-xl font-bold hover:bg-blue-500 transition-transform transform hover:scale-105">
                            Update My Plan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const CalorieProgressCircle = ({ totalCalories, dailyGoal, onGoalChange }) => {
    const circumference = 2 * Math.PI * 90;
    const progress = dailyGoal > 0 ? Math.min(totalCalories / dailyGoal, 1) : 0;
    const offset = circumference * (1 - progress);
    
    const handleGoalClick = () => {
        const newGoal = parseInt(prompt("Set your new daily calorie goal:", dailyGoal), 10);
        if (!isNaN(newGoal) && newGoal > 0) onGoalChange(newGoal);
    };

    return (
        <div className="relative flex items-center justify-center w-64 h-64">
            <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="90" strokeWidth="20" className="text-slate-700" fill="transparent" />
                <circle
                    cx="128"
                    cy="128"
                    r="90"
                    strokeWidth="20"
                    className="text-blue-500 transition-all duration-1000 ease-out"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
                <span className="text-5xl font-bold text-slate-100">{totalCalories}</span>
                <span 
                    className="text-lg text-slate-400 hover:text-blue-400 cursor-pointer"
                    onClick={handleGoalClick}
                    title="Click to change goal"
                >
                    / {dailyGoal} kcal
                </span>
            </div>
        </div>
    );
};

const StreakCounter = ({ streakData }) => {
    const [currentStreak, setCurrentStreak] = React.useState(0);

    React.useEffect(() => {
        const today = new Date();
        let streak = 0;
        for (let i = 0; ; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            if (streakData[dateKey]) {
                streak++;
            } else {
                if (i > 0) break;
            }
            if (i > 365 * 5) break;
        }
        setCurrentStreak(streak);
    }, [streakData]);

    const todayCompleted = streakData[new Date().toISOString().split('T')[0]] || false;

    return (
        <div className="flex items-center gap-2">
            <FireIcon lit={todayCompleted} />
            <div className="flex items-center gap-1">
                 <span className="text-2xl font-bold text-slate-200">{currentStreak}</span>
                 <span className="text-sm font-semibold text-slate-400 leading-tight">day<br/>streak</span>
            </div>
        </div>
    );
};

const MealList = ({ meals, onRemove }) => (
    <div className="w-full mt-8 space-y-4">
        <h2 className="text-2xl font-bold text-slate-200">Today's Meals</h2>
        {meals.length === 0 ? (
            <p className="text-center text-slate-400 py-4">No meals logged yet. Add one to get started!</p>
        ) : (
            <ul className="space-y-3">
                {meals.map((meal) => (
                    <li key={meal.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition-colors animate-fade-in-up">
                        <div className="flex items-center space-x-4">
                             {meal.image && <img src={meal.image} alt={meal.name} className="w-16 h-16 object-cover rounded-lg" />}
                            <div>
                                <p className="font-semibold text-slate-100 capitalize">{meal.name}</p>
                                <p className="text-sm text-slate-400">{meal.calories} kcal</p>
                            </div>
                        </div>
                        <button onClick={() => onRemove(meal)} className="p-2 text-slate-500 rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors">
                            <XIcon />
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

const Loader = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg text-slate-300">Analyzing your meal...</p>
    </div>
);

const AddMealModal = ({ isOpen, onClose, onAddMeal }) => {
    const [capturedImage, setCapturedImage] = React.useState(null);
    const [stream, setStream] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [apiResult, setApiResult] = React.useState(null);
    const [editedMeal, setEditedMeal] = React.useState({ name: '', calories: 0 });
    const [error, setError] = React.useState(null);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);

    const stopCamera = React.useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const resetState = React.useCallback(() => {
        stopCamera();
        setCapturedImage(null);
        setIsLoading(false);
        setApiResult(null);
        setError(null);
        setEditedMeal({ name: '', calories: 0 });
    }, [stopCamera]);

    React.useEffect(() => {
        if (isOpen) {
            const startCamera = async () => {
                if (stream) return;
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: 'environment' } 
                    });
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("Could not access camera. Please check permissions.");
                }
            };
            startCamera();
        } else {
            stopCamera();
        }
    }, [isOpen, stream, stopCamera]);


    if (!isOpen) return null;

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleScanMeal = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        const base64Data = dataUrl.split(',')[1];
        stopCamera();
        getCalorieData(base64Data);
    };
    
    const handleRetake = () => {
        setCapturedImage(null);
        setApiResult(null);
        setError(null);
    };


    const getCalorieData = async (base64ImageData) => {
        if (!base64ImageData) {
            setError("No image data to analyze.");
            return;
        }
        setIsLoading(true);
        setError(null);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const userPrompt = `Analyze the food in this image. Identify the primary food item. Return a JSON object with the item's name (as "mealName") and its estimated total calories (as "totalCalories"). Meal name should be a short, descriptive title. For example: "Bowl of Oatmeal with Berries".`;
        const payload = {
            contents: [{ parts: [{ text: userPrompt }, { inlineData: { mimeType: "image/jpeg", data: base64ImageData } }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: { type: "OBJECT", properties: { mealName: { type: "STRING" }, totalCalories: { type: "NUMBER" } }, required: ["mealName", "totalCalories"] }
            }
        };

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody.error?.message || 'Unknown error'}`);
            }
            const result = await response.json();
            const candidate = result.candidates?.[0];
            if (candidate && candidate.content?.parts?.[0]?.text) {
                const parsedJson = JSON.parse(candidate.content.parts[0].text);
                setApiResult(parsedJson);
                setEditedMeal({ name: parsedJson.mealName, calories: parsedJson.totalCalories });
            } else {
                 throw new Error("Unexpected API response format. Could not find valid content.");
            }
        } catch (err) {
            console.error(err);
            setError("Sorry, I couldn't analyze the meal. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddMeal = () => {
        if (editedMeal.name && editedMeal.calories > 0) {
            onAddMeal({
                id: crypto.randomUUID(),
                name: editedMeal.name,
                calories: Number(editedMeal.calories),
                image: capturedImage 
            });
            handleClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 transition-opacity">
            <div className="bg-slate-800 text-slate-200 rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale">
                <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-700 rounded-full transition-colors z-20">
                    <XIcon />
                </button>
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-center text-slate-100">Scan a Meal</h2>
                    <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center relative">
                        {!capturedImage ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" /> : <img src={capturedImage} alt="Captured meal" className="w-full h-full object-cover" />}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>
                    {!apiResult && !isLoading && !capturedImage && <button onClick={handleScanMeal} disabled={!stream} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"><CameraIcon />Scan Meal</button>}
                    {isLoading && <Loader />}
                    {error && !isLoading && <div className="text-center"><p className="text-red-400 font-semibold mb-4">{error}</p><button onClick={handleRetake} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-500 transition-colors flex items-center justify-center gap-2 mx-auto"><RefreshCwIcon />Try Again</button></div>}
                    {apiResult && !isLoading && (
                        <div className="p-6 bg-slate-700 rounded-xl text-center animate-fade-in-up space-y-4">
                            <input type="text" value={editedMeal.name} onChange={(e) => setEditedMeal({...editedMeal, name: e.target.value})} className="w-full p-2 bg-slate-600 border border-slate-500 rounded-lg text-xl font-semibold text-slate-100 capitalize text-center"/>
                            <div className="flex items-center justify-center">
                                <input type="number" value={editedMeal.calories} onChange={(e) => setEditedMeal({...editedMeal, calories: parseInt(e.target.value, 10) || 0})} className="w-32 p-2 bg-slate-600 border border-slate-500 rounded-lg text-4xl font-bold text-blue-400 text-center"/>
                                <span className="text-2xl text-slate-400 ml-2">kcal</span>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handleRetake} className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500 transition-colors flex items-center justify-center gap-2"><RefreshCwIcon />Retake</button>
                                <button onClick={handleAddMeal} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-transform transform hover:scale-105">Add to Diary</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MealInsightCard = ({ insight, isLoading, error, onClear }) => {
     if (!insight && !isLoading && !error) return null;
    return (
        <div className="w-full mt-6 p-6 bg-slate-800 rounded-xl border border-slate-700 animate-fade-in-up relative">
            <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center"><SparklesIcon /><span className="ml-2">Daily Insight</span></h3>
            {isLoading && <div className="flex items-center justify-center space-x-2 py-4"><div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div><p className="text-slate-300">Generating your personalized insight...</p></div>}
            {error && <p className="text-red-400">{error}</p>}
            {insight && !isLoading && <p className="text-slate-300 leading-relaxed">{insight}</p>}
            {(insight || error) && !isLoading && <button onClick={onClear} className="absolute top-4 right-4 p-1 text-slate-500 hover:bg-slate-700 rounded-full"><XIcon /></button>}
        </div>
    );
};

const Toast = ({ message }) => {
    if (!message) return null;
    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-100 text-slate-900 font-semibold px-6 py-3 rounded-full shadow-lg animate-fade-in-up">
            {message}
        </div>
    );
};

const FirebaseLoadingScreen = () => (
     <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center text-slate-300">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-2xl font-bold text-blue-500">Connecting...</h1>
    </div>
);


// --- Main App Component ---
export default function App() {
    const getTodaysDateKey = () => new Date().toISOString().split('T')[0];
    
    // Firebase and Auth state
    const [user, setUser] = React.useState(null);
    const [isFirebaseReady, setIsFirebaseReady] = React.useState(false);

    // App Data State (synced with Firestore)
    const [surveyHistory, setSurveyHistory] = React.useState(null);
    const [dailyGoal, setDailyGoal] = React.useState(2200);
    const [maintenanceCalories, setMaintenanceCalories] = React.useState(2000);
    const [meals, setMeals] = React.useState([]);
    const [streakData, setStreakData] = React.useState({});
    
    // UI State
    const [isAddMealModalOpen, setIsAddMealModalOpen] = React.useState(false);
    const [isCheckInModalOpen, setIsCheckInModalOpen] = React.useState(false);
    const [insight, setInsight] = React.useState(null);
    const [isInsightLoading, setIsInsightLoading] = React.useState(false);
    const [insightError, setInsightError] = React.useState(null);
    const [toastMessage, setToastMessage] = React.useState('');
    
    const totalCalories = React.useMemo(() => meals.reduce((sum, meal) => sum + meal.calories, 0), [meals]);
    const prevTotalCalories = React.useRef(totalCalories);

    // --- Firebase Auth & Data Sync Effects ---
    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsFirebaseReady(true);
        });
        return () => unsubscribe();
    }, []);
    
    React.useEffect(() => {
        if (!user) return;
        const userId = user.uid;
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile`, 'settings');
        const unsubscribeProfile = onSnapshot(userProfileRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSurveyHistory(data.surveyHistory || null);
                setDailyGoal(data.dailyGoal || 2200);
                setMaintenanceCalories(data.maintenanceCalories || 2000);
                setStreakData(data.streakData || {});
            } else {
                setSurveyHistory(null);
            }
        });
        
        const todayKey = getTodaysDateKey();
        const mealsRef = doc(db, `artifacts/${appId}/users/${userId}/dailyMeals`, todayKey);
        const unsubscribeMeals = onSnapshot(mealsRef, (docSnap) => {
            setMeals(docSnap.exists() ? docSnap.data().meals || [] : []);
        });

        return () => {
            unsubscribeProfile();
            unsubscribeMeals();
        };

    }, [user]);

    const handleSurveyComplete = async ({ goal, maintenance, initialSurvey }) => {
        if (!user) return;
        const todayKey = getTodaysDateKey();
        const surveyPayload = { startDate: todayKey, data: initialSurvey, lastCheckIn: todayKey };
        const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile`, 'settings');
        await setDoc(userProfileRef, {
            dailyGoal: goal,
            maintenanceCalories: maintenance,
            surveyHistory: surveyPayload,
            streakData: {},
        }, { merge: true });
    };
    
    const handleCheckInUpdate = async ({ goal, maintenance, newWeight }) => {
        if (!user || !surveyHistory) return;
        const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile`, 'settings');
        const updatedHistory = {
            ...surveyHistory,
            data: { ...surveyHistory.data, weight: newWeight },
            lastCheckIn: getTodaysDateKey(),
        };
        await updateDoc(userProfileRef, {
            dailyGoal: goal,
            maintenanceCalories: maintenance,
            surveyHistory: updatedHistory,
        });
    };

    const addMeal = async (newMeal) => {
        if (!user) return;
        const todayKey = getTodaysDateKey();
        const mealsRef = doc(db, `artifacts/${appId}/users/${user.uid}/dailyMeals`, todayKey);
        await setDoc(mealsRef, { meals: arrayUnion(newMeal) }, { merge: true });
    };

    const removeMeal = async (mealToRemove) => {
        if (!user) return;
        const todayKey = getTodaysDateKey();
        const mealsRef = doc(db, `artifacts/${appId}/users/${user.uid}/dailyMeals`, todayKey);
        await updateDoc(mealsRef, { meals: arrayRemove(mealToRemove) });
    };

    const handleGoalChange = async (newGoal) => {
         if (!user) return;
         const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile`, 'settings');
         await updateDoc(userProfileRef, { dailyGoal: newGoal });
    };
    
    const updateStreakData = async () => {
        if (!user) return;
        const todayKey = getTodaysDateKey();
        const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile`, 'settings');
        await updateDoc(userProfileRef, { [`streakData.${todayKey}`]: true });
    }

    React.useEffect(() => {
        if (!isFirebaseReady || !user) return;
        const todayKey = getTodaysDateKey();
        const hasHitMaintenanceToday = streakData[todayKey] || false;

        if (prevTotalCalories.current < dailyGoal && totalCalories >= dailyGoal && dailyGoal > 0) {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js";
            script.onload = () => window.confetti && window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            document.body.appendChild(script);
            setTimeout(() => document.body.contains(script) && document.body.removeChild(script), 4000);
        }

        if (totalCalories >= maintenanceCalories && !hasHitMaintenanceToday) {
            navigator.vibrate && navigator.vibrate(200);
            updateStreakData();

            if (dailyGoal > totalCalories) {
                const remaining = dailyGoal - totalCalories;
                setToastMessage(`Maintenance hit! Just ${remaining} kcal more to go!`);
            } else {
                setToastMessage(`Daily goal achieved! Great job!`);
            }
            setTimeout(() => setToastMessage(''), 5000);
        }

        prevTotalCalories.current = totalCalories;
    }, [totalCalories, dailyGoal, maintenanceCalories, streakData, isFirebaseReady, user]);

     React.useEffect(() => {
        if (surveyHistory && isFirebaseReady) {
            const today = new Date();
            const lastCheckInDate = new Date(surveyHistory.lastCheckIn);
            const diffTime = Math.abs(today - lastCheckInDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 30) setIsCheckInModalOpen(true);
        }
    }, [surveyHistory, isFirebaseReady]);
    
    const getMealInsights = async () => {
        if (!meals || meals.length === 0) return;
        setIsInsightLoading(true); setInsight(null); setInsightError(null);
        const mealSummary = meals.map(m => `- ${m.name} (~${m.calories} kcal)`).join('\n');
        const userPrompt = `Based on the following list of meals I ate today, provide a brief, one-paragraph nutritional analysis. Offer one positive insight and one simple, actionable suggestion for a healthier choice tomorrow. Keep the tone encouraging and friendly, like a helpful nutrition coach. Do not use markdown.\n\nHere are my meals:\n${mealSummary}\n\nMy daily calorie goal is ${dailyGoal} kcal.`;
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: userPrompt }] }] };

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error("Failed to get a response from the AI.");
            const result = await response.json();
            const candidate = result.candidates?.[0];
            if (candidate && candidate.content?.parts?.[0]?.text) {
                setInsight(candidate.content.parts[0].text);
            } else {
                throw new Error("The AI response was empty or in an unexpected format.");
            }
        } catch (err) {
            console.error("Insight API error:", err);
            setInsightError("Sorry, I couldn't generate an insight right now. Please try again later.");
        } finally {
            setIsInsightLoading(false);
        }
    };
    const clearInsight = () => { setInsight(null); setInsightError(null); };
    
    const handleLogout = () => {
        signOut(auth);
    }

    if (!isFirebaseReady) return <FirebaseLoadingScreen />;
    if (!user) return <AuthScreen />;
    if (!surveyHistory) return <OnboardingSurvey onComplete={handleSurveyComplete} />;

    return (
        <div className="bg-slate-900 min-h-screen font-sans text-slate-300">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                body { font-family: 'Inter', sans-serif; background-color: #0F172A; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #1E293B; }
                ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #475569; }
                @keyframes fade-in-scale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
                .animate-pulse { animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse {
                    50% { opacity: .5; }
                }
            `}</style>
            <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-blue-500 tracking-tight">NutriScan AI</h1>
                    <div className="flex items-center gap-6">
                        <StreakCounter streakData={streakData} />
                        <button onClick={handleLogout} title="Log Out" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                            <LogOutIcon />
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 flex flex-col items-center max-w-2xl">
                <CalorieProgressCircle totalCalories={totalCalories} dailyGoal={dailyGoal} onGoalChange={handleGoalChange} />
                <div className="text-center mt-4 text-slate-400">
                    Your maintenance level is <strong>{maintenanceCalories} kcal</strong>
                </div>
                {meals.length > 0 && !isInsightLoading && !insight && !insightError && (
                    <div className="text-center mt-6 animate-fade-in-up">
                        <button onClick={debounce(getMealInsights, 500)} disabled={isInsightLoading} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center mx-auto shadow-lg shadow-indigo-900/50 hover:shadow-xl"><SparklesIcon /><span className="ml-2">✨ Get Meal Insights</span></button>
                    </div>
                )}
                <MealInsightCard insight={insight} isLoading={isInsightLoading} error={insightError} onClear={clearInsight} />
                <MealList meals={meals} onRemove={removeMeal} />
            </main>
            <button onClick={() => setIsAddMealModalOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-900/50 flex items-center justify-center hover:bg-blue-500 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400/50" aria-label="Add new meal"><PlusIcon /></button>
            <AddMealModal isOpen={isAddMealModalOpen} onClose={() => setIsAddMealModalOpen(false)} onAddMeal={addMeal} />
            {surveyHistory && (
                 <MonthlyCheckInModal 
                    isOpen={isCheckInModalOpen}
                    onClose={() => setIsCheckInModalOpen(false)}
                    onUpdate={handleCheckInUpdate}
                    surveyHistory={surveyHistory}
                />
            )}
            <Toast message={toastMessage} />
        </div>
    );
}

