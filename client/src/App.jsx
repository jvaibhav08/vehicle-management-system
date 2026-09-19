import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import VerifyEmail from "./pages/Auth/VerifyEmail";

import Dashboard from "./pages/Dashboard/Dashboard";

import ProtectedLayout from "./components/layout/ProtectedLayout";

import Vehicles from "./pages/Vehicles/Vehicles";
import AddVehicle from "./pages/Vehicles/AddVehicle";
import EditVehicle from "./pages/Vehicles/EditVehicle";

import PUC from "./pages/puc/PUC";
import AddPuc from "./pages/puc/AddPuc";
import EditPuc from "./pages/puc/EditPuc";
import PucDetails from "./pages/puc/PucDetails";

import Insurance from "./pages/Insurance/Insurance";
import AddInsurance from "./pages/Insurance/AddInsurance";
import EditInsurance from "./pages/Insurance/EditInsurance";
import InsuranceDetails from "./pages/Insurance/InsuranceDetails";

import Settings from "./pages/Settings/Settings";
import Reports from "./pages/Reports/Reports";

import { useAuth } from "./context/AuthContext";


// ======================================================
// PROTECTED ROUTE
// ======================================================

function ProtectedRoute({ children }) {

    const { isAuthenticated, loading } = useAuth();

    // --------------------------------------------------
    // Wait for authentication state
    // --------------------------------------------------

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        );

    }

    // --------------------------------------------------
    // Allow authenticated users
    // Otherwise redirect to login
    // --------------------------------------------------

    return isAuthenticated ? (

        children

    ) : (

        <Navigate
            to="/login"
            replace
        />

    );

}


// ======================================================
// PUBLIC ROUTE
// ======================================================

function PublicRoute({ children }) {

    const { isAuthenticated, loading } = useAuth();

    // --------------------------------------------------
    // Wait for authentication state
    // --------------------------------------------------

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        );

    }

    // --------------------------------------------------
    // Prevent authenticated users from opening
    // authentication pages
    // --------------------------------------------------

    return isAuthenticated ? (

        <Navigate
            to="/dashboard"
            replace
        />

    ) : (

        children

    );

}


// ======================================================
// APP ROUTES
// ======================================================

function App() {

    return (

        <Routes>

            {/* ==================================================
                PUBLIC ROUTES
            ================================================== */}

            {/* LOGIN */}

            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />


            {/* SIGNUP */}

            <Route
                path="/signup"
                element={
                    <PublicRoute>
                        <Signup />
                    </PublicRoute>
                }
            />


            {/* EMAIL VERIFICATION */}

            <Route
                path="/verify-email"
                element={
                    <PublicRoute>
                        <VerifyEmail />
                    </PublicRoute>
                }
            />


            {/* ==================================================
                PROTECTED APPLICATION
            ================================================== */}

            <Route
                element={
                    <ProtectedRoute>
                        <ProtectedLayout />
                    </ProtectedRoute>
                }
            >

                {/* ==================================================
                    DASHBOARD
                ================================================== */}

                <Route
                    path="/dashboard"
                    element={
                        <Dashboard />
                    }
                />


                {/* ==================================================
                    VEHICLES
                ================================================== */}

                <Route
                    path="/vehicles"
                    element={
                        <Vehicles />
                    }
                />

                <Route
                    path="/vehicles/add"
                    element={
                        <AddVehicle />
                    }
                />

                <Route
                    path="/vehicles/edit/:id"
                    element={
                        <EditVehicle />
                    }
                />


                {/* ==================================================
                    PUC
                ================================================== */}

                <Route
                    path="/puc"
                    element={
                        <PUC />
                    }
                />

                <Route
                    path="/puc/add"
                    element={
                        <AddPuc />
                    }
                />

                <Route
                    path="/puc/details/:vehicleId"
                    element={
                        <PucDetails />
                    }
                />

                <Route
                    path="/puc/edit/:pucId"
                    element={
                        <EditPuc />
                    }
                />


                {/* ==================================================
                    INSURANCE
                ================================================== */}

                <Route
                    path="/insurance"
                    element={
                        <Insurance />
                    }
                />

                <Route
                    path="/insurance/add"
                    element={
                        <AddInsurance />
                    }
                />

                <Route
                    path="/insurance/edit/:vehicleId"
                    element={
                        <EditInsurance />
                    }
                />

                <Route
                    path="/insurance/details/:vehicleId"
                    element={
                        <InsuranceDetails />
                    }
                />


                {/* ==================================================
                    REPORTS
                ================================================== */}

                <Route
                    path="/reports"
                    element={
                        <Reports />
                    }
                />


                {/* ==================================================
                    SETTINGS
                ================================================== */}

                <Route
                    path="/settings"
                    element={
                        <Settings />
                    }
                />

            </Route>


            {/* ==================================================
                FALLBACK
            ================================================== */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>

    );

}

export default App;