import { Navigate } from "react-router-dom";
import { canAccess, getSession, routeForRole } from "../servicos/access-control.js";

export default function ProtectedRoute({ role, children }) {
    const session = getSession();
    if (!session) return <Navigate to="/perfil" replace />;
    if (!canAccess(routeForRole(role), session)) return <Navigate to={routeForRole(session.role)} replace />;
    return children;
}
