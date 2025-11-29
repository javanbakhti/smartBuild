import React, { createContext, useContext } from 'react';
    import { useMemberManagement } from '@/hooks/useMemberManagement';

    const MemberManagementContext = createContext(null);

    export const useMemberContext = () => {
        const context = useContext(MemberManagementContext);
        if (!context) {
            throw new Error('useMemberContext must be used within a MemberManagementProvider');
        }
        return context;
    };

    export const MemberManagementProvider = ({ children, user }) => {
        const memberManagementData = useMemberManagement(user);
        return (
            <MemberManagementContext.Provider value={memberManagementData}>
                {children}
            </MemberManagementContext.Provider>
        );
    };