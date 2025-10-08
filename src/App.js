import React from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';

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
    apiKey: "AIzaSyAaXMw0-E9cE9mwVYJYKBSRZhPNoblDtU4",
    authDomain: "wgain-d5ab1.firebaseapp.com",
    projectId: "wgain-d5ab1",
    storageBucket: "wgain-d5ab1.appspot.com",
    messagingSenderId: "1060562581519",
    appId: "1:1060562581519:web:211a5a08d6501802688b7a",
    measurementId: "G-Y4RQ7DDRXC"
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
        className={`lucide lucide-flame transition-colors duration-500 ${lit ? 'text-orange-500 fill-orange-500' : 'text-slate-400 dark:text-slate-600'}`}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
);
const LogOutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);
const UnfoldVerticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-unfold-vertical"><path d="M12 22v-6"/><path d="m15 19-3 3-3-3"/><path d="M12 2v6"/><path d="m15 5-3-3-3 3"/></svg>
);
const WaterDropIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-droplet"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
);
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);
const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);


// --- Child Components ---
const NumberScroller = ({ value, onChange, min, max }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStartY = React.useRef(0);
    const startValue = React.useRef(0);
    const sensitivity = 20; // smaller is more sensitive

    const handleValueChange = (newValue) => {
        const clampedValue = Math.max(min, Math.min(max, Math.round(newValue)));
        if (clampedValue !== value) {
            onChange(clampedValue);
        }
    };

    const handleDragStart = (clientY) => {
        dragStartY.current = clientY;
        startValue.current = value;
        setIsDragging(true);
    };

    const handleDragMove = (clientY) => {
        if (!isDragging) return;
        const deltaY = clientY - dragStartY.current;
        const valueChange = -deltaY / sensitivity;
        const newValue = startValue.current + valueChange;
        handleValueChange(newValue);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // Touch events
    const handleTouchStart = (e) => handleDragStart(e.touches[0].clientY);
    const handleTouchMove = (e) => handleDragMove(e.touches[0].clientY);
    const handleTouchEnd = () => handleDragEnd();

    // Mouse events
    const handleMouseDown = (e) => {
        handleDragStart(e.clientY);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };
    const handleMouseMove = (e) => handleDragMove(e.clientY);
    const handleMouseUp = () => {
        handleDragEnd();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    // Wheel event
    const handleWheel = (e) => {
        e.preventDefault();
        const change = e.deltaY < 0 ? 1 : -1;
        handleValueChange(value + change);
    };

    return (
        <div
            className="h-24 w-full relative flex flex-col items-center justify-center cursor-ns-resize select-none bg-slate-200 dark:bg-slate-700 rounded-lg p-2"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
        >
            <div className={`transition-transform duration-100 ${isDragging ? 'scale-110' : 'scale-100'}`}>
                <div className="text-5xl font-bold text-slate-800 dark:text-slate-100 text-center">
                    {Math.round(value)}
                </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-2 text-slate-500 dark:text-slate-500 opacity-70">
                <UnfoldVerticalIcon />
            </div>
        </div>
    );
};


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
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-500 tracking-tight">NutriScan AI</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Your personal AI-powered nutrition coach.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-6">{isLogin ? 'Log In' : 'Sign Up'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full p-4 bg-blue-600 text-white rounded-lg text-lg font-bold hover:bg-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                        >
                            {isLoading ? 'Processing...' : isLogin ? 'Log In' : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-blue-500 dark:text-blue-400 hover:underline ml-1">
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const RulerScroller = ({ value, onChange, min, max, orientation = 'horizontal' }) => {
    const scrollerRef = React.useRef(null);
    const isInteracting = React.useRef(false);
    const startPos = React.useRef(0);
    const startScroll = React.useRef(0);

    const isHorizontal = orientation === 'horizontal';
    const TICK_SPACING = 12;
    const PRECISION = 10;

    const valueToScroll = React.useCallback((val) => (val - min) * PRECISION * TICK_SPACING, [min]);
    const scrollToValue = React.useCallback((scrollPos) => {
        const rawValue = min + scrollPos / (PRECISION * TICK_SPACING);
        const rounded = Math.round(rawValue * PRECISION) / PRECISION;
        return Math.max(min, Math.min(max, rounded));
    }, [min, max]);
    
    React.useEffect(() => {
        const element = scrollerRef.current;
        if (element && !isInteracting.current) {
            const targetScroll = valueToScroll(value);
            element.scrollTo(isHorizontal ? { left: targetScroll, behavior: 'smooth' } : { top: targetScroll, behavior: 'smooth' });
        }
    }, [value, isHorizontal, valueToScroll]);

    const handleInteractionStart = (e) => {
        isInteracting.current = true;
        scrollerRef.current.style.scrollBehavior = 'auto';
        const pos = isHorizontal ? (e.clientX || e.touches[0].clientX) : (e.clientY || e.touches[0].clientY);
        startPos.current = pos;
        startScroll.current = isHorizontal ? scrollerRef.current.scrollLeft : scrollerRef.current.scrollTop;
        
        const moveEvent = e.type === 'mousedown' ? 'mousemove' : 'touchmove';
        const endEvent = e.type === 'mousedown' ? 'mouseup' : 'touchend';

        const handleInteractionMove = (moveEvent) => {
            if (!isInteracting.current) return;
            moveEvent.preventDefault();
            const pos = isHorizontal ? (moveEvent.clientX || moveEvent.touches[0].clientX) : (moveEvent.clientY || moveEvent.touches[0].clientY);
            const delta = pos - startPos.current;
            const newScroll = startScroll.current - delta;
            
            const newValue = scrollToValue(newScroll);
            onChange(newValue);

            scrollerRef.current.scrollTo(isHorizontal ? { left: newScroll } : { top: newScroll });
        };

        const handleInteractionEnd = () => {
            isInteracting.current = false;
            scrollerRef.current.style.scrollBehavior = 'smooth';
            window.removeEventListener(moveEvent, handleInteractionMove);
            window.removeEventListener(endEvent, handleInteractionEnd);
            const finalScroll = isHorizontal ? scrollerRef.current.scrollLeft : scrollerRef.current.scrollTop;
            const finalValue = scrollToValue(finalScroll);
            onChange(finalValue); // Final snap
        };

        window.addEventListener(moveEvent, handleInteractionMove, { passive: false });
        window.addEventListener(endEvent, handleInteractionEnd);
    };
    
    const Ticks = React.useMemo(() => {
        const tickCount = (max - min) * PRECISION + 1;
        return Array.from({ length: tickCount }).map((_, i) => {
            const tickValue = min + i / PRECISION;
            const isMajorTick = i % 10 === 0;
            const isHalfTick = i % 5 === 0;
            
            if (isHorizontal) {
                return (
                    <div key={i} className="flex flex-col items-center justify-end flex-shrink-0" style={{ width: TICK_SPACING }}>
                        <div className={`bg-slate-300 dark:bg-slate-600 ${isMajorTick ? 'h-6 w-0.5' : isHalfTick ? 'h-4 w-px' : 'h-3 w-px'}`} />
                        {isMajorTick && <span className="text-xs mt-1 text-slate-500">{tickValue}</span>}
                    </div>
                );
            } else {
                return (
                     <div key={i} className="flex items-center justify-end flex-shrink-0" style={{ height: TICK_SPACING }}>
                        {isMajorTick && <span className="text-xs mr-2 text-slate-500">{tickValue}</span>}
                        <div className={`bg-slate-300 dark:bg-slate-600 ${isMajorTick ? 'w-6 h-0.5' : isHalfTick ? 'w-4 h-px' : 'w-3 h-px'}`} />
                    </div>
                )
            }
        });
    }, [min, max, isHorizontal]);

    return (
        <div className={`relative w-full h-full overflow-hidden`}>
            <div
                ref={scrollerRef}
                onMouseDown={handleInteractionStart}
                onTouchStart={handleInteractionStart}
                className={`scrollbar-hide cursor-grab active:cursor-grabbing w-full h-full ${isHorizontal ? 'flex items-end overflow-x-scroll' : 'flex flex-col items-end overflow-y-scroll'}`}
            >
                <div className={isHorizontal ? 'w-1/2 flex-shrink-0' : 'h-1/2 flex-shrink-0'} />
                {Ticks}
                <div className={isHorizontal ? 'w-1/2 flex-shrink-0' : 'h-1/2 flex-shrink-0'} />
            </div>
            <div className={`absolute bg-blue-500 z-10 rounded-full ${isHorizontal ? 'bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-10' : 'top-1/2 -translate-y-1/2 right-0 w-10 h-0.5'}`} />
        </div>
    );
};


const OnboardingSurvey = ({ onComplete }) => {
    const [step, setStep] = React.useState(0);
    const [surveyData, setSurveyData] = React.useState({
        name: '',
        goal: 'lose',
        gender: 'male',
        age: 25,
        weight: 70,
        height: 175,
        activityLevel: 'sedentary',
        targetWeight: 65,
    });
    const [heightUnit, setHeightUnit] = React.useState('cm');

    const totalSteps = 8;

    const handleNext = () => setStep(s => Math.min(s + 1, totalSteps - 1));
    const handleBack = () => setStep(s => Math.max(s - 1, 0));
    const handleDataChange = (key, value) => setSurveyData(prev => ({ ...prev, [key]: value }));
    
    // --- Unit Conversion Helpers ---
    const cmToFeetInches = (cm) => {
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return { feet, inches };
    };
    
    const displayHeight = () => {
        if (heightUnit === 'cm') {
            return `${surveyData.height.toFixed(1)} cm`;
        }
        const { feet, inches } = cmToFeetInches(surveyData.height);
        return `${feet}' ${inches}"`;
    };

    const calculateBMR = (data) => {
        const { gender, weight, height, age } = data;
        if (gender === 'male') return 10 * weight + 6.25 * height - 5 * age + 5;
        return 10 * weight + 6.25 * height - 5 * age - 161;
    };

    const calculateProteinGoal = (data) => {
        const { weight, activityLevel } = data;
        const multipliers = { sedentary: 0.8, light: 1.2, moderate: 1.4, active: 1.6 };
        return Math.round((weight * multipliers[activityLevel]) / 5) * 5;
    };
    
    const calculateWaterGoal = (data) => {
        const { weight, activityLevel } = data;
        let baseIntake = weight * 35;
        const activityBonus = { sedentary: 0, light: 300, moderate: 600, active: 900 };
        const totalIntake = baseIntake + activityBonus[activityLevel];
        return Math.round(totalIntake / 50) * 50;
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
            name: surveyData.name,
            goal: calculateFinalGoal(surveyData),
            maintenance: calculateMaintenanceCalories(surveyData),
            proteinGoal: calculateProteinGoal(surveyData),
            waterGoal: calculateWaterGoal(surveyData),
            initialSurvey: surveyData
        });
    };

    const renderStep = () => {
        switch (step) {
            case 0: // Name
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">What should we call you?</h2>
                        <input 
                            type="text" 
                            value={surveyData.name} 
                            onChange={e => handleDataChange('name', e.target.value)} 
                            className="w-full mt-1 p-3 text-center text-xl bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                            placeholder="Your Name"
                        />
                    </div>
                );
            case 1: // Goal
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">What's your primary goal, {surveyData.name}?</h2>
                        <div className="space-y-3">
                            {['lose', 'maintain', 'gain'].map(g => (
                                <button key={g} onClick={() => { handleDataChange('goal', g); handleNext(); }} className={`w-full p-4 rounded-lg text-lg font-semibold transition-colors ${surveyData.goal === g ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                    {g.charAt(0).toUpperCase() + g.slice(1)} Weight
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 2: // Gender & Age
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">Tell us a bit about yourself</h2>
                         <div className="mb-8">
                             <label className="block text-lg font-semibold mb-3">Gender</label>
                             <div className="grid grid-cols-2 gap-4">
                                 <button onClick={() => handleDataChange('gender', 'male')} className={`p-4 rounded-lg text-lg font-semibold transition-colors ${surveyData.gender === 'male' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Male</button>
                                 <button onClick={() => handleDataChange('gender', 'female')} className={`p-4 rounded-lg text-lg font-semibold transition-colors ${surveyData.gender === 'female' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Female</button>
                            </div>
                         </div>
                         <div>
                            <label className="block text-lg font-semibold mb-3">Age</label>
                            <input type="number" value={surveyData.age} onChange={e => handleDataChange('age', parseInt(e.target.value) || 0)} className="w-full mt-1 p-3 text-center text-xl bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-blue-500 outline-none"/>
                        </div>
                    </div>
                );
            case 3: // Weight
                return (
                    <div className="text-center w-full">
                        <h2 className="text-2xl font-bold mb-6">What's your current weight?</h2>
                        <p className="text-5xl font-bold text-blue-500 mb-4">{surveyData.weight.toFixed(1)} <span className="text-3xl text-slate-500">kg</span></p>
                        <RulerScroller value={surveyData.weight} onChange={v => handleDataChange('weight', v)} min={30} max={200} />
                    </div>
                );
            case 4: // Height
                return (
                     <div className="text-center w-full h-full flex flex-col">
                        <h2 className="text-2xl font-bold mb-2">What's your height?</h2>
                        <div className="p-1 bg-slate-200 dark:bg-slate-700 rounded-full flex mx-auto mb-4">
                            <button onClick={() => setHeightUnit('cm')} className={`px-4 py-1 rounded-full text-sm font-semibold ${heightUnit === 'cm' ? 'bg-white dark:bg-slate-600' : 'text-slate-500'}`}>cm</button>
                            <button onClick={() => setHeightUnit('ft')} className={`px-4 py-1 rounded-full text-sm font-semibold ${heightUnit === 'ft' ? 'bg-white dark:bg-slate-600' : 'text-slate-500'}`}>ft</button>
                        </div>
                        <div className="flex-grow flex items-center w-full gap-4 min-h-0">
                            <div className="w-40 flex-shrink-0">
                               <p className="text-5xl font-bold text-blue-500 text-center">{displayHeight()}</p>
                            </div>
                            <div className="flex-grow h-full relative">
                                <RulerScroller value={surveyData.height} onChange={v => handleDataChange('height', v)} min={120} max={220} orientation="vertical" />
                            </div>
                        </div>
                    </div>
                );
            case 5: // Target Weight
                 return (
                    <div className="text-center w-full">
                        <h2 className="text-2xl font-bold mb-6">What's your target weight?</h2>
                        <p className="text-5xl font-bold text-blue-500 mb-4">{surveyData.targetWeight.toFixed(1)} <span className="text-3xl text-slate-500">kg</span></p>
                        <RulerScroller value={surveyData.targetWeight} onChange={v => handleDataChange('targetWeight', v)} min={30} max={200} />
                    </div>
                );
            case 6: // Activity Level
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">How active are you?</h2>
                        <div className="space-y-3">
                             {[{id: 'sedentary', label: 'Sedentary'}, {id: 'light', label:'Lightly Active'}, {id: 'moderate', label: 'Moderately Active'}, {id: 'active', label: 'Very Active'}].map(level => (
                                <button key={level.id} onClick={() => { handleDataChange('activityLevel', level.id); handleNext(); }} className={`w-full p-4 rounded-lg text-lg font-semibold transition-colors text-center ${surveyData.activityLevel === level.id ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 7: // Final Confirmation
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
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-2xl w-full max-w-md h-[90vh] mx-auto relative flex flex-col">
                <div className="p-4">
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700">
                                <div
                                    className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                                    style={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 flex-grow flex flex-col items-center justify-center overflow-hidden">
                    {renderStep()}
                </div>

                <div className="p-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
                     <button onClick={handleBack} disabled={step === 0} className="px-6 py-2 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
                     <button onClick={handleNext} disabled={(step === 0 && !surveyData.name)} className="px-8 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600">Next</button>
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
        const newProteinGoal = calculateProteinGoal(updatedSurveyData);
        const newWaterGoal = calculateWaterGoal(updatedSurveyData);
        setRecalculated({ goal: newGoal, maintenance: newMaintenance, proteinGoal: newProteinGoal, waterGoal: newWaterGoal });
    };

    const handleUpdatePlan = () => {
        onUpdate({
            ...recalculated,
            newWeight: newWeight,
        });
        onClose();
    };

    const calculateProteinGoal = (data) => {
        const { weight, activityLevel } = data;
        const multipliers = {
            sedentary: 0.8,
            light: 1.2,
            moderate: 1.4,
            active: 1.6
        };
        const protein = Math.round((weight * multipliers[activityLevel]) / 5) * 5;
        return protein;
    };
    
    const calculateWaterGoal = (data) => {
        const { weight, activityLevel } = data;
        let baseIntake = weight * 35;
        const activityBonus = { sedentary: 0, light: 300, moderate: 600, active: 900 };
        const totalIntake = baseIntake + activityBonus[activityLevel];
        return Math.round(totalIntake / 50) * 50;
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
            <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale">
                <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100 mb-4">Monthly Check-in!</h2>
                <p className="text-center text-slate-600 dark:text-slate-400 mb-6">It's been a month! Let's update your plan based on your progress.</p>

                <div className="text-center bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg mb-6">
                    <p className="text-slate-600 dark:text-slate-300">Based on your plan, we predicted you would be around:</p>
                    <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">{predictedWeight} kg</p>
                </div>

                <div className="space-y-4">
                    <label className="block text-lg font-semibold text-center">What is your current weight? (kg)</label>
                    <input
                        type="number"
                        value={newWeight}
                        onChange={e => setNewWeight(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 p-3 text-center text-xl bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                    />
                    <button onClick={handleRecalculate} className="w-full p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors">
                        Recalculate My Goal
                    </button>
                </div>

                {recalculated && (
                    <div className="mt-6 text-center animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4">Your New Recommended Plan</h3>
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-xl mb-6">
                            <p className="text-lg">New Daily Intake:</p>
                            <span className="text-4xl font-extrabold text-blue-500 dark:text-blue-400">{recalculated.goal}</span>
                            <span className="text-xl text-slate-600 dark:text-slate-300"> kcal</span>
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


const NutritionDashboard = ({ totalCalories, dailyGoal, onGoalChange, totalProtein, dailyProteinGoal, onProteinGoalChange, todaysWaterIntake, dailyWaterGoal, onAddWater }) => {
    const calorieProgress = dailyGoal > 0 ? Math.min((totalCalories / dailyGoal) * 100, 100) : 0;
    const proteinProgress = dailyProteinGoal > 0 ? Math.min((totalProtein / dailyProteinGoal) * 100, 100) : 0;
    const waterProgress = dailyWaterGoal > 0 ? Math.min((todaysWaterIntake / dailyWaterGoal) * 100, 100) : 0;
    
    return (
        <div className="w-full bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calorie Section */}
                <div className="flex flex-col">
                   <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Calories</h3>
                   <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{totalCalories}</span>
                       <span
                           className="text-lg text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                           onClick={onGoalChange}
                           title="Click to change goal"
                       >
                           / {dailyGoal} kcal
                       </span>
                   </div>
                   <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-3">
                       <div
                           className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                           style={{ width: `${calorieProgress}%` }}
                       ></div>
                   </div>
                </div>

                {/* Protein Section */}
                <div className="flex flex-col">
                   <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Protein</h3>
                   <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{totalProtein}</span>
                       <span
                           className="text-lg text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 cursor-pointer"
                           onClick={onProteinGoalChange}
                           title="Click to change protein goal"
                       >
                           / {dailyProteinGoal} g
                       </span>
                   </div>
                   <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-3">
                       <div
                           className="bg-sky-500 h-2.5 rounded-full transition-all duration-500"
                           style={{ width: `${proteinProgress}%` }}
                       ></div>
                   </div>
                </div>
                
                 {/* Water Section */}
                <div className="flex flex-col">
                   <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Water</h3>
                   <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{todaysWaterIntake}</span>
                            <span className="text-lg text-slate-500 dark:text-slate-400">/ {dailyWaterGoal} ml</span>
                        </div>
                        <button onClick={onAddWater} className="bg-blue-100 dark:bg-blue-500/20 text-blue-500 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/40 rounded-full p-2 flex items-center justify-center transition-colors">
                            <PlusIcon />
                        </button>
                   </div>
                   <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-3">
                       <div
                           className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500"
                           style={{ width: `${waterProgress}%` }}
                       ></div>
                   </div>
                </div>

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
        <div className="flex items-center gap-2 cursor-pointer">
            <FireIcon lit={todayCompleted} />
            <div className="flex items-center gap-1">
                 <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{currentStreak}</span>
                 <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-tight">day<br/>streak</span>
            </div>
        </div>
    );
};

const StreakCalendar = ({ streakData }) => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const week = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        return date;
    });

    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    return (
        <div className="flex justify-around items-center p-4">
            {week.map((date, i) => {
                const dateKey = date.toISOString().split('T')[0];
                const isCompleted = streakData[dateKey] || false;
                const isToday = isSameDay(date, new Date());

                return (
                    <div key={dateKey} className="flex flex-col items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{weekDays[i]}</span>
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500/20' : ''}`}>
                            <FireIcon lit={isCompleted} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const StreakModal = ({ isOpen, onClose, streakData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in-scale">
             <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-2xl w-full max-w-md mx-auto relative">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-4">Weekly Streak</h2>
                    <StreakCalendar streakData={streakData} />
                </div>
                 <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <XIcon />
                </button>
            </div>
        </div>
    );
};

const MealList = ({ meals, onRemove }) => (
    <div className="w-full mt-8 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Today's Meals</h2>
        {meals.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">No meals logged yet. Add one to get started!</p>
        ) : (
            <ul className="space-y-3">
                {meals.map((meal) => (
                    <li key={meal.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors animate-fade-in-up">
                        <div className="flex items-center space-x-4">
                             {meal.image && <img src={meal.image} alt={meal.name} className="w-16 h-16 object-cover rounded-lg" />}
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100 capitalize">{meal.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {meal.calories} kcal
                                    <span className="mx-2 text-slate-400 dark:text-slate-600">|</span>
                                    {meal.protein}g protein</p>
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
        <p className="text-lg text-slate-600 dark:text-slate-300">Analyzing your meal...</p>
    </div>
);

const AddMealModal = ({ isOpen, onClose, onAddMeal }) => {
    const [capturedImage, setCapturedImage] = React.useState(null);
    const [stream, setStream] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [apiResult, setApiResult] = React.useState(null);
    const [editedMeal, setEditedMeal] = React.useState({ name: '', calories: 0, protein: 0, weight: 0 });
    const [nutritionRatios, setNutritionRatios] = React.useState(null); // To store calories/protein per gram
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
        setEditedMeal({ name: '', calories: 0, protein: 0, weight: 0 });
        setNutritionRatios(null);
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
        const apiKey = "AIzaSyAEMGk8n6nSeAU73FL9Y-EQX7heHKrw388";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const userPrompt = `Analyze the food in this image. Identify the primary food item. Return a JSON object with the item's name (as "mealName"), its estimated total calories (as "totalCalories"), its estimated total protein in grams (as "totalProtein"), and its estimated weight in grams (as "estimatedWeight"). Meal name should be a short, descriptive title. For example: "Bowl of Oatmeal with Berries".`;
        const payload = {
            contents: [{ parts: [{ text: userPrompt }, { inlineData: { mimeType: "image/jpeg", data: base64ImageData } }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: { type: "OBJECT", properties: { mealName: { type: "STRING" }, totalCalories: { type: "NUMBER" }, totalProtein: { type: "NUMBER" }, estimatedWeight: { type: "NUMBER"} }, required: ["mealName", "totalCalories", "totalProtein", "estimatedWeight"] }
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
                setEditedMeal({ name: parsedJson.mealName, calories: parsedJson.totalCalories, protein: parsedJson.totalProtein, weight: parsedJson.estimatedWeight });

                if (parsedJson.estimatedWeight > 0) {
                    setNutritionRatios({
                        caloriesPerGram: parsedJson.totalCalories / parsedJson.estimatedWeight,
                        proteinPerGram: parsedJson.totalProtein / parsedJson.estimatedWeight,
                    });
                }

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

    const handleWeightChange = (newWeight) => {
        if (nutritionRatios) {
            setEditedMeal({
                ...editedMeal,
                weight: newWeight,
                calories: newWeight * nutritionRatios.caloriesPerGram,
                protein: newWeight * nutritionRatios.proteinPerGram
            });
        } else {
            setEditedMeal({ ...editedMeal, weight: newWeight });
        }
    };

    const handleManualNutritionChange = (field, value) => {
        setEditedMeal(prev => ({ ...prev, [field]: value }));
        // When user edits calories or protein manually, stop automatic recalculations
        setNutritionRatios(null);
    };

    const handleAddMeal = () => {
        if (editedMeal.name && editedMeal.calories > 0 && editedMeal.protein >= 0) {
            onAddMeal({
                id: crypto.randomUUID(),
                name: editedMeal.name,
                calories: Math.round(Number(editedMeal.calories)),
                protein: Math.round(Number(editedMeal.protein)),
                image: capturedImage
            });
            handleClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-50 transition-opacity animate-fade-in-scale">
            <div className="w-full h-full flex flex-col items-center justify-center">
                <button onClick={handleClose} className="absolute top-6 right-6 p-3 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-20">
                    <XIcon />
                </button>
                <div className="w-full max-w-md space-y-6">
                    <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100">Scan a Meal</h2>
                    <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative border-2 border-slate-300 dark:border-slate-700 shadow-lg">
                        {!capturedImage ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" /> : <img src={capturedImage} alt="Captured meal" className="w-full h-full object-cover" />}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>
                    {!apiResult && !isLoading && !capturedImage && <button onClick={handleScanMeal} disabled={!stream} className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"><CameraIcon />Scan Meal</button>}
                    {isLoading && <Loader />}
                    {error && !isLoading && <div className="text-center"><p className="text-red-500 dark:text-red-400 font-semibold mb-4">{error}</p><button onClick={handleRetake} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-500 transition-colors flex items-center justify-center gap-2 mx-auto"><RefreshCwIcon />Try Again</button></div>}
                    {apiResult && !isLoading && (
                        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center animate-fade-in-up space-y-4">
                            <input type="text" value={editedMeal.name} onChange={(e) => setEditedMeal({...editedMeal, name: e.target.value})} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xl font-semibold text-slate-800 dark:text-slate-100 capitalize text-center"/>
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <div>
                                    <input type="number" value={Math.round(editedMeal.calories)} onChange={(e) => handleManualNutritionChange('calories', parseInt(e.target.value, 10) || 0)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-2xl font-bold text-blue-500 dark:text-blue-400 text-center"/>
                                    <span className="text-sm text-slate-500 dark:text-slate-400 mt-1 block">kcal</span>
                                </div>
                                 <div>
                                    <input type="number" value={Math.round(editedMeal.protein)} onChange={(e) => handleManualNutritionChange('protein', parseInt(e.target.value, 10) || 0)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-2xl font-bold text-sky-500 dark:text-sky-400 text-center"/>
                                    <span className="text-sm text-slate-500 dark:text-slate-400 mt-1 block">protein (g)</span>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <NumberScroller
                                        value={Math.round(editedMeal.weight)}
                                        onChange={handleWeightChange}
                                        min={0}
                                        max={2000}
                                    />
                                    <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">weight (g)</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handleRetake} className="w-full bg-slate-500 dark:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 dark:hover:bg-slate-500 transition-colors flex items-center justify-center gap-2"><RefreshCwIcon />Retake</button>
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
        <div className="w-full mt-6 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in-up relative">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center"><SparklesIcon /><span className="ml-2">Daily Insight</span></h3>
            {isLoading && <div className="flex items-center justify-center space-x-2 py-4"><div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div><p className="text-slate-600 dark:text-slate-300">Generating your personalized insight...</p></div>}
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
            {insight && !isLoading && <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{insight}</p>}
            {(insight || error) && !isLoading && <button onClick={onClear} className="absolute top-4 right-4 p-1 text-slate-500 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><XIcon /></button>}
        </div>
    );
};

const Toast = ({ message }) => {
    if (!message) return null;
    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-100 dark:bg-slate-100 dark:text-slate-900 font-semibold px-6 py-3 rounded-full shadow-lg animate-fade-in-up">
            {message}
        </div>
    );
};

const FirebaseLoadingScreen = () => (
     <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex flex-col items-center justify-center text-slate-600 dark:text-slate-300">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-2xl font-bold text-blue-500">Connecting...</h1>
    </div>
);


// --- Main App Component ---
export default function App() {
    const getTodaysDateKey = () => new Date().toISOString().split('T')[0];

    // Theme state
    const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'dark');
    
    // Firebase and Auth state
    const [user, setUser] = React.useState(null);
    const [isFirebaseReady, setIsFirebaseReady] = React.useState(false);

    // App Data State (synced with Firestore)
    const [userName, setUserName] = React.useState('');
    const [surveyHistory, setSurveyHistory] = React.useState(undefined);
    const [dailyGoal, setDailyGoal] = React.useState(2200);
    const [dailyProteinGoal, setDailyProteinGoal] = React.useState(120);
    const [dailyWaterGoal, setDailyWaterGoal] = React.useState(2500);
    const [maintenanceCalories, setMaintenanceCalories] = React.useState(2000);
    const [meals, setMeals] = React.useState([]);
    const [todaysWaterIntake, setTodaysWaterIntake] = React.useState(0);
    const [streakData, setStreakData] = React.useState({});

    // UI State
    const [isAddMealModalOpen, setIsAddMealModalOpen] = React.useState(false);
    const [isCheckInModalOpen, setIsCheckInModalOpen] = React.useState(false);
    const [isStreakModalOpen, setIsStreakModalOpen] = React.useState(false);
    const [insight, setInsight] = React.useState(null);
    const [isInsightLoading, setIsInsightLoading] = React.useState(false);
    const [insightError, setInsightError] = React.useState(null);
    const [toastMessage, setToastMessage] = React.useState('');

    // --- Theme Management ---
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    React.useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'light') {
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Effect to control body scroll when modals are open
    React.useEffect(() => {
        const body = document.body;
        if (isAddMealModalOpen || isCheckInModalOpen || isStreakModalOpen) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = 'auto';
        }
        return () => {
            body.style.overflow = 'auto';
        };
    }, [isAddMealModalOpen, isCheckInModalOpen, isStreakModalOpen]);

    const totalCalories = React.useMemo(() => meals.reduce((sum, meal) => sum + (meal.calories || 0), 0), [meals]);
    const totalProtein = React.useMemo(() => meals.reduce((sum, meal) => sum + (meal.protein || 0), 0), [meals]);
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
        if (!user) {
            setSurveyHistory(null);
            return;
        }
        const userId = user.uid;
        const todayKey = getTodaysDateKey();
        
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/userProfile`, 'settings');
        const unsubscribeProfile = onSnapshot(userProfileRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserName(data.userName || '');
                setSurveyHistory(data.surveyHistory || null);
                setDailyGoal(data.dailyGoal || 2200);
                setDailyProteinGoal(data.dailyProteinGoal || 120);
                setDailyWaterGoal(data.dailyWaterGoal || 2500);
                setMaintenanceCalories(data.maintenanceCalories || 2000);
                setStreakData(data.streakData || {});
            } else {
                setSurveyHistory(null);
            }
        });

        const mealsRef = doc(db, `artifacts/${appId}/users/${userId}/dailyMeals`, todayKey);
        const unsubscribeMeals = onSnapshot(mealsRef, (docSnap) => {
            setMeals(docSnap.exists() ? docSnap.data().meals || [] : []);
        });

        const waterRef = doc(db, `artifacts/${appId}/users/${userId}/dailyWater`, todayKey);
        const unsubscribeWater = onSnapshot(waterRef, (docSnap) => {
            setTodaysWaterIntake(docSnap.exists() ? docSnap.data().intake || 0 : 0);
        });

        return () => {
            unsubscribeProfile();
            unsubscribeMeals();
            unsubscribeWater();
        };

    }, [user]);

    const handleSurveyComplete = async ({ name, goal, maintenance, proteinGoal, waterGoal, initialSurvey }) => {
        if (!user) return;
        const todayKey = getTodaysDateKey();
        const surveyPayload = { startDate: todayKey, data: initialSurvey, lastCheckIn: todayKey };
        const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile`, 'settings');
        await setDoc(userProfileRef, {
            userName: name,
            dailyGoal: goal,
            dailyProteinGoal: proteinGoal,
            dailyWaterGoal: waterGoal,
            maintenanceCalories: maintenance,
            surveyHistory: surveyPayload,
            streakData: {},
        }, { merge: true });
    };

    const handleCheckInUpdate = async ({ goal, maintenance, proteinGoal, waterGoal, newWeight }) => {
        if (!user || !surveyHistory) return;
        const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile`, 'settings');

        const updatedHistory = {
            ...surveyHistory,
            data: { ...surveyHistory.data, weight: newWeight },
            lastCheckIn: getTodaysDateKey(),
        };
        await updateDoc(userProfileRef, {
            dailyGoal: goal,
            dailyProteinGoal: proteinGoal,
            dailyWaterGoal: waterGoal,
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

    const handleAddWater = async () => {
        if (!user) return;
        const todayKey = getTodaysDateKey();
        const waterRef = doc(db, `artifacts/${appId}/users/${user.uid}/dailyWater`, todayKey);
        await setDoc(waterRef, { intake: increment(100) }, { merge: true });
    };
    
    const handleGoalChange = (newGoal) => {
         if (!user || isNaN(newGoal) || newGoal <= 0) return;
         const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile`, 'settings');
         updateDoc(userProfileRef, { dailyGoal: newGoal });
    };

    const handleProteinGoalChange = (newGoal) => {
         if (!user || isNaN(newGoal) || newGoal <= 0) return;
         const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile`, 'settings');
         updateDoc(userProfileRef, { dailyProteinGoal: newGoal });
    };

    const updateStreakData = async () => {
        if (!user) return;
        const todayKey = getTodaysDateKey();
        const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/userProfile`, 'settings');
        if (totalCalories >= dailyGoal) {
             await updateDoc(userProfileRef, { [`streakData.${todayKey}`]: true });
        }
    }

    React.useEffect(() => {
        if (!isFirebaseReady || !user) return;
        const todayKey = getTodaysDateKey();
        const hasHitGoalToday = streakData[todayKey] || false;

        if (prevTotalCalories.current < dailyGoal && totalCalories >= dailyGoal && dailyGoal > 0) {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js";
            script.onload = () => window.confetti && window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            document.body.appendChild(script);
            setTimeout(() => document.body.contains(script) && document.body.removeChild(script), 4000);
            
            setToastMessage(`Daily goal achieved! Great job!`);
            setTimeout(() => setToastMessage(''), 5000);
        }

        if (totalCalories >= dailyGoal && !hasHitGoalToday) {
            navigator.vibrate && navigator.vibrate(200);
            updateStreakData();
        }

        prevTotalCalories.current = totalCalories;
    }, [totalCalories, dailyGoal, streakData, isFirebaseReady, user]);

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
        const mealSummary = meals.map(m => `- ${m.name} (~${m.calories} kcal, ~${m.protein}g protein)`).join('\n');
        const userPrompt = `Based on the following list of meals I ate today, provide a brief, one-paragraph nutritional analysis focusing on both calories and protein. Offer one positive insight and one simple, actionable suggestion for a healthier choice tomorrow. Keep the tone encouraging and friendly, like a helpful nutrition coach. Do not use markdown.\n\nHere are my meals:\n${mealSummary}\n\nMy daily goals are ${dailyGoal} kcal and ${dailyProteinGoal}g of protein.`;
        const apiKey = "AIzaSyAEMGk8n6nSeAU73FL9Y-EQX7heHKrw388";
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

    if (!isFirebaseReady || surveyHistory === undefined) return <FirebaseLoadingScreen />;
    if (!user) return <AuthScreen />;
    if (!surveyHistory) return <OnboardingSurvey onComplete={handleSurveyComplete} />;

    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-300">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                html.dark { color-scheme: dark; }
                body { font-family: 'Inter', sans-serif; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #E2E8F0; }
                .dark ::-webkit-scrollbar-track { background: #1E293B; }
                ::-webkit-scrollbar-thumb { background: #94A3B8; border-radius: 4px; }
                .dark ::-webkit-scrollbar-thumb { background: #334155; }
                ::-webkit-scrollbar-thumb:hover { background: #64748B; }
                .dark ::-webkit-scrollbar-thumb:hover { background: #475569; }
                @keyframes fade-in-scale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
                .animate-pulse { animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse {
                    50% { opacity: .5; }
                }
            `}</style>
            <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Hello, {userName || 'User'}!</h1>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setIsStreakModalOpen(true)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <StreakCounter streakData={streakData} />
                        </button>
                        <button onClick={toggleTheme} title="Toggle Theme" className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>
                        <button onClick={handleLogout} title="Log Out" className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <LogOutIcon />
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 flex flex-col items-center max-w-2xl">
                <NutritionDashboard
                    totalCalories={totalCalories}
                    dailyGoal={dailyGoal}
                    onGoalChange={() => handleGoalChange(parseInt(prompt("Set new calorie goal:", dailyGoal), 10))}
                    totalProtein={totalProtein}
                    dailyProteinGoal={dailyProteinGoal}
                    onProteinGoalChange={() => handleProteinGoalChange(parseInt(prompt("Set new protein goal (g):", dailyProteinGoal), 10))}
                    todaysWaterIntake={todaysWaterIntake}
                    dailyWaterGoal={dailyWaterGoal}
                    onAddWater={handleAddWater}
                />
                <div className="text-center mt-6 text-slate-500 dark:text-slate-400">
                    Your maintenance level is <strong>{maintenanceCalories} kcal</strong>
                </div>
                {meals.length > 0 && !isInsightLoading && !insight && !insightError && (
                    <div className="text-center mt-6 animate-fade-in-up">
                        <button onClick={debounce(getMealInsights, 500)} disabled={isInsightLoading} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/50 hover:shadow-xl"><SparklesIcon /><span className="ml-2">✨ Get Meal Insights</span></button>
                    </div>
                )}
                <MealInsightCard insight={insight} isLoading={isInsightLoading} error={insightError} onClear={clearInsight} />
                <MealList meals={meals} onRemove={removeMeal} />
            </main>
            <button onClick={() => setIsAddMealModalOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50 flex items-center justify-center hover:bg-blue-500 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400/50" aria-label="Add new meal"><PlusIcon /></button>
            <AddMealModal isOpen={isAddMealModalOpen} onClose={() => setIsAddMealModalOpen(false)} onAddMeal={addMeal} />
            <StreakModal isOpen={isStreakModalOpen} onClose={() => setIsStreakModalOpen(false)} streakData={streakData} />
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

