import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Brain, Dumbbell, Droplets, Search, Utensils, X } from "lucide-react";
import { indianFoods } from "@/data/indianFoods";
import { workoutTypes } from "@/data/workouts";
import { useNavigate } from "react-router-dom";
import type { Meal, Workout } from "@/hooks/useTrackerData";

interface AddEntryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAnyAdded: () => void;
    startMode?: Exclude<Mode, "select">;
    editMeal?: Meal;
    editWorkout?: Workout;
}

type Mode = "select" | "meal" | "workout" | "water" | "meditation";

export function AddEntryDrawer({
    open,
    onOpenChange,
    onAnyAdded,
    startMode,
    editMeal,
    editWorkout,
}: AddEntryDrawerProps) {
    const isMobile = useIsMobile();
    const [mode, setMode] = useState<Mode>("select");

    useEffect(() => {
        if (open && startMode) {
            setMode(startMode);
        }
    }, [open, startMode]);

    const handleClose = () => {
        setMode("select");
        onOpenChange(false);
    };

    const Container = isMobile ? Drawer : Sheet;
    const Header = isMobile ? DrawerHeader : SheetHeader;
    const Title: typeof DrawerTitle | typeof SheetTitle = isMobile
        ? DrawerTitle
        : SheetTitle;
    const Content = ({ children }: { children: ReactNode }) =>
        isMobile ? (
            <DrawerContent className="p-0 min-h-[40vh] flex flex-col">
                {children}
            </DrawerContent>
        ) : (
            <SheetContent side="right" className="w-full sm:max-w-md">
                {children}
            </SheetContent>
        );

    return (
        <Container
            open={open}
            onOpenChange={(v: boolean) => (v ? onOpenChange(v) : handleClose())}
        >
            <Content>
                <Header>
                    <Title>
                        {mode === "select"
                            ? "What do you want to log?"
                            : getTitle(mode)}
                    </Title>
                </Header>

                <div className="p-4 flex-1 flex flex-col">
                    {mode === "select" ? (
                        <SelectGrid onPick={(m) => setMode(m)} />
                    ) : (
                        <div className="space-y-4 flex-1 flex flex-col">
                            {/* <Button variant="ghost" size="sm" onClick={() => setMode("select")}>Back</Button> */}
                            {mode === "water" && (
                                <WaterForm
                                    onClose={handleClose}
                                    onAdded={onAnyAdded}
                                />
                            )}
                            {mode === "meditation" && (
                                <MeditationForm
                                    onClose={handleClose}
                                    onAdded={onAnyAdded}
                                />
                            )}
                            {mode === "workout" && (
                                <WorkoutForm
                                    onClose={handleClose}
                                    onAdded={onAnyAdded}
                                    editWorkout={editWorkout}
                                />
                            )}
                            {mode === "meal" && (
                                <MealForm
                                    onClose={handleClose}
                                    onAdded={onAnyAdded}
                                    editMeal={editMeal}
                                />
                            )}
                        </div>
                    )}
                </div>
            </Content>
        </Container>
    );
}

function getTitle(mode: Mode) {
    switch (mode) {
        case "meal":
            return "Log New Meal";
        case "workout":
            return "Log New Workout";
        case "water":
            return "Log Water Intake";
        case "meditation":
            return "Log Meditation Session";
        default:
            return "Add Entry";
    }
}

function SelectGrid({
    onPick,
}: {
    onPick: (m: Exclude<Mode, "select">) => void;
}) {
    const items = [
        { key: "meal" as const, label: "Meals", icon: Utensils },
        { key: "workout" as const, label: "Workout", icon: Dumbbell },
        { key: "water" as const, label: "Water", icon: Droplets },
        { key: "meditation" as const, label: "Meditation", icon: Brain },
    ];
    return (
        <div className="grid grid-cols-2 gap-3">
            {items.map(({ key, label, icon: Icon }) => (
                <Button
                    key={key}
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => onPick(key)}
                >
                    <Icon className="h-6 w-6" />
                    <span className="mt-1 text-sm font-medium">{label}</span>
                </Button>
            ))}
        </div>
    );
}

function WaterForm({
    onClose,
    onAdded,
}: {
    onClose: () => void;
    onAdded: () => void;
}) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [glasses, setGlasses] = useState("1");
    const [selectedQuickAmount, setSelectedQuickAmount] = useState<
        number | null
    >(null);

    const insert = async (count: number) => {
        if (!user) return;
        setLoading(true);
        const { error } = await supabase.from("water_intake").insert({
            user_id: user.id,
            glasses: count,
            logged_at: new Date().toISOString(),
        });
        setLoading(false);
        if (error) {
            toast({
                title: "Error",
                description: "Failed to add water intake.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Water logged!",
                description: `${count} glass${count > 1 ? "es" : ""} added.`,
            });
            onAdded();
            onClose();
        }
    };

    const handleSubmit = () => {
        const amount = selectedQuickAmount || parseInt(glasses);
        if (amount > 0) {
            insert(amount);
        }
    };

    return (
        <div className="flex-1 flex flex-col space-y-4">
            <div>
                <Label className="text-sm font-medium">Quick Add</Label>
                <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4].map((count) => (
                        <Button
                            key={count}
                            variant={
                                selectedQuickAmount === count
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() => {
                                setSelectedQuickAmount(count);
                                setGlasses(count.toString());
                            }}
                            className="flex-1"
                        >
                            {count} glass{count > 1 ? "es" : ""}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="glasses">Number of Glasses *</Label>
                    <Input
                        id="glasses"
                        type="number"
                        value={glasses}
                        onChange={(e) => {
                            setGlasses(e.target.value);
                            setSelectedQuickAmount(null);
                        }}
                        placeholder="1"
                        required
                        min={1}
                        max={20}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !glasses || parseInt(glasses) <= 0}
                        className="w-full sm:w-auto"
                    >
                        {loading ? "Adding..." : "Add Water"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function MeditationForm({
    onClose,
    onAdded,
}: {
    onClose: () => void;
    onAdded: () => void;
}) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [meditationData, setMeditationData] = useState({
        duration_minutes: "",
        type: "mindfulness",
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        const { error } = await supabase.from("meditation_sessions").insert({
            user_id: user.id,
            duration_minutes: parseInt(meditationData.duration_minutes),
            type: meditationData.type,
            notes: meditationData.notes || null,
            logged_at: new Date().toISOString(),
        });
        setLoading(false);
        if (error) {
            toast({
                title: "Error",
                description: "Failed to add meditation session.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Meditation logged!",
                description: `${meditationData.duration_minutes} minutes added.`,
            });
            onAdded();
            onClose();
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col space-y-4"
        >
            <div className="space-y-2">
                <Label htmlFor="med-duration">Duration (minutes) *</Label>
                <Input
                    id="med-duration"
                    type="number"
                    value={meditationData.duration_minutes}
                    onChange={(e) =>
                        setMeditationData({
                            ...meditationData,
                            duration_minutes: e.target.value,
                        })
                    }
                    placeholder="10"
                    required
                    min={1}
                />
            </div>
            <div className="space-y-2">
                <Label>Type</Label>
                <Select
                    value={meditationData.type}
                    onValueChange={(v) =>
                        setMeditationData({ ...meditationData, type: v })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select meditation type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mindfulness">Mindfulness</SelectItem>
                        <SelectItem value="breathing">Breathing</SelectItem>
                        <SelectItem value="body_scan">Body Scan</SelectItem>
                        <SelectItem value="loving_kindness">
                            Loving Kindness
                        </SelectItem>
                        <SelectItem value="visualization">
                            Visualization
                        </SelectItem>
                        <SelectItem value="mantra">Mantra</SelectItem>
                        <SelectItem value="movement">Movement</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="med-notes">Notes (optional)</Label>
                <Textarea
                    id="med-notes"
                    value={meditationData.notes}
                    onChange={(e) =>
                        setMeditationData({
                            ...meditationData,
                            notes: e.target.value,
                        })
                    }
                    rows={3}
                    placeholder="How was your session? Any insights?"
                />
            </div>
            <div className="flex justify-end gap-2">
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto"
                >
                    {loading ? "Logging..." : "Log Session"}
                </Button>
            </div>
        </form>
    );
}

function WorkoutForm({
    onClose,
    onAdded,
    editWorkout,
}: {
    onClose: () => void;
    onAdded: () => void;
    editWorkout?: Workout;
}) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [workoutData, setWorkoutData] = useState({
        name: "",
        type: "",
        duration_minutes: "",
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (editWorkout) {
            setWorkoutData({
                name: editWorkout.name || "",
                type: editWorkout.type || "",
                duration_minutes: String(editWorkout.duration_minutes ?? ""),
            });
        }
    }, [editWorkout]);

    const filteredWorkouts = workoutTypes.filter((w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const selectedWorkout = workoutTypes.find(
        (w) => w.name === workoutData.type
    );
    const estimatedCalories =
        selectedWorkout && workoutData.duration_minutes
            ? Math.round(
                  selectedWorkout.caloriesPerMinute *
                      parseInt(workoutData.duration_minutes)
              )
            : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedWorkout) return;
        setLoading(true);
        if (editWorkout) {
            const { error } = await supabase
                .from("workouts")
                .update({
                    name: selectedWorkout.name, // Always use the selected workout type's name
                    type: workoutData.type,
                    duration_minutes: parseInt(workoutData.duration_minutes),
                    calories_burned: estimatedCalories,
                })
                .eq("id", editWorkout.id);
            setLoading(false);
            if (error) {
                toast({
                    title: "Error",
                    description: "Failed to update workout.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Workout updated!",
                    description: `${selectedWorkout.name} updated.`,
                });
                onAdded();
                onClose();
            }
        } else {
            const { error } = await supabase.from("workouts").insert({
                user_id: user.id,
                name: selectedWorkout.name, // Always use the selected workout type's name
                type: workoutData.type,
                duration_minutes: parseInt(workoutData.duration_minutes),
                calories_burned: estimatedCalories,
                logged_at: new Date().toISOString(),
            });
            setLoading(false);
            if (error) {
                toast({
                    title: "Error",
                    description: "Failed to log workout.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Workout logged!",
                    description: `${selectedWorkout.name} logged.`,
                });
                onAdded();
                onClose();
                navigate("/workouts");
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col space-y-4">
            {!workoutData.type && (
                <>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search workouts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 p-1">
                        {searchQuery &&
                            filteredWorkouts.map((workout) => (
                                <Card
                                    key={workout.id}
                                    className="cursor-pointer transition-colors w-full hover:bg-accent/50"
                                    onClick={() => {
                                        setWorkoutData({
                                            ...workoutData,
                                            type: workout.name,
                                        });
                                        setSearchQuery("");
                                    }}
                                >
                                    <CardContent className="p-3">
                                        <div className="flex justify-between items-start gap-2 min-w-0">
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <h4 className="font-medium text-sm truncate">
                                                    {workout.name}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {workout.caloriesPerMinute}{" "}
                                                    cal/min
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="text-xs shrink-0"
                                            >
                                                {workout.category}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        {searchQuery && filteredWorkouts.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">
                                No workouts found
                            </p>
                        )}
                    </div>
                </>
            )}

            {workoutData.type && (
                <Card className="w-full">
                    <CardContent className="p-3">
                        <div className="flex justify-between items-start gap-2 min-w-0">
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <h4 className="font-medium text-sm truncate">
                                    {selectedWorkout?.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {selectedWorkout?.caloriesPerMinute} cal/min
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className="text-xs">
                                    {selectedWorkout?.category}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setWorkoutData({
                                            ...workoutData,
                                            type: "",
                                        });
                                        setSearchQuery("");
                                    }}
                                    className="h-6 w-6 p-0"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <form
                onSubmit={handleSubmit}
                className="flex-1 flex flex-col space-y-4 justify-between"
            >
                {/* <div className="space-y-2">
            <Label htmlFor="workout-name">Custom Name (optional)</Label>
            <Input
              id="workout-name"
              value={workoutData.name}
              onChange={(e) => setWorkoutData({ ...workoutData, name: e.target.value })}
              placeholder="e.g., Morning Jog"
            />
          </div> */}
                {workoutData.type && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="workout-duration">
                                Duration (minutes) *
                            </Label>
                            <Input
                                id="workout-duration"
                                type="number"
                                value={workoutData.duration_minutes}
                                onChange={(e) =>
                                    setWorkoutData({
                                        ...workoutData,
                                        duration_minutes: e.target.value,
                                    })
                                }
                                placeholder="30"
                                required
                            />
                        </div>
                        {selectedWorkout && workoutData.duration_minutes && (
                            <Card className="p-3 bg-accent/20">
                                <h4 className="font-medium text-sm mb-2">
                                    Estimated Calories Burned
                                </h4>
                                <p className="text-2xl font-bold text-primary">
                                    {estimatedCalories}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Based on {selectedWorkout.caloriesPerMinute}{" "}
                                    cal/min × {workoutData.duration_minutes} min
                                </p>
                            </Card>
                        )}
                    </>
                )}

                <div className="flex justify-end gap-2 mt-auto">
                    <Button
                        type="submit"
                        disabled={
                            loading ||
                            !workoutData.type ||
                            !workoutData.duration_minutes
                        }
                        className="w-full sm:w-auto"
                    >
                        {loading
                            ? editWorkout
                                ? "Updating..."
                                : "Logging..."
                            : editWorkout
                            ? "Update Workout"
                            : "Log Workout"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

interface SelectedFood {
    id: string;
    name: string;
    quantity: number;
    calories: number;
    protein: number;
    carbs: number;
    standardQuantity: string;
    fat: number;
    fiber: number;
}

function MealForm({
    onClose,
    onAdded,
    editMeal,
}: {
    onClose: () => void;
    onAdded: () => void;
    editMeal?: Meal;
}) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);

    const navigate = useNavigate();

    const filteredFoods = indianFoods.filter((food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (editMeal) {
            const parsed: SelectedFood[] = [];
            const parts = editMeal.name.split(",").map((p) => p.trim());
            for (const part of parts) {
                const m = part.match(/^(.*) \((\d+)x\)$/);
                if (m) {
                    const foodName = m[1];
                    const qty = parseInt(m[2]);
                    const found = indianFoods.find((f) => f.name === foodName);
                    if (found) {
                        parsed.push({ ...found, quantity: qty });
                    }
                }
            }
            if (parsed.length > 0) {
                setSelectedFoods(parsed);
            } else {
                // Fallback single custom entry matching totals
                setSelectedFoods([
                    {
                        id: "custom",
                        name: editMeal.name,
                        quantity: 1,
                        calories: editMeal.calories,
                        protein: editMeal.protein || 0,
                        carbs: editMeal.carbs || 0,
                        fat: editMeal.fat || 0,
                        fiber: editMeal.fiber || 0,
                        standardQuantity: "custom",
                    },
                ]);
            }
        }
    }, [editMeal]);

    const addFood = (food: (typeof indianFoods)[0]) => {
        const existing = selectedFoods.find((f) => f.id === food.id);
        if (existing) {
            setSelectedFoods((prev) =>
                prev.map((f) =>
                    f.id === food.id ? { ...f, quantity: f.quantity + 1 } : f
                )
            );
        } else {
            setSelectedFoods((prev) => [...prev, { ...food, quantity: 1 }]);
        }
        setSearchQuery("");
    };

    const updateQty = (id: string, qty: number) => {
        if (qty <= 0) {
            setSelectedFoods((prev) => prev.filter((f) => f.id !== id));
            return;
        }
        setSelectedFoods((prev) =>
            prev.map((f) => (f.id === id ? { ...f, quantity: qty } : f))
        );
    };

    const totals = selectedFoods.reduce(
        (t, f) => ({
            calories: t.calories + f.calories * f.quantity,
            protein: t.protein + f.protein * f.quantity,
            carbs: t.carbs + f.carbs * f.quantity,
            fat: t.fat + f.fat * f.quantity,
            fiber: t.fiber + f.fiber * f.quantity,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const handleSubmit = async () => {
        if (!user || selectedFoods.length === 0) return;
        setLoading(true);
        const payload = {
            name: selectedFoods
                .map((f) => `${f.name} (${f.quantity}x)`)
                .join(", "),
            calories: Math.round(totals.calories),
            protein: Math.round(totals.protein),
            carbs: Math.round(totals.carbs),
            fat: Math.round(totals.fat),
            fiber: Math.round(totals.fiber),
        };

        if (editMeal) {
            const { error } = await supabase
                .from("meals")
                .update(payload)
                .eq("id", editMeal.id);
            setLoading(false);
            if (error) {
                toast({
                    title: "Error",
                    description: "Failed to update meal.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Meal updated!",
                    description: `Updated ${Math.round(
                        totals.calories
                    )} calories.`,
                });
                onAdded();
                onClose();
            }
        } else {
            const rows = selectedFoods.map((f) => ({
                user_id: user.id,
                name: f.quantity > 1 ? `${f.name} (${f.quantity}x)` : f.name,
                calories: Math.round(f.calories * f.quantity),
                protein: Math.round(f.protein * f.quantity),
                carbs: Math.round(f.carbs * f.quantity),
                fat: Math.round(f.fat * f.quantity),
                fiber: Math.round(f.fiber * f.quantity),
                logged_at: new Date().toISOString(),
            }));
            const { error } = await supabase.from("meals").insert(rows);
            setLoading(false);
            if (error) {
                toast({
                    title: "Error",
                    description: "Failed to log meal.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Meal logged!",
                    description: `Added ${Math.round(
                        totals.calories
                    )} calories.`,
                });
                onAdded();
                onClose();
                navigate("/meals");
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search Indian foods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {searchQuery && (
                    <div className="space-y-2 flex-1 overflow-y-auto p-1">
                        {filteredFoods.map((food) => (
                            <Card
                                key={food.id}
                                className="cursor-pointer transition-colors hover:bg-accent/50 w-full"
                                onClick={() => addFood(food)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-start gap-2 min-w-0">
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <h4 className="font-medium text-sm truncate">
                                                {food.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                {food.calories} cal •{" "}
                                                {food.protein}g protein
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="text-xs shrink-0"
                                        >
                                            {food.standardQuantity}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {filteredFoods.length === 0 && (
                            <p className="text-center text-muted-foreground py-6">
                                No foods found
                            </p>
                        )}
                        {/* {!searchQuery && <p className="text-center text-muted-foreground py-6">Start typing to search for foods...</p>} */}
                    </div>
                )}

                <div className="space-y-3 flex-1 overflow-y-auto">
                    {/* <h3 className="font-medium">Selected Foods</h3> */}
                    <div className="space-y-2">
                        {selectedFoods.map((food) => (
                            <Card key={food.id} className="p-3 w-full">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start gap-2 min-w-0">
                                        <h4 className="font-medium text-sm flex-1 min-w-0 truncate">
                                            {food.name}
                                        </h4>
                                        <Badge
                                            variant="outline"
                                            className="text-xs shrink-0"
                                        >
                                            {food.standardQuantity}
                                        </Badge>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0 shrink-0"
                                            onClick={() =>
                                                updateQty(food.id, 0)
                                            }
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 w-6 p-0"
                                            onClick={() =>
                                                updateQty(
                                                    food.id,
                                                    food.quantity - 1
                                                )
                                            }
                                        >
                                            -
                                        </Button>
                                        <span className="text-sm w-8 text-center">
                                            {food.quantity}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 w-6 p-0"
                                            onClick={() =>
                                                updateQty(
                                                    food.id,
                                                    food.quantity + 1
                                                )
                                            }
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {/* {selectedFoods.length === 0 && <p className="text-xs text-muted-foreground">No foods selected yet.</p>} */}
                    </div>
                </div>
            </div>

            {/* <Card className="p-3 bg-accent/20">
        <h4 className="font-medium text-sm mb-2">Total Nutrition</h4>
        <p className="text-xs text-muted-foreground">Calories: {Math.round(totals.calories)} • Protein: {Math.round(totals.protein)}g • Carbs: {Math.round(totals.carbs)}g • Fat: {Math.round(totals.fat)}g • Fiber: {Math.round(totals.fiber)}g</p>
      </Card> */}

            <div className="flex justify-end gap-2">
                <Button
                    onClick={handleSubmit}
                    disabled={loading || selectedFoods.length === 0}
                    className="w-full sm:w-auto"
                >
                    {loading
                        ? editMeal
                            ? "Updating..."
                            : "Adding..."
                        : editMeal
                        ? "Update Meal"
                        : "Add Meal"}
                </Button>
            </div>
        </div>
    );
}
