import React, { lazy, Suspense } from 'react'

import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Navigate } from "react-router-dom"

import SpinnerLazy from "../utilities/SpinnerLazy"
import AuthContext from '../context/authcontext'
import { useContext } from 'react';
import RoomsAssignment from '../feature/admin/views/RoomsAssignment';
import IncidentsList from '../feature/admin/views/IncidentsList';
import StaffList from '../feature/admin/views/StaffList';
import NotificationsView from '../feature/common/NotificationsView';

import { NotificationProvider } from '../context/NotificationContext';


const Login = lazy(() => import("../feature/auth/Login"));
const NotFoundPage = lazy(() => import("../components/NotFound404"))

//admin views
const AdminLayout = lazy(() => import("../feature/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("../feature/admin/views/AdminDashboard"));

//maid views
const MaidHome = lazy(() => import("../feature/maid/views/MaidHome"));
const MaidLayout = lazy(() => import("../feature/maid/MaidLayout"))
const RoomDetail = lazy(() => import("../feature/maid/views/RoomDetail"));
const QRScanner = lazy(() => import("../feature/maid/views/QRScanner"));
const Notifications = lazy(()=> import("../feature/common/NotificationsView"));
const AdminNotifications = lazy(() => import("../feature/admin/views/AdminNotifications"));


const AppRouter = () => {
    const { user, token } = useContext(AuthContext);
    const isAuthenticated = user && token;
    const role = user?.rol || localStorage.getItem("role") || null;

    const getRoutesByRole = (role) => {
        switch (role) {
            case "ROLE_ADMIN":
                return (
                    <Route
                        path='/'
                        element={
                            <Suspense fallback={<SpinnerLazy />}>
                                <AdminLayout />
                            </Suspense>
                        }
                    >
                        <Route
                            index
                            element={
                                <Suspense fallback={<SpinnerLazy />}>
                                    <AdminDashboard />
                                </Suspense>
                            }
                        />

                        <Route
                            path='/rooms'
                            element={
                                <Suspense fallback={<SpinnerLazy />}>
                                    <RoomsAssignment />
                                </Suspense>
                            }
                        />
                        <Route
                            path='/incidents'
                            element={
                                <Suspense fallback={<SpinnerLazy />}>
                                    <IncidentsList />
                                </Suspense>
                            }
                        />
                        <Route
                            path='/staff'
                            element={
                                <Suspense fallback={<SpinnerLazy />}>
                                    <StaffList />
                                </Suspense>
                            }
                        />
                        <Route
                        path='/notifications'
                        element={
                            <Suspense fallback={<SpinnerLazy/>}>
                                <AdminNotifications/>
                            </Suspense>
                        }
                        />
                    </Route>

                );
            case "ROLE_MAID":
                return (
                    <Route
                        path='/'
                        element={
                            <Suspense fallback={<SpinnerLazy />}>
                                <MaidLayout />
                            </Suspense>
                        }
                    >
                        <Route
                            index
                            element={
                                <Suspense fallback={<SpinnerLazy />}>
                                    <MaidHome />
                                </Suspense>
                            }
                        />

                        <Route
                            path='/room/:id'
                            element={
                                <Suspense fallback={<SpinnerLazy />}>
                                    <RoomDetail />
                                </Suspense>
                            }
                        />
                        <Route path="scanner" element={
                            <Suspense fallback={<SpinnerLazy />}>
                                <QRScanner />
                            </Suspense>
                        } />
                        <Route
                        path='/notifications'
                        element={
                            <Suspense fallback={<SpinnerLazy/>}>
                                <NotificationsView/>
                            </Suspense>      
                        }
                        />
                    </Route>
                );
            default:
                return (
                    <Route
                        path='/*'
                        element={
                            <Suspense fallback={<SpinnerLazy />}>
                                <Login />
                            </Suspense>
                        }
                    />
                )
        }
    };

    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                {/* Public Routes */}
                <Route
                    path='/login'
                    element={
                        <Suspense fallback={<SpinnerLazy />}>
                            {!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
                        </Suspense>
                    }
                />

                {/* Protected Routes */}
                {isAuthenticated ? getRoutesByRole(role) : <Route path="/*" element={<Navigate to="/login" replace />} />}

                {/* 404 para rutas no encontradas */}
                <Route
                    path="*"
                    element={
                        <Suspense fallback={<SpinnerLazy />}>
                            <NotFoundPage />
                        </Suspense>
                    }
                />
            </>
        )
    )

    return  <RouterProvider router={router} />


}

export default AppRouter