import React from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const AuthScreen = () => {
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    const auth = getAuth();
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

export default AuthScreen;
