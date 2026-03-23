import React, { Suspense } from "react";
import PropTypes from "prop-types";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import ProtectedRoute from "./ProtectedRoute";

const Dashboard = React.lazy(() => import("../pages/Dashboard"));
const Patients = React.lazy(() => import("../pages/Patients"));
const Doctors = React.lazy(() => import("../pages/Doctors"));
const Appointments = React.lazy(() => import("../pages/Appointments"));
const Billing = React.lazy(() => import("../pages/Billing"));
const Login = React.lazy(() => import("../pages/Login"));
const Register = React.lazy(() => import("../pages/Register"));
const NotFound = React.lazy(() => import("../pages/NotFound"));
const PatientDetail = React.lazy(() => import("../pages/PatientDetail"));

function PageWrapper({ children }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton rows={6} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />
        <Route
          path="/register"
          element={
            <PageWrapper>
              <Register />
            </PageWrapper>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            }
          />
          <Route
            path="patients"
            element={
              <PageWrapper>
                <Patients />
              </PageWrapper>
            }
          />
          <Route
            path="patients/:id"
            element={
              <PageWrapper>
                <PatientDetail />
              </PageWrapper>
            }
          />
          <Route
            path="doctors"
            element={
              <PageWrapper>
                <Doctors />
              </PageWrapper>
            }
          />
          <Route
            path="appointments"
            element={
              <PageWrapper>
                <Appointments />
              </PageWrapper>
            }
          />
          <Route
            path="billing"
            element={
              <PageWrapper>
                <Billing />
              </PageWrapper>
            }
          />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Route>
        <Route
          path="/not-found"
          element={
            <PageWrapper>
              <NotFound />
            </PageWrapper>
          }
        />
        <Route
          path="*"
          element={
            <PageWrapper>
              <NotFound />
            </PageWrapper>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
