import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./authContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AppShell, {
  BookingsPage,
  DashboardPage,
  FindPage,
  MessagesPage,
  ProfilePage,
  ResourcesPage,
} from "./pages/AppShell";

export default function App() {
  const { user, restoring } = useAuth();
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/app"
        element={
          restoring ? (
            <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
              Restoring session…
            </div>
          ) : user ? (
            <AppShell />
          ) : (
            <Navigate to="/login" replace state={{ from: location }} />
          )
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="find" element={<FindPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
