import React from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  getDoc,
} from "firebase/firestore";
import ProgressPage from "./pages/ProgressPage.js";
import HomePage from "./pages/HomePage.js";
import CircularProgress from "./components/CircularProgress.js";
import { StreakCounter } from "./components/StreakCounter.js";
import GoalRecommendationCard from "./components/GoalRecommendationCard.js";
import { MealList } from "./components/MealList.js";
import MealInsightCard from "./components/MealInsightCard.js";

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

// --- Nutrition Calculation Helpers ---

const calculateAge = (dob) => {
  if (!dob || !dob.year || !dob.month || !dob.day) return 0;
  const birthDate = new Date(dob.year, dob.month - 1, dob.day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const calculateBMR = (data) => {
  // Uses DOB for new users, falls back to stored age for existing users
  const age = data.dob ? calculateAge(data.dob) : data.age;
  const { gender, weight, height } = data;
  if (gender === "male") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
};

const calculateProteinGoal = (data) => {
  const { weight, activityLevel } = data;
  const multipliers = {
    sedentary: 0.8,
    light: 1.2,
    moderate: 1.4,
    active: 1.6,
  };
  return Math.round((weight * multipliers[activityLevel]) / 5) * 5;
};

const calculateWaterGoal = (data) => {
  const { weight, activityLevel } = data;
  let baseIntake = weight * 35;
  const activityBonus = {
    sedentary: 0,
    light: 300,
    moderate: 600,
    active: 900,
  };
  const totalIntake = baseIntake + activityBonus[activityLevel];
  return Math.round(totalIntake / 50) * 50;
};

const calculateMaintenanceCalories = (data) => {
  const bmr = calculateBMR(data);
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };
  return Math.round(bmr * activityMultipliers[data.activityLevel]);
};

const calculateFinalGoal = (data) => {
  const maintenance = calculateMaintenanceCalories(data);
  // Uses weeklyRate for new users, falls back to hardcoded values for existing users
  if (data.weeklyRate && (data.goal === "lose" || data.goal === "gain")) {
    const dailyCalorieChange = Math.round((data.weeklyRate * 7700) / 7);
    switch (data.goal) {
      case "lose":
        return Math.round((maintenance - dailyCalorieChange) / 10) * 10;
      case "gain":
        return Math.round((maintenance + dailyCalorieChange) / 10) * 10;
    }
  } else {
    // Fallback for old users or 'maintain' goal
    switch (data.goal) {
      case "lose":
        return Math.round((maintenance - 500) / 10) * 10;
      case "gain":
        return Math.round((maintenance + 300) / 10) * 10;
      default:
        return Math.round(maintenance / 10) * 10;
    }
  }
  return Math.round(maintenance / 10) * 10; // Default case
};

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAaXMw0-E9cE9mwVYJYKBSRZhPNoblDtU4",
  authDomain: "wgain-d5ab1.firebaseapp.com",
  projectId: "wgain-d5ab1",
  storageBucket: "wgain-d5ab1.appspot.com",
  messagingSenderId: "1060562581519",
  appId: "1:1060562581519:web:211a5a08d6501802688b7a",
  measurementId: "G-Y4RQ7DDRXC",
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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-camera"
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-x"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-plus"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
const RefreshCwIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-refresh-cw"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-sparkles"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);
const FireIcon = ({ lit }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-flame transition-colors duration-500 ${
      lit
        ? "text-orange-500 fill-orange-500"
        : "text-slate-400 dark:text-slate-600"
    }`}
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);
const LogOutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-log-out"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);
const UnfoldVerticalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-unfold-vertical"
  >
    <path d="M12 22v-6" />
    <path d="m15 19-3 3-3-3" />
    <path d="M12 2v6" />
    <path d="m15 5-3-3-3 3" />
  </svg>
);
const WaterDropIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-droplet"
  >
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
);
const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-sun"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);
const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-moon"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
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
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };
  const handleMouseMove = (e) => handleDragMove(e.clientY);
  const handleMouseUp = () => {
    handleDragEnd();
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
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
      <div
        className={`transition-transform duration-100 ${
          isDragging ? "scale-110" : "scale-100"
        }`}
      >
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
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
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
          <h1 className="text-4xl font-extrabold text-blue-500 tracking-tight">
            NutriScan AI
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Your personal AI-powered nutrition coach.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            Welcome!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Sign in with your Google account to continue.
          </p>
          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm text-center mb-4">
              {error}
            </p>
          )}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full p-4 bg-white text-slate-700 dark:bg-slate-200 dark:text-slate-800 rounded-lg text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-300 transition-colors transform border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-blue-500"
              >
                <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C15.28,4.73 17.27,6.48 17.27,6.48L19.6,4.2C19.6,4.2 16.59,1.5 12.19,1.5C6.42,1.5 2,6.2 2,12C2,17.8 6.42,22.5 12.19,22.5C18.1,22.5 21.54,18.5 21.54,12.81C21.54,11.89 21.48,11.47 21.35,11.1Z"></path>
              </svg>
            )}
            <span>{isLoading ? "Signing In..." : "Sign In with Google"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const RulerScroller = ({
  value,
  onChange,
  min,
  max,
  orientation = "horizontal",
}) => {
  const scrollerRef = React.useRef(null);
  const isInteracting = React.useRef(false);
  const startPos = React.useRef(0);
  const startScroll = React.useRef(0);

  const isHorizontal = orientation === "horizontal";
  const TICK_SPACING = 12;
  const PRECISION = 10;

  const valueToScroll = React.useCallback(
    (val) => (val - min) * PRECISION * TICK_SPACING,
    [min]
  );
  const scrollToValue = React.useCallback(
    (scrollPos) => {
      const rawValue = min + scrollPos / (PRECISION * TICK_SPACING);
      const rounded = Math.round(rawValue * PRECISION) / PRECISION;
      return Math.max(min, Math.min(max, rounded));
    },
    [min, max]
  );

  React.useEffect(() => {
    const element = scrollerRef.current;
    if (element && !isInteracting.current) {
      const targetScroll = valueToScroll(value);
      element.scrollTo(
        isHorizontal
          ? { left: targetScroll, behavior: "smooth" }
          : { top: targetScroll, behavior: "smooth" }
      );
    }
  }, [value, isHorizontal, valueToScroll]);

  const handleInteractionStart = (e) => {
    isInteracting.current = true;
    scrollerRef.current.style.scrollBehavior = "auto";
    const pos = isHorizontal
      ? e.clientX || e.touches[0].clientX
      : e.clientY || e.touches[0].clientY;
    startPos.current = pos;
    startScroll.current = isHorizontal
      ? scrollerRef.current.scrollLeft
      : scrollerRef.current.scrollTop;

    const moveEvent = e.type === "mousedown" ? "mousemove" : "touchmove";
    const endEvent = e.type === "mousedown" ? "mouseup" : "touchend";

    const handleInteractionMove = (moveEvent) => {
      if (!isInteracting.current) return;
      moveEvent.preventDefault();
      const pos = isHorizontal
        ? moveEvent.clientX || moveEvent.touches[0].clientX
        : moveEvent.clientY || moveEvent.touches[0].clientY;
      const delta = pos - startPos.current;
      const newScroll = startScroll.current - delta;

      const newValue = scrollToValue(newScroll);
      onChange(newValue);

      scrollerRef.current.scrollTo(
        isHorizontal ? { left: newScroll } : { top: newScroll }
      );
    };

    const handleInteractionEnd = () => {
      isInteracting.current = false;
      scrollerRef.current.style.scrollBehavior = "smooth";
      window.removeEventListener(moveEvent, handleInteractionMove);
      window.removeEventListener(endEvent, handleInteractionEnd);
      const finalScroll = isHorizontal
        ? scrollerRef.current.scrollLeft
        : scrollerRef.current.scrollTop;
      const finalValue = scrollToValue(finalScroll);
      onChange(finalValue); // Final snap
    };

    window.addEventListener(moveEvent, handleInteractionMove, {
      passive: false,
    });
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
          <div
            key={i}
            className="flex flex-col items-center justify-end flex-shrink-0"
            style={{ width: TICK_SPACING }}
          >
            <div
              className={`bg-slate-300 dark:bg-slate-600 ${
                isMajorTick ? "h-6 w-0.5" : isHalfTick ? "h-4 w-px" : "h-3 w-px"
              }`}
            />
            {isMajorTick && (
              <span className="text-xs mt-1 text-slate-500">{tickValue}</span>
            )}
          </div>
        );
      } else {
        return (
          <div
            key={i}
            className="flex items-center justify-end flex-shrink-0"
            style={{ height: TICK_SPACING }}
          >
            {isMajorTick && (
              <span className="text-xs mr-2 text-slate-500">{tickValue}</span>
            )}
            <div
              className={`bg-slate-300 dark:bg-slate-600 ${
                isMajorTick ? "w-6 h-0.5" : isHalfTick ? "w-4 h-px" : "w-3 h-px"
              }`}
            />
          </div>
        );
      }
    });
  }, [min, max, isHorizontal]);

  return (
    <div className={`relative w-full h-full overflow-hidden`}>
      <div
        ref={scrollerRef}
        onMouseDown={handleInteractionStart}
        onTouchStart={handleInteractionStart}
        className={`scrollbar-hide cursor-grab active:cursor-grabbing w-full h-full ${
          isHorizontal
            ? "flex items-end overflow-x-scroll"
            : "flex flex-col items-end overflow-y-scroll"
        }`}
      >
        <div
          className={
            isHorizontal ? "w-1/2 flex-shrink-0" : "h-1/2 flex-shrink-0"
          }
        />
        {Ticks}
        <div
          className={
            isHorizontal ? "w-1/2 flex-shrink-0" : "h-1/2 flex-shrink-0"
          }
        />
      </div>
      <div
        className={`absolute bg-blue-500 z-10 rounded-full ${
          isHorizontal
            ? "bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-10"
            : "top-1/2 -translate-y-1/2 right-0 w-10 h-0.5"
        }`}
      />
    </div>
  );
};

const OnboardingSurvey = ({ onComplete, initialName = "" }) => {
  const [step, setStep] = React.useState(0);
  const [surveyData, setSurveyData] = React.useState({
    name: initialName,
    goal: "lose",
    gender: "male",
    dob: { day: "", month: "", year: "" },
    weight: 70,
    height: 175,
    activityLevel: "sedentary",
    targetWeight: 65,
    weeklyRate: 0.5,
  });
  const [heightUnit, setHeightUnit] = React.useState("cm");

  const totalSteps = 9;

  const handleNext = () =>
    setStep((s) => {
      let nextStep = s + 1;
      // Skip weekly rate step (6) if goal is to maintain
      if (nextStep === 6 && surveyData.goal === "maintain") {
        nextStep++;
      }
      return Math.min(nextStep, totalSteps - 1);
    });

  const handleBack = () =>
    setStep((s) => {
      let prevStep = s - 1;
      // Skip weekly rate step (6) if goal is to maintain
      if (prevStep === 6 && surveyData.goal === "maintain") {
        prevStep--;
      }
      return Math.max(prevStep, 0);
    });

  const handleDataChange = (key, value) =>
    setSurveyData((prev) => ({ ...prev, [key]: value }));
  const handleDobChange = (part, value) => {
    setSurveyData((prev) => ({
      ...prev,
      dob: { ...prev.dob, [part]: value ? parseInt(value) : "" },
    }));
  };

  // --- Unit Conversion Helpers ---
  const cmToFeetInches = (cm) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  const displayHeight = () => {
    if (heightUnit === "cm") {
      return `${surveyData.height.toFixed(1)} cm`;
    }
    const { feet, inches } = cmToFeetInches(surveyData.height);
    return `${feet}' ${inches}"`;
  };

  const handleFinish = () => {
    onComplete({
      name: surveyData.name,
      goal: calculateFinalGoal(surveyData),
      maintenance: calculateMaintenanceCalories(surveyData),
      proteinGoal: calculateProteinGoal(surveyData),
      waterGoal: calculateWaterGoal(surveyData),
      initialSurvey: surveyData,
    });
  };

  const isNextDisabled = () => {
    if (step === 0 && !surveyData.name.trim()) return true;
    if (
      step === 2 &&
      (!surveyData.dob.day || !surveyData.dob.month || !surveyData.dob.year)
    )
      return true;
    return false;
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Name
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">
              What should we call you?
            </h2>
            <input
              type="text"
              value={surveyData.name}
              onChange={(e) => handleDataChange("name", e.target.value)}
              className="w-full mt-1 p-3 text-center text-xl bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-blue-500 outline-none"
              placeholder="Your Name"
            />
          </div>
        );
      case 1: // Goal
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">
              What's your primary goal, {surveyData.name}?
            </h2>
            <div className="space-y-3">
              {["lose", "maintain", "gain"].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    handleDataChange("goal", g);
                    handleNext();
                  }}
                  className={`w-full p-4 rounded-lg text-lg font-semibold transition-colors ${
                    surveyData.goal === g
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)} Weight
                </button>
              ))}
            </div>
          </div>
        );
      case 2: // Gender & DOB
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">
              Tell us a bit about yourself
            </h2>
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-3">Gender</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleDataChange("gender", "male")}
                  className={`p-4 rounded-lg text-lg font-semibold transition-colors ${
                    surveyData.gender === "male"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => handleDataChange("gender", "female")}
                  className={`p-4 rounded-lg text-lg font-semibold transition-colors ${
                    surveyData.gender === "female"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
            <div>
              <label className="block text-lg font-semibold mb-3">
                Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="DD"
                  value={surveyData.dob.day}
                  onChange={(e) => handleDobChange("day", e.target.value)}
                  className="w-full p-3 text-center text-xl bg-slate-200 dark:bg-slate-700 rounded-lg outline-none focus:border-blue-500 border-2 border-transparent"
                />
                <input
                  type="number"
                  placeholder="MM"
                  value={surveyData.dob.month}
                  onChange={(e) => handleDobChange("month", e.target.value)}
                  className="w-full p-3 text-center text-xl bg-slate-200 dark:bg-slate-700 rounded-lg outline-none focus:border-blue-500 border-2 border-transparent"
                />
                <input
                  type="number"
                  placeholder="YYYY"
                  value={surveyData.dob.year}
                  onChange={(e) => handleDobChange("year", e.target.value)}
                  className="w-full p-3 text-center text-xl bg-slate-200 dark:bg-slate-700 rounded-lg outline-none focus:border-blue-500 border-2 border-transparent"
                />
              </div>
            </div>
          </div>
        );
      case 3: // Weight
        return (
          <div className="text-center w-full">
            <h2 className="text-2xl font-bold mb-6">
              What's your current weight?
            </h2>
            <p className="text-5xl font-bold text-blue-500 mb-4">
              {surveyData.weight.toFixed(1)}{" "}
              <span className="text-3xl text-slate-500">kg</span>
            </p>
            <RulerScroller
              value={surveyData.weight}
              onChange={(v) => handleDataChange("weight", v)}
              min={30}
              max={200}
            />
          </div>
        );
      case 4: // Height
        return (
          <div className="text-center w-full h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-2">What's your height?</h2>
            <div className="p-1 bg-slate-200 dark:bg-slate-700 rounded-full flex mx-auto mb-4">
              <button
                onClick={() => setHeightUnit("cm")}
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  heightUnit === "cm"
                    ? "bg-white dark:bg-slate-600"
                    : "text-slate-500"
                }`}
              >
                cm
              </button>
              <button
                onClick={() => setHeightUnit("ft")}
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  heightUnit === "ft"
                    ? "bg-white dark:bg-slate-600"
                    : "text-slate-500"
                }`}
              >
                ft
              </button>
            </div>
            <div className="flex-grow flex items-center w-full gap-4 min-h-0">
              <div className="w-40 flex-shrink-0">
                <p className="text-5xl font-bold text-blue-500 text-center">
                  {displayHeight()}
                </p>
              </div>
              <div className="flex-grow h-full relative">
                <RulerScroller
                  value={surveyData.height}
                  onChange={(v) => handleDataChange("height", v)}
                  min={120}
                  max={220}
                  orientation="vertical"
                />
              </div>
            </div>
          </div>
        );
      case 5: // Target Weight
        return (
          <div className="text-center w-full">
            <h2 className="text-2xl font-bold mb-6">
              What's your target weight?
            </h2>
            <p className="text-5xl font-bold text-blue-500 mb-4">
              {surveyData.targetWeight.toFixed(1)}{" "}
              <span className="text-3xl text-slate-500">kg</span>
            </p>
            <RulerScroller
              value={surveyData.targetWeight}
              onChange={(v) => handleDataChange("targetWeight", v)}
              min={30}
              max={200}
            />
          </div>
        );
      case 6: // Weekly Goal
        const goalRates = [
          { value: 0.25, label: "Gentle (0.25 kg/week)" },
          { value: 0.5, label: "Steady (0.5 kg/week)" },
          { value: 0.75, label: "Ambitious (0.75 kg/week)" },
          { value: 1.0, label: "Intense (1.0 kg/week)" },
        ];
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">
              What's your weekly{" "}
              {surveyData.goal === "lose" ? "weight loss" : "weight gain"} pace?
            </h2>
            <div className="space-y-3">
              {goalRates.map((rate) => (
                <button
                  key={rate.value}
                  onClick={() => {
                    handleDataChange("weeklyRate", rate.value);
                    handleNext();
                  }}
                  className={`w-full p-4 rounded-lg text-lg font-semibold transition-colors ${
                    surveyData.weeklyRate === rate.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  {rate.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 7: // Activity Level
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">How active are you?</h2>
            <div className="space-y-3">
              {[
                { id: "sedentary", label: "Sedentary" },
                { id: "light", label: "Lightly Active" },
                { id: "moderate", label: "Moderately Active" },
                { id: "active", label: "Very Active" },
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => {
                    handleDataChange("activityLevel", level.id);
                    handleNext();
                  }}
                  className={`w-full p-4 rounded-lg text-lg font-semibold transition-colors text-center ${
                    surveyData.activityLevel === level.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 8: // Final Confirmation
        const finalGoal = calculateFinalGoal(surveyData);
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Your Personalized Plan</h2>
            <p className="text-lg mb-6">
              Based on your info, here is your recommended starting goal:
            </p>
            <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-xl mb-6">
              <p className="text-lg">Daily Calorie Goal:</p>
              <span className="text-5xl font-extrabold text-blue-500 dark:text-blue-400">
                {finalGoal}
              </span>
              <span className="text-xl text-slate-600 dark:text-slate-300">
                {" "}
                kcal
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Ready to start your journey?
            </p>
            <button
              onClick={handleFinish}
              className="w-full p-4 bg-blue-600 text-white rounded-lg text-xl font-bold hover:bg-blue-500 transition-transform transform hover:scale-105"
            >
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
              <div
                key={i}
                className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"
              >
                <div
                  className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: i < step ? "100%" : i === step ? "50%" : "0%",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 flex-grow flex flex-col items-center justify-center overflow-hidden">
          {renderStep()}
        </div>

        <div className="p-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="px-6 py-2 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          {step < totalSteps - 1 && (
            <button
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="px-8 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MonthlyCheckInModal = ({ isOpen, onClose, onUpdate, surveyHistory }) => {
  const [newWeight, setNewWeight] = React.useState(
    surveyHistory?.data?.weight || 0
  );
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
    return (data.weight + weightChangePerDay * 30).toFixed(1);
  };

  const handleRecalculate = () => {
    const updatedSurveyData = { ...surveyHistory.data, weight: newWeight };
    const newMaintenance = calculateMaintenanceCalories(updatedSurveyData);
    const newGoal = calculateFinalGoal(updatedSurveyData);
    const newProteinGoal = calculateProteinGoal(updatedSurveyData);
    const newWaterGoal = calculateWaterGoal(updatedSurveyData);
    setRecalculated({
      goal: newGoal,
      maintenance: newMaintenance,
      proteinGoal: newProteinGoal,
      waterGoal: newWaterGoal,
    });
  };

  const handleUpdatePlan = () => {
    onUpdate({
      ...recalculated,
      newWeight: newWeight,
    });
    onClose();
  };

  const predictedWeight = calculatePredictedWeight();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100 mb-4">
          Monthly Check-in!
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
          It's been a month! Let's update your plan based on your progress.
        </p>

        <div className="text-center bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg mb-6">
          <p className="text-slate-600 dark:text-slate-300">
            Based on your plan, we predicted you would be around:
          </p>
          <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">
            {predictedWeight} kg
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-lg font-semibold text-center">
            What is your current weight? (kg)
          </label>
          <input
            type="number"
            value={newWeight}
            onChange={(e) => setNewWeight(parseInt(e.target.value) || 0)}
            className="w-full mt-1 p-3 text-center text-xl bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-blue-500 outline-none"
          />
          <button
            onClick={handleRecalculate}
            className="w-full p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Recalculate My Goal
          </button>
        </div>

        {recalculated && (
          <div className="mt-6 text-center animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4">
              Your New Recommended Plan
            </h3>
            <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-xl mb-6">
              <p className="text-lg">New Daily Intake:</p>
              <span className="text-4xl font-extrabold text-blue-500 dark:text-blue-400">
                {recalculated.goal}
              </span>
              <span className="text-xl text-slate-600 dark:text-slate-300">
                {" "}
                kcal
              </span>
            </div>
            <button
              onClick={handleUpdatePlan}
              className="w-full p-4 bg-blue-600 text-white rounded-lg text-xl font-bold hover:bg-blue-500 transition-transform transform hover:scale-105"
            >
              Update My Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Component moved to /src/components/CircularProgress.js

// Component moved to /src/components/StreakCounter.js

const StreakCalendar = ({ streakData }) => {
  const today = new Date();
  // Create a copy to avoid mutating the original `today` object
  const todayCopy = new Date(today);
  const startOfWeek = new Date(
    todayCopy.setDate(todayCopy.getDate() - todayCopy.getDay())
  );
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const week = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    return date;
  });

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div className="flex justify-around items-center">
      {week.map((date, i) => {
        const dateKey = date.toISOString().split("T")[0];
        const isCompleted = streakData[dateKey] || false;
        const isToday = isSameDay(date, new Date());

        return (
          <div
            key={dateKey}
            className="flex flex-col items-center gap-2 text-center"
          >
            <span
              className={`text-xs font-bold ${
                isToday ? "text-blue-500" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {weekDays[i]}
            </span>
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full relative ${
                isToday ? "bg-blue-100 dark:bg-blue-900/50" : ""
              }`}
            >
              <FireIcon lit={isCompleted} />
              {isToday && (
                <div className="absolute bottom-1 h-1 w-1 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const StreakModal = ({
  isOpen,
  onClose,
  streakData,
  weeklyProgress,
  surveyHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in-scale">
      <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-10"
        >
          <XIcon />
        </button>
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Your Progress
            </h2>
            <div className="inline-block bg-slate-100 dark:bg-slate-700 p-2 rounded-full">
              <StreakCounter streakData={streakData} />
            </div>
          </div>

          <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg mb-6">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3 text-center tracking-wider uppercase">
              This Week's Activity
            </h3>
            <StreakCalendar streakData={streakData} />
          </div>

          <WeeklyGoalProgress
            weeklyProgress={weeklyProgress}
            surveyHistory={surveyHistory}
            variant="modal"
          />
        </div>
      </div>
    </div>
  );
};

// Component moved to /src/components/MealList.js

const Loader = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-lg text-slate-600 dark:text-slate-300">
      Analyzing your meal...
    </p>
  </div>
);

const AddMealModal = ({ isOpen, onClose, onAddMeal }) => {
  const [capturedImage, setCapturedImage] = React.useState(null);
  const [stream, setStream] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiResult, setApiResult] = React.useState(null);
  const [editedMeal, setEditedMeal] = React.useState({
    name: "",
    calories: 0,
    protein: 0,
    weight: 0,
  });
  const [nutritionRatios, setNutritionRatios] = React.useState(null); // To store calories/protein per gram
  const [error, setError] = React.useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const stopCamera = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const resetState = React.useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setIsLoading(false);
    setApiResult(null);
    setError(null);
    setEditedMeal({ name: "", calories: 0, protein: 0, weight: 0 });
    setNutritionRatios(null);
  }, [stopCamera]);

  React.useEffect(() => {
    if (isOpen) {
      const startCamera = async () => {
        if (stream) return;
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
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
    canvas
      .getContext("2d")
      .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(dataUrl);
    const base64Data = dataUrl.split(",")[1];
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

    // This is the updated URL. It points to your Netlify function.
    const apiUrl = `/api/getMealData`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64ImageData }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(
          `API Error: ${response.status} - ${
            errorBody.error || "Unknown error"
          }`
        );
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate && candidate.content?.parts?.[0]?.text) {
        const parsedJson = JSON.parse(candidate.content.parts[0].text);
        setApiResult(parsedJson);
        setEditedMeal({
          name: parsedJson.mealName,
          calories: parseFloat((parsedJson.totalCalories || 0).toFixed(1)),
          protein: parseFloat((parsedJson.totalProtein || 0).toFixed(1)),
          weight: parsedJson.estimatedWeight,
        });

        if (parsedJson.estimatedWeight > 0) {
          setNutritionRatios({
            caloriesPerGram:
              parsedJson.totalCalories / parsedJson.estimatedWeight,
            proteinPerGram:
              parsedJson.totalProtein / parsedJson.estimatedWeight,
          });
        }
      } else {
        throw new Error(
          "Unexpected API response format. Could not find valid content."
        );
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
        calories: parseFloat(
          (newWeight * nutritionRatios.caloriesPerGram).toFixed(1)
        ),
        protein: parseFloat(
          (newWeight * nutritionRatios.proteinPerGram).toFixed(1)
        ),
      });
    } else {
      setEditedMeal({ ...editedMeal, weight: newWeight });
    }
  };

  const handleManualNutritionChange = (field, value) => {
    setEditedMeal((prev) => ({ ...prev, [field]: value }));
    // When user edits calories or protein manually, stop automatic recalculations
    setNutritionRatios(null);
  };

  const handleAddMeal = () => {
    if (editedMeal.name && editedMeal.calories > 0 && editedMeal.protein >= 0) {
      onAddMeal({
        id: crypto.randomUUID(),
        name: editedMeal.name,
        calories: Number(editedMeal.calories),
        protein: Number(editedMeal.protein),
        image: capturedImage,
      });
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-50 transition-opacity animate-fade-in-scale">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-3 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-20"
        >
          <XIcon />
        </button>
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100">
            Scan a Meal
          </h2>
          <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative border-2 border-slate-300 dark:border-slate-700 shadow-lg">
            {!capturedImage ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={capturedImage}
                alt="Captured meal"
                className="w-full h-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
          {!apiResult && !isLoading && !capturedImage && (
            <button
              onClick={handleScanMeal}
              disabled={!stream}
              className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              <CameraIcon />
              Scan Meal
            </button>
          )}
          {isLoading && <Loader />}
          {error && !isLoading && (
            <div className="text-center">
              <p className="text-red-500 dark:text-red-400 font-semibold mb-4">
                {error}
              </p>
              <button
                onClick={handleRetake}
                className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-500 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCwIcon />
                Try Again
              </button>
            </div>
          )}
          {apiResult && !isLoading && (
            <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center animate-fade-in-up space-y-4">
              <input
                type="text"
                value={editedMeal.name}
                onChange={(e) =>
                  setEditedMeal({ ...editedMeal, name: e.target.value })
                }
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xl font-semibold text-slate-800 dark:text-slate-100 capitalize text-center"
              />
              <div className="grid grid-cols-3 gap-2 items-center">
                <div>
                  <input
                    type="number"
                    step="0.1"
                    value={editedMeal.calories}
                    onChange={(e) =>
                      handleManualNutritionChange(
                        "calories",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-2xl font-bold text-blue-500 dark:text-blue-400 text-center"
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400 mt-1 block">
                    kcal
                  </span>
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    value={editedMeal.protein}
                    onChange={(e) =>
                      handleManualNutritionChange(
                        "protein",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-2xl font-bold text-sky-500 dark:text-sky-400 text-center"
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400 mt-1 block">
                    protein (g)
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <NumberScroller
                    value={Math.round(editedMeal.weight)}
                    onChange={handleWeightChange}
                    min={0}
                    max={2000}
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    weight (g)
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleRetake}
                  className="w-full bg-slate-500 dark:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 dark:hover:bg-slate-500 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCwIcon />
                  Retake
                </button>
                <button
                  onClick={handleAddMeal}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-transform transform hover:scale-105"
                >
                  Add to Diary
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component moved to /src/components/MealInsightCard.js

// Component moved to /src/components/GoalRecommendationCard.js

const WeeklyGoalProgress = ({
  weeklyProgress,
  surveyHistory,
  variant = "card",
}) => {
  // Return null if no survey data, no weeklyRate, or goal is to maintain
  if (
    !surveyHistory?.data?.weeklyRate ||
    surveyHistory.data.goal === "maintain"
  ) {
    return null;
  }

  const { goal, weeklyRate } = surveyHistory.data;

  // Ensure weeklyProgress doesn't exceed 7
  const cappedProgress = Math.min(weeklyProgress, 7);

  const progressPercentage = (cappedProgress / 7) * 100;
  const achievedWeight = (cappedProgress / 7) * weeklyRate;

  const goalText =
    goal === "lose" ? `Lose ${weeklyRate} kg` : `Gain ${weeklyRate} kg`;

  const containerClasses = {
    card: "mt-8 w-full p-6 bg-card-light dark:bg-card-dark rounded-lg shadow-sm animate-fade-in-up",
    modal: "w-full",
  };

  return (
    <section className={containerClasses[variant]}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
          Weekly Goal Progress
        </h2>
        <span className="text-sm font-semibold text-blue-500 dark:text-blue-400">
          {goalText}
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
        <div
          className="bg-blue-500 h-4 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-right mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">
        {achievedWeight.toFixed(2)} / {weeklyRate.toFixed(2)} kg
      </p>
    </section>
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

const DiaryPage = ({ userName, meals, removeMeal }) => {
  return (
    <div className="flex-grow p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">
            Your Diary
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            A log of your daily meals.
          </p>
        </div>
      </header>
      <MealList meals={meals} onRemove={removeMeal} />
    </div>
  );
};

// --- Navigation Component ---

const NavigationBar = ({
  activePage,
  setActivePage,
  onCameraClick,
  onProfileClick,
}) => {
  return (
    <div className="sticky bottom-0">
      <div className="absolute bottom-20 right-6">
        <button
          onClick={onCameraClick}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl">
            photo_camera
          </span>
        </button>
      </div>
      <nav className="border-t border-gray-200/50 bg-background-light/80 dark:border-gray-700/50 dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-md items-center justify-around px-4">
          <button
            onClick={() => setActivePage("home")}
            className={`flex flex-col items-center w-16 transition-transform hover:scale-110 ${
              activePage === "home"
                ? "text-accent"
                : "text-text-secondary-light dark:text-text-secondary-dark"
            }`}
          >
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => setActivePage("diary")}
            className={`flex flex-col items-center w-16 transition-transform hover:scale-110 ${
              activePage === "diary"
                ? "text-accent"
                : "text-text-secondary-light dark:text-text-secondary-dark"
            }`}
          >
            <span className="material-symbols-outlined">book</span>
            <span className="text-xs font-medium">Diary</span>
          </button>
          <button
            onClick={() => setActivePage("progress")}
            className={`flex flex-col items-center w-16 transition-transform hover:scale-110 ${
              activePage === "progress"
                ? "text-accent"
                : "text-text-secondary-light dark:text-text-secondary-dark"
            }`}
          >
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="text-xs font-medium">Progress</span>
          </button>
          <button
            onClick={onProfileClick}
            className="flex flex-col items-center w-16 text-text-secondary-light dark:text-text-secondary-dark transition-transform hover:scale-110"
          >
            <span className="material-symbols-outlined">person</span>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const getTodaysDateKey = () => new Date().toISOString().split("T")[0];

  // Firebase and Auth state
  const [user, setUser] = React.useState(null);
  const [isFirebaseReady, setIsFirebaseReady] = React.useState(false);

  // App Data State (synced with Firestore)
  const [userName, setUserName] = React.useState("");
  const [surveyHistory, setSurveyHistory] = React.useState(undefined);
  const [dailyGoal, setDailyGoal] = React.useState(2200);
  const [dailyProteinGoal, setDailyProteinGoal] = React.useState(120);
  const [dailyWaterGoal, setDailyWaterGoal] = React.useState(2500);
  const [maintenanceCalories, setMaintenanceCalories] = React.useState(2000);
  const [meals, setMeals] = React.useState([]);
  const [todaysWaterIntake, setTodaysWaterIntake] = React.useState(0);
  const [streakData, setStreakData] = React.useState({});
  const [weeklyProgress, setWeeklyProgress] = React.useState(0);
  const [historicalData, setHistoricalData] = React.useState(null);

  // UI State
  const [activePage, setActivePage] = React.useState("home");
  const [isAddMealModalOpen, setIsAddMealModalOpen] = React.useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = React.useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = React.useState(false);
  const [insight, setInsight] = React.useState(null);
  const [isInsightLoading, setIsInsightLoading] = React.useState(false);
  const [insightError, setInsightError] = React.useState(null);
  const [toastMessage, setToastMessage] = React.useState("");
  const [currentDate, setCurrentDate] = React.useState("");

  React.useEffect(() => {
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(today.toLocaleDateString(undefined, options));
  }, []);

  // Force dark mode by default
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Effect to control body scroll when modals are open
  React.useEffect(() => {
    const body = document.body;
    if (isAddMealModalOpen || isCheckInModalOpen || isStreakModalOpen) {
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = "auto";
    }
    return () => {
      body.style.overflow = "auto";
    };
  }, [isAddMealModalOpen, isCheckInModalOpen, isStreakModalOpen]);

  const totalCalories = React.useMemo(
    () => meals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
    [meals]
  );
  const totalProtein = React.useMemo(
    () => meals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
    [meals]
  );
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
    if (!isFirebaseReady) {
      return;
    }

    if (!user) {
      setSurveyHistory(null);
      return;
    }
    const userId = user.uid;
    const todayKey = getTodaysDateKey();

    // Fetch historical data for charts
    const fetchHistoricalData = async () => {
      const dateKeys = Array.from({ length: 10 })
        .map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split("T")[0];
        })
        .reverse();

      const promises = dateKeys.map(async (dateKey) => {
        const mealsRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/dailyMeals`,
          dateKey
        );
        const waterRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/dailyWater`,
          dateKey
        );

        const [mealsSnap, waterSnap] = await Promise.all([
          getDoc(mealsRef),
          getDoc(waterRef),
        ]);

        let calories = 0;
        let protein = 0;
        if (mealsSnap.exists()) {
          const mealsData = mealsSnap.data().meals || [];
          calories = mealsData.reduce((sum, meal) => sum + meal.calories, 0);
          protein = mealsData.reduce((sum, meal) => sum + meal.protein, 0);
        }

        const water = waterSnap.exists() ? waterSnap.data().intake || 0 : 0;

        return { date: dateKey, calories, protein, water };
      });

      const results = await Promise.all(promises);
      setHistoricalData(results);
    };

    fetchHistoricalData();

    const userProfileRef = doc(
      db,
      `artifacts/${appId}/users/${userId}/userProfile`,
      "settings"
    );
    const unsubscribeProfile = onSnapshot(userProfileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(data.userName || "");
        setSurveyHistory(data.surveyHistory || null);
        setDailyGoal(data.dailyGoal || 2200);
        setDailyProteinGoal(data.dailyProteinGoal || 120);
        setDailyWaterGoal(data.dailyWaterGoal || 2500);
        setMaintenanceCalories(data.maintenanceCalories || 2000);
        setStreakData(data.streakData || {});
        setWeeklyProgress(data.weeklyProgress || 0);
      } else {
        setSurveyHistory(null);
      }
    });

    const mealsRef = doc(
      db,
      `artifacts/${appId}/users/${userId}/dailyMeals`,
      todayKey
    );
    const unsubscribeMeals = onSnapshot(mealsRef, (docSnap) => {
      setMeals(docSnap.exists() ? docSnap.data().meals || [] : []);
    });

    const waterRef = doc(
      db,
      `artifacts/${appId}/users/${userId}/dailyWater`,
      todayKey
    );
    const unsubscribeWater = onSnapshot(waterRef, (docSnap) => {
      setTodaysWaterIntake(docSnap.exists() ? docSnap.data().intake || 0 : 0);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeMeals();
      unsubscribeWater();
    };
  }, [user, isFirebaseReady]);

  const handleSurveyComplete = async ({
    name,
    goal,
    maintenance,
    proteinGoal,
    waterGoal,
    initialSurvey,
  }) => {
    if (!user) return;
    const todayKey = getTodaysDateKey();
    const surveyPayload = {
      startDate: todayKey,
      data: initialSurvey,
      lastCheckIn: todayKey,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const startOfWeekDate = new Date(today);
    startOfWeekDate.setDate(today.getDate() - dayOfWeek);
    const startOfWeekKey = startOfWeekDate.toISOString().split("T")[0];

    const userProfileRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/userProfile`,
      "settings"
    );
    await setDoc(
      userProfileRef,
      {
        userName: name,
        dailyGoal: goal,
        dailyProteinGoal: proteinGoal,
        dailyWaterGoal: waterGoal,
        maintenanceCalories: maintenance,
        surveyHistory: surveyPayload,
        streakData: {},
        weeklyProgress: 0,
        weekStartDate: startOfWeekKey,
      },
      { merge: true }
    );
  };

  const handleCheckInUpdate = async ({
    goal,
    maintenance,
    proteinGoal,
    waterGoal,
    newWeight,
  }) => {
    if (!user || !surveyHistory) return;
    const userProfileRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/userProfile`,
      "settings"
    );

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
    const mealsRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/dailyMeals`,
      todayKey
    );
    await setDoc(mealsRef, { meals: arrayUnion(newMeal) }, { merge: true });
  };

  const removeMeal = async (mealToRemove) => {
    if (!user) return;
    const todayKey = getTodaysDateKey();
    const mealsRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/dailyMeals`,
      todayKey
    );
    await updateDoc(mealsRef, { meals: arrayRemove(mealToRemove) });
  };

  const handleAddWater = async () => {
    if (!user) return;
    const todayKey = getTodaysDateKey();
    const waterRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/dailyWater`,
      todayKey
    );
    await setDoc(waterRef, { intake: increment(100) }, { merge: true });
  };

  const handleGoalCompletion = async () => {
    if (!user) return;
    const todayKey = getTodaysDateKey();
    const userProfileRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/userProfile`,
      "settings"
    );

    // Part 1: Update Streak Data
    await updateDoc(userProfileRef, { [`streakData.${todayKey}`]: true });

    // Part 2: Update Weekly Progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the start of the current week (Sunday)
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday...
    const startOfWeekDate = new Date(today);
    startOfWeekDate.setDate(today.getDate() - dayOfWeek);
    const startOfWeekKey = startOfWeekDate.toISOString().split("T")[0];

    // Get the current progress doc to check the week start date
    const docSnap = await getDoc(userProfileRef);
    if (!docSnap.exists()) return; // Should not happen for a logged in user with survey

    const data = docSnap.data();
    const currentWeekStart = data.weekStartDate;

    if (currentWeekStart !== startOfWeekKey) {
      // New week has started, reset progress to 1 (for today)
      await updateDoc(userProfileRef, {
        weekStartDate: startOfWeekKey,
        weeklyProgress: 1,
      });
    } else {
      // Same week, just increment
      await updateDoc(userProfileRef, {
        weeklyProgress: increment(1),
      });
    }
  };

  React.useEffect(() => {
    if (!isFirebaseReady || !user) return;
    const todayKey = getTodaysDateKey();
    const hasHitGoalToday = streakData[todayKey] || false;

    if (
      prevTotalCalories.current < dailyGoal &&
      totalCalories >= dailyGoal &&
      dailyGoal > 0
    ) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js";
      script.onload = () =>
        window.confetti &&
        window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      document.body.appendChild(script);
      setTimeout(
        () =>
          document.body.contains(script) && document.body.removeChild(script),
        4000
      );

      setToastMessage(`Daily goal achieved! Great job!`);
      setTimeout(() => setToastMessage(""), 5000);
    }

    if (totalCalories >= dailyGoal && !hasHitGoalToday) {
      navigator.vibrate && navigator.vibrate(200);
      handleGoalCompletion();
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
    setIsInsightLoading(true);
    setInsight(null);
    setInsightError(null);
    const mealSummary = meals
      .map((m) => `- ${m.name} (~${m.calories} kcal, ~${m.protein}g protein)`)
      .join("\n");

    const apiUrl = `/api/getMealInsights`;

    const payload = {
      mealSummary,
      dailyGoal,
      dailyProteinGoal,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error("Failed to get a response from the AI.");
      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate && candidate.content?.parts?.[0]?.text) {
        setInsight(candidate.content.parts[0].text);
      } else {
        throw new Error(
          "The AI response was empty or in an unexpected format."
        );
      }
    } catch (err) {
      console.error("Insight API error:", err);
      setInsightError(
        "Sorry, I couldn't generate an insight right now. Please try again later."
      );
    } finally {
      setIsInsightLoading(false);
    }
  };
  const clearInsight = () => {
    setInsight(null);
    setInsightError(null);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const renderPage = () => {
    switch (activePage) {
      case "progress":
        return (
          <ProgressPage
            userName={userName}
            historicalData={historicalData}
            dailyGoal={dailyGoal}
            dailyProteinGoal={dailyProteinGoal}
            dailyWaterGoal={dailyWaterGoal}
          />
        );
      case "diary":
        return (
          <DiaryPage
            userName={userName}
            meals={meals}
            removeMeal={removeMeal}
          />
        );
      case "home":
      default:
        return (
          <HomePage
            userName={userName}
            currentDate={currentDate}
            setIsStreakModalOpen={setIsStreakModalOpen}
            handleLogout={handleLogout}
            streakData={streakData}
            totalCalories={totalCalories}
            dailyGoal={dailyGoal}
            totalProtein={totalProtein}
            dailyProteinGoal={dailyProteinGoal}
            todaysWaterIntake={todaysWaterIntake}
            dailyWaterGoal={dailyWaterGoal}
            handleAddWater={handleAddWater}
            maintenanceCalories={maintenanceCalories}
            surveyHistory={surveyHistory}
            getMealInsights={getMealInsights}
            isInsightLoading={isInsightLoading}
            insight={insight}
            insightError={insightError}
            clearInsight={clearInsight}
            meals={meals}
            removeMeal={removeMeal}
            weeklyProgress={weeklyProgress}
          />
        );
    }
  };

  if (!isFirebaseReady || surveyHistory === undefined)
    return <FirebaseLoadingScreen />;
  if (!user) return <AuthScreen />;
  if (!surveyHistory)
    return (
      <OnboardingSurvey
        onComplete={handleSurveyComplete}
        initialName={user?.displayName || ""}
      />
    );

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main-light dark:text-text-main-dark min-h-screen">
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
                
                :root {
                    --primary: #000000;
                    --background-light: #f7f7f7;
                    --background-dark: #191919;
                    --card-light: #FFFFFF;
                    --card-dark: #234C6A;
                    --text-main-light: #1B3C53;
                    --text-main-dark: #F5F3F2;
                    --text-secondary-light: #456882;
                    --text-secondary-dark: #D2C1B6;
                    --accent: #456882;
                }
                html.dark { color-scheme: dark; }

                body { 
                    font-family: 'Inter', sans-serif;
                    min-height: 100dvh;
                }
                .bg-background-light { background-color: var(--background-light); }
                .dark .bg-background-dark { background-color: var(--background-dark); }
                .bg-card-light { background-color: var(--card-light); }
                .dark .bg-card-dark { background-color: var(--card-dark); }
                .text-text-main-light { color: var(--text-main-light); }
                .dark .text-text-main-dark { color: var(--text-main-dark); }
                .text-text-secondary-light { color: var(--text-secondary-light); }
                .dark .text-text-secondary-dark { color: var(--text-secondary-dark); }
                .text-primary { color: var(--primary); }
                .dark .text-primary { color: var(--text-main-dark); }
                .text-accent { color: var(--accent); }
                .bg-accent { background-color: var(--accent); }

                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes fade-in-scale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>

      <div className="mx-auto flex h-auto min-h-screen w-full max-w-md flex-col justify-between">
        {renderPage()}

        <NavigationBar
          activePage={activePage}
          setActivePage={setActivePage}
          onCameraClick={() => setIsAddMealModalOpen(true)}
          onProfileClick={() => setIsStreakModalOpen(true)}
        />
      </div>

      <AddMealModal
        isOpen={isAddMealModalOpen}
        onClose={() => setIsAddMealModalOpen(false)}
        onAddMeal={addMeal}
      />
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streakData={streakData}
        weeklyProgress={weeklyProgress}
        surveyHistory={surveyHistory}
      />
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
