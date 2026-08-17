import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

import ProtectedLayout from "./components/layout/ProtectedLayout";

import Vehicles from "./pages/Vehicles/Vehicles";
import AddVehicle from "./pages/Vehicles/AddVehicle";
import EditVehicle from "./pages/Vehicles/EditVehicle";

import PUC from "./pages/PUC/PUC";
import AddPuc from "./pages/PUC/AddPuc";
import EditPuc from "./pages/PUC/EditPuc";
import PucDetails from "./pages/PUC/PucDetails";

import Insurance from "./pages/Insurance/Insurance";
import AddInsurance from "./pages/Insurance/AddInsurance";
import EditInsurance from "./pages/Insurance/EditInsurance";
import InsuranceDetails from "./pages/Insurance/InsuranceDetails";

import Reports from "./pages/Reports/Reports";

import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
}

function App() {
  return (
    <Routes>

      {/* Public */}

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Application */}

      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Vehicles */}

        <Route
          path="/vehicles"
          element={<Vehicles />}
        />

        <Route
          path="/vehicles/add"
          element={<AddVehicle />}
        />

        <Route
          path="/vehicles/edit/:id"
          element={<EditVehicle />}
        />

        {/* PUC */}

        <Route
          path="/puc"
          element={<PUC />}
        />

        <Route
          path="/puc/add"
          element={<AddPuc />}
        />

        <Route
          path="/puc/details/:vehicleId"
          element={<PucDetails />}
        />

        <Route
          path="/puc/edit/:pucId"
          element={<EditPuc />}
        />

        {/* INSURANCE */}

        <Route
          path="/insurance"
          element={<Insurance />}
        />

        <Route
          path="/insurance/add"
          element={<AddInsurance />}
        />

        <Route
          path="/insurance/edit/:vehicleId"
          element={<EditInsurance />}
        />

        <Route
          path="/insurance/details/:vehicleId"
          element={<InsuranceDetails />}
        />

        {/* REPORTS */}


        <Route
          path="/reports"
          element={<Reports />}
        />

      </Route>

      {/* Fallback */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;