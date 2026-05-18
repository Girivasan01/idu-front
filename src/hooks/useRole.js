import { useState, useEffect } from 'react';

const useRole = () => {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getRole = () => {
      try {
        const authData = window.localStorage.getItem('auth');
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed && parsed.current) {
            setRole(parsed.current.role);
          }
        }
      } catch (error) {
        console.error('Error getting role from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getRole();
  }, []);

  const isAdmin = role === 'admin' || role === 'owner';
  const isStaff = role === 'staff';

  return { role, isAdmin, isStaff, isLoading };
};

export default useRole;

