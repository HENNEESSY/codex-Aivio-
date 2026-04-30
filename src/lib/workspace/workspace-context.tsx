import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace, WorkspaceMember, WorkspaceRole } from '@/types/aivio';
import { DEMO_WORKSPACE_ID, demoWorkspace, demoMembers } from '../demo/demo-data';

interface WorkspaceContextType {
  activeWorkspaceId: string | null;
  activeWorkspace: Workspace | null;
  currentUser: WorkspaceMember | null;
  userRole: WorkspaceRole | null;
  setActiveWorkspaceId: (id: string) => void;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(DEMO_WORKSPACE_ID);
  
  // Fake user mapping - in a real app this would come from Supabase Auth
  const currentUser = demoMembers.find(m => m.user_id === 'u-1') || null;

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    const role = currentUser.role;
    
    if (role === 'owner') return true;
    if (role === 'admin') {
      if (['manage_billing', 'delete_workspace'].includes(permission)) return false;
      return true;
    }
    if (role === 'manager') {
       const managerPerms = ['manage_deals', 'manage_contacts', 'manage_tasks', 'view_reports', 'manage_inbox'];
       return managerPerms.includes(permission);
    }
    if (role === 'viewer') {
       return permission.startsWith('view_');
    }
    return false;
  };

  return (
    <WorkspaceContext.Provider value={{
      activeWorkspaceId,
      activeWorkspace: demoWorkspace,
      currentUser,
      userRole: currentUser?.role || null,
      setActiveWorkspaceId,
      hasPermission,
      isLoading: false
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
