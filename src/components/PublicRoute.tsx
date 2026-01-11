import { supabase } from '@/App';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function checkUser() {
    setIsLoading(true);
    const { data } = await supabase.auth.getSession();

    if (data?.session) {
      navigate('/dashboard');
    }

    setIsLoading(false);

  }

  useEffect(() => {
    checkUser();
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PublicRoute;
