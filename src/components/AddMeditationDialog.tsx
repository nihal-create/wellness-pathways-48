import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';


interface AddMeditationDialogProps {
  onMeditationAdded: () => void;
}

export function AddMeditationDialog({ onMeditationAdded }: AddMeditationDialogProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meditationData, setMeditationData] = useState({
    duration_minutes: '',
    type: 'mindfulness',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from('meditation_sessions')
      .insert({
        user_id: user.id,
        duration_minutes: parseInt(meditationData.duration_minutes),
        type: meditationData.type,
        notes: meditationData.notes || null,
        logged_at: new Date().toISOString()
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add meditation session. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Meditation logged!",
        description: `${meditationData.duration_minutes} minutes of ${meditationData.type} meditation added.`,
      });
      setMeditationData({
        duration_minutes: '',
        type: 'mindfulness',
        notes: ''
      });
      setOpen(false);
      onMeditationAdded();
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="shadow-soft">
        <Plus className="h-4 w-4 mr-2" />
        Add Session
      </Button>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="p-0">
            <DrawerHeader>
              <DrawerTitle>Log Meditation Session</DrawerTitle>
            </DrawerHeader>
            <div className="sm:max-w-md p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input id="duration" type="number" value={meditationData.duration_minutes} onChange={(e) => setMeditationData({ ...meditationData, duration_minutes: e.target.value })} placeholder="10" required min="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meditation-type">Type</Label>
                  <Select value={meditationData.type} onValueChange={(value) => setMeditationData({ ...meditationData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meditation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mindfulness">Mindfulness</SelectItem>
                      <SelectItem value="breathing">Breathing</SelectItem>
                      <SelectItem value="body_scan">Body Scan</SelectItem>
                      <SelectItem value="loving_kindness">Loving Kindness</SelectItem>
                      <SelectItem value="visualization">Visualization</SelectItem>
                      <SelectItem value="mantra">Mantra</SelectItem>
                      <SelectItem value="movement">Movement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meditation-notes">Notes (optional)</Label>
                  <Textarea id="meditation-notes" value={meditationData.notes} onChange={(e) => setMeditationData({ ...meditationData, notes: e.target.value })} placeholder="How was your session? Any insights?" rows={3} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>{loading ? "Logging..." : "Log Session"}</Button>
                </div>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent className="sm:max-w-md" side="right">
            <SheetHeader>
              <SheetTitle>Log Meditation Session</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input id="duration" type="number" value={meditationData.duration_minutes} onChange={(e) => setMeditationData({ ...meditationData, duration_minutes: e.target.value })} placeholder="10" required min="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meditation-type">Type</Label>
                  <Select value={meditationData.type} onValueChange={(value) => setMeditationData({ ...meditationData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meditation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mindfulness">Mindfulness</SelectItem>
                      <SelectItem value="breathing">Breathing</SelectItem>
                      <SelectItem value="body_scan">Body Scan</SelectItem>
                      <SelectItem value="loving_kindness">Loving Kindness</SelectItem>
                      <SelectItem value="visualization">Visualization</SelectItem>
                      <SelectItem value="mantra">Mantra</SelectItem>
                      <SelectItem value="movement">Movement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meditation-notes">Notes (optional)</Label>
                  <Textarea id="meditation-notes" value={meditationData.notes} onChange={(e) => setMeditationData({ ...meditationData, notes: e.target.value })} placeholder="How was your session? Any insights?" rows={3} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>{loading ? "Logging..." : "Log Session"}</Button>
                </div>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}