import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginDialog } from './LoginDialog';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Lade...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Bitte melde dich an, um auf diese Seite zuzugreifen.
            </p>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
};

