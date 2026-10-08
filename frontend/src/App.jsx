import { AppProviders } from "./app/providers/index.jsx";
import AppRoutes from "./app/routes/AppRoutes.jsx";
import { ENV_ERROR } from "./app/config/env.js";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";

export default function App() {
  return (
    <ErrorBoundary>
    <div className="w-auto min-h-screen">
      {ENV_ERROR ? (
        <p role="alert" style={{ background: '#7C1D1D', color: '#fff', padding: '8px 12px', fontSize: 12, textAlign: 'center' }}>
          {ENV_ERROR}
        </p>
      ) : null}
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </div>
    </ErrorBoundary>
  );
}