import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ children }) => localStorage.getItem("accessToken") ? children : <Navigate to="/login" replace />;
export default ProtectedRoute;
