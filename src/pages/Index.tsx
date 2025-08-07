import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from "@/components/Dashboard";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (!profileLoading && user && (!profile || !profile.display_name)) {
      navigate('/onboarding');
      return;
    }
  }, [user, profile, authLoading, profileLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your health tracker...</p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default Index;
