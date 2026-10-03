import { createBrowserRouter } from 'react-router-dom'

import { ProtectedRoute, RoleRoute } from './guards'
import { AppLayout } from '../layouts/AppLayout'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DevicesPage } from '../pages/DevicesPage'
import { DeviceDetailPage } from '../pages/DeviceDetailPage'
import { EmergenciesPage } from '../pages/EmergenciesPage'
import { OperationsPage } from '../pages/OperationsPage'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { BuildingAdminPage } from '../pages/BuildingAdminPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SimulationPage } from '../pages/SimulationPage'
import { SubscriptionPage } from '../pages/SubscriptionPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'simulation', element: <SimulationPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'devices', element: <DevicesPage /> },
      { path: 'devices/:id', element: <DeviceDetailPage /> },
      {
        path: 'building-admin',
        element: (
          <RoleRoute allowedRoles={['BUILDING_ADMIN', 'B2B_ADMIN', 'SYSTEM_ADMIN']}>
            <BuildingAdminPage />
          </RoleRoute>
        ),
      },
      {
        path: 'emergencies',
        element: (
          <RoleRoute allowedRoles={['HOMEOWNER', 'OWNER', 'RENTER', 'B2B_ADMIN', 'BUILDING_ADMIN', 'SYSTEM_ADMIN']}>
            <EmergenciesPage />
          </RoleRoute>
        ),
      },
      { path: 'operations', element: <OperationsPage /> },
      { path: 'subscription', element: <SubscriptionPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
])
