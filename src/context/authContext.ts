import type { Session, User } from '@supabase/supabase-js';
import { createContext } from 'react';

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
