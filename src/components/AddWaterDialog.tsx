import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AddWaterDialogProps {
  onWaterAdded: () => void;
}

export function AddWaterDialog({ onWaterAdded }: AddWaterDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [glasses, setGlasses] = useState('1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from('water_intake')
      .insert({
        user_id: user.id,
        glasses: parseInt(glasses),
        logged_at: new Date().toISOString()
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add water intake. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Water logged!",
        description: `${glasses} glass${parseInt(glasses) > 1 ? 'es' : ''} of water added.`,
      });
      setGlasses('1');
      setOpen(false);
      onWaterAdded();
    }
  };

  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);

  const handleQuickAdd = async () => {
    if (!user || !selectedQuickAmount) return;

    setLoading(true);

    const { error } = await supabase
      .from('water_intake')
      .insert({
        user_id: user.id,
        glasses: selectedQuickAmount,
        logged_at: new Date().toISOString()
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add water intake. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Water logged!",
        description: `${selectedQuickAmount} glass${selectedQuickAmount > 1 ? 'es' : ''} of water added.`,
      });
      setSelectedQuickAmount(null);
      setOpen(false);
      onWaterAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="shadow-soft">
          <Plus className="h-4 w-4 mr-2" />
          Add Water
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Water Intake</DialogTitle>
        </DialogHeader>
        
        {/* Quick Add Buttons */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Quick Add</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map((count) => (
                <Button
                  key={count}
                  variant={selectedQuickAmount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedQuickAmount(count)}
                  className="flex-1"
                >
                  {count} glass{count > 1 ? 'es' : ''}
                </Button>
              ))}
            </div>
            {selectedQuickAmount && (
              <Button 
                onClick={handleQuickAdd}
                disabled={loading}
                className="w-full mt-3"
              >
                {loading ? "Adding..." : `Add ${selectedQuickAmount} glass${selectedQuickAmount > 1 ? 'es' : ''}`}
              </Button>
            )}
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="glasses">Number of Glasses *</Label>
              <Input
                id="glasses"
                type="number"
                value={glasses}
                onChange={(e) => setGlasses(e.target.value)}
                placeholder="1"
                required
                min="1"
                max="20"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Water"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}