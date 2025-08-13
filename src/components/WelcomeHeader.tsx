import type { Profile } from "@/hooks/useProfile";

interface WelcomeHeaderProps {
  profile: Profile | null;
}

export function WelcomeHeader({ profile }: WelcomeHeaderProps) {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  
  const displayName = profile?.display_name || "there";

  return (
    <div className="bg-gradient-hero p-4 md:p-6 rounded-2xl shadow-soft mb-4 md:mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {greeting}, {displayName} 👋
          </h1>
          <p className="text-muted-foreground">
            Let's make today healthier together
          </p>
        </div>
        {/* <div className="animate-gentle-bounce">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-soft">
            <span className="text-xl">🏃‍♂️</span>
          </div>
        </div> */}
      </div>
    </div>
  );
}