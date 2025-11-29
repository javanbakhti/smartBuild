import React, { createContext, useContext, useState, useEffect } from 'react';

const PermissionContext = createContext();

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children, user }) => {
  const [permissions, setPermissions] = useState({});
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'manager') {
        setIsManager(true);
        setPermissions({}); // Managers have all permissions
      } else if (user.role === 'admin' && user.roleId && user.buildingUid) {
        setIsManager(false);
        const roles = JSON.parse(localStorage.getItem(`buildingAdminRoles_${user.buildingUid}`)) || [];
        const userRole = roles.find(role => role.id === user.roleId);
        setPermissions(userRole ? userRole.permissions : {});
      } else {
        setIsManager(false);
        setPermissions({});
      }
    }
  }, [user]);

  const hasPermission = (category, action) => {
    if (isManager) {
      return true; // Managers can do everything
    }
    if (!permissions[category] || !permissions[category][action]) {
      return false;
    }
    return permissions[category][action];
  };

  const value = { permissions, hasPermission, isManager };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};