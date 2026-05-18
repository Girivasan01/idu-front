import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';

/**
 * ProtectedRoute component for role-based access control
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route
 *                                   If not provided, all authenticated users can access
 * @param {string} redirectPath - Path to redirect to if access is denied (default: '/')
 */
export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectPath = '/' 
}) {
  const currentAdmin = useSelector(selectCurrentAdmin);
  
  // If no user is logged in, redirect to login
  if (!currentAdmin || !currentAdmin._id) {
    return <Navigate to="/login" replace />;
  }
  
  // If allowedRoles is specified, check user's role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = currentAdmin.role;
    
    if (!allowedRoles.includes(userRole)) {
      // User doesn't have the required role
      // Redirect based on role - staff goes to /customer
      if (userRole === 'staff') {
        return <Navigate to="/staff-dashboard" replace />;
      }
      // Default redirect for unauthorized access
      return <Navigate to="/" replace />;
    }
  }
  
  // User is authorized
  return children;
}

