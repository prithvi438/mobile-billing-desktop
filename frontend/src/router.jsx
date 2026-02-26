import { createHashRouter, Navigate } from "react-router-dom";

import ErrorScreen from "./screens/ErrorScreen";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import LandingScreen from "./screens/LandingScreen";
import DashboardScreen from "./screens/DashboardScreen.jsx";
import SalesScreen from "./screens/SalesScreen.jsx";
import CreateSalesScreen from "./screens/CreateSalesScreen.jsx";
import SalesDetailScreen from "./screens/SalesDetailScreen.jsx";
import EditSalesScreen from "./screens/EditSalesScreen.jsx";
import CustomerScreen from "./screens/customer/CustomerScreen.jsx";
import CustomerTransactionsScreen from "./screens/customer/CustomerTransactionsScreen.jsx";
import InventoryScreen from "./screens/inventory/InventoryScreen.jsx";
import CategoryScreen from "./screens/category/CategoryScreen.jsx";
import TeamScreen from "./screens/team/TeamScreen.jsx";
import ReportScreen from "./screens/reports/ReportScreen.jsx";
import SalesSummaryReportScreen from "./screens/reports/SalesSummaryReportScreen.jsx";
import StockReportScreen from "./screens/reports/StockReportScreen.jsx";
import CreditReportScreen from "./screens/reports/CreditReportScreen.jsx";
import TopSellingItemsReportScreen from "./screens/reports/TopSellingItemsReportScreen.jsx";
import LowStockReportScreen from "./screens/reports/LowStockReportScreen.jsx";
import GrossProfitReportScreen from "./screens/reports/GrossProfitReportScreen.jsx";
import TeamSalesReportScreen from "./screens/reports/TeamSalesReportScreen.jsx";
import VendorScreen from "./screens/vendor/VendorScreen.jsx";
import VendorTransactionsScreen from "./screens/vendor/VendorTransactionsScreen.jsx";
import ProtectedRoute from "./utils/ProtectedRoutes.jsx";
import NotAvailableScreen from "./screens/NotAvailableScreen.jsx";
import PurchaseScreen from "./screens/purchase/PurchaseScreen.jsx";
import CreatePurchaseScreen from "./screens/purchase/CreatePurchaseScreen.jsx";
import PurchaseDetailScreen from "./screens/purchase/PurchaseDetailScreen.jsx";
import SettingScreen from "./screens/SettingScreen.jsx";
import SubscriptionRenewScreen from "./screens/subscription/SubscriptionRenewScreen.jsx";
import SubscriptionEndScreen from "./screens/subscription/SubscriptionEndScreen.jsx";

const router = createHashRouter([
  {
    path: "/",
    element: <SplashScreen />,
  },
  {
    path: "/login",
    element: <LoginScreen />,
  },
  {
    path: "/subscription-renew",
    element: <SubscriptionRenewScreen />,
  },
  {
    path: "/subscription-end",
    element: <SubscriptionEndScreen />,
  },
  {
    path: "/landing",
    element: (
      <ProtectedRoute>
        <LandingScreen />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardScreen />
      },
      {
        path: "sales",
        element: <SalesScreen />
      },
      {
        path: "sales/create-sales",
        element: <CreateSalesScreen />
      },
      {
        path: "sales-details",
        element: <SalesDetailScreen />
      },
      {
        path: "sales/edit-sales",
        element: <EditSalesScreen />
      },
      {
        path: "customers",
        element: <CustomerScreen />
      },
      {
        path: "customers/:id/transactions",
        element: <CustomerTransactionsScreen />
      },
      {
        path: "purchase",
        element: <PurchaseScreen />
      },
       {
        path: "purchase/create-purchase",
        element: <CreatePurchaseScreen />
      },
      {
        path: "purchase-details",
        element: <PurchaseDetailScreen />
      },
      {
        path: "vendors",
        element: <VendorScreen />
      },
      {
        path: "vendors/:id/transactions",
        element: <VendorTransactionsScreen />
      },
      {
        path: "inventory",
        element: <InventoryScreen />
      },
      {
        path: "categories",
        element: <CategoryScreen />
      },
      {
        path: "teams",
        element: <TeamScreen />
      },
      {
        path: "reports",
        element: <ReportScreen />,
      },
      {
        path: "reports/sales-summary",
        element: <SalesSummaryReportScreen />
      },
      {
        path: "reports/stock-report",
        element: <StockReportScreen />
      },
      {
        path: "reports/credit-report",
        element: <CreditReportScreen />
      },
      {
        path: "reports/top-selling",
        element: <TopSellingItemsReportScreen />
      },
      {
        path: "reports/low-stock",
        element: <LowStockReportScreen />
      },
      {
        path: "reports/gross-profit",
        element: <GrossProfitReportScreen />
      },
      {
        path: "reports/team-sales",
        element: <TeamSalesReportScreen />
      },
      {
        path: "settings",
        element: <SettingScreen />
      },
    ]
  },
  {
  path: "*",
  element: <NotAvailableScreen />,
}
]);

export default router;