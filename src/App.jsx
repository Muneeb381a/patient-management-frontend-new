import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  fetchSymptoms,
  fetchTests,
  fetchMedicines,
  fetchNeuroOptions,
} from "./store/slices/appDataSlice";
import TimeGreeting from "./components/TimeGreeting";
import PatientSearch from "./components/PatientSearch";
import PatientConsultation from "./components/PatientConsultation";
import PatientHistory from "./components/PatientHistoryModal";
import EditConsultation from "./components/EditConsultation";
import AddTestForm from "./components/AddTestForm";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { isLoggedIn, logout } from "./utils/auth";

const NavLink = ({ to, children, currentPath }) => {
  const navigate = useNavigate();
  const active = currentPath === to;
  return (
    <button
      onClick={() => navigate(to)}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
        active
          ? "bg-teal-600 text-white"
          : "text-gray-600 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-600"
      }`}
    >
      {children}
    </button>
  );
};

const AppShell = ({ handleLogout, darkMode, onToggleDark }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Preload all static dropdown data as soon as the user is authenticated.
  // Each thunk skips the network if data is already in Redux — so this is
  // a no-op on subsequent renders. By the time the user navigates to a
  // consultation the data is ready and the consultation page shows instantly.
  useEffect(() => {
    dispatch(fetchSymptoms());
    dispatch(fetchTests());
    dispatch(fetchMedicines());
    dispatch(fetchNeuroOptions());
  }, [dispatch]);

  // Dashboard page manages its own full-page layout; hide the global header there
  const isDashboard = location.pathname === "/dashboard";

  return (
    <>
      {!isDashboard && (
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="max-w-8xl mx-auto px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
              <NavLink to="/" currentPath={location.pathname}>Patients</NavLink>
            </div>
            <div className="flex items-center gap-3">
              <TimeGreeting locale="en-PK" timeZone="Asia/Karachi" />
              <button
                onClick={onToggleDark}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-red-300"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={<PatientSearch />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients/:patientId" element={<PatientSearch />} />
        <Route path="/patients/new" element={<PatientSearch />} />
        <Route path="/patients/:patientId/consultation" element={<PatientConsultation />} />
        <Route path="/patients/:patientId/history" element={<PatientHistory />} />
        <Route path="/patients/:patientId/consultations/:consultationId/edit" element={<EditConsultation />} />
        <Route path="/patients/:patientId/consultations/new" element={<PatientConsultation />} />
        <Route path="/patients/:patientId/tests/new" element={<AddTestForm />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("darkMode") === "true"; } catch { return false; }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try { localStorage.setItem("darkMode", String(darkMode)); } catch {}
  }, [darkMode]);

  const handleLogin = () => setLoggedIn(true);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <AppShell handleLogout={handleLogout} darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />;
};

export default App;