"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Check,
  Lock,
  Unlock,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Amalan {
  id: string;
  name: string;
  completed: boolean;
}

interface AmalanHistory {
  date: string;
  amalanList: Amalan[];
  completedCount: number;
}

interface Riyadhoh {
  id: string;
  name: string;
  target: number;
  count: number;
  startDate: string;
  active: boolean;
}

interface RiyadhohHistory {
  date: string;
  id: string;
  name: string;
  count: number;
  target: number;
}

export default function MutabaahApp() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [dateKey, setDateKey] = useState<string>("");
  const [amalanList, setAmalanList] = useState<Amalan[]>([]);

  const [newAmalan, setNewAmalan] = useState<string>("");
  const [newRiyadhoh, setNewRiyadhoh] = useState<string>("");
  const [newRiyadhohTarget, setNewRiyadhohTarget] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"daily" | "targets" | "history">(
    "daily"
  );

  const [amalanHistory, setAmalanHistory] = useState<AmalanHistory[]>([]);

  const [expandedHistoryDates, setExpandedHistoryDates] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const updateDate = () => {
      const today = new Date();
      const newDateKey = today.toDateString();
      const newDateFormatted = today.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setCurrentDate(newDateFormatted);

      // Check if date changed
      if (dateKey && dateKey !== newDateKey) {
        // Save current day to history before resetting
        const stored = localStorage.getItem(`mutabaah-${dateKey}`);
        if (stored) {
          const data = JSON.parse(stored);
          setAmalanHistory((prev) => [
            ...prev,
            {
              date: dateKey,
              amalanList: data.amalanList || [],
              completedCount: (data.amalanList || []).filter(
                (a: Amalan) => a.completed
              ).length,
            },
          ]);
        }
      }

      setDateKey(newDateKey);

      // Load today's data
      const stored = localStorage.getItem(`mutabaah-${newDateKey}`);
      if (stored) {
        const data = JSON.parse(stored);
        setAmalanList(data.amalanList || []);
        setIsLocked(data.isLocked || false);
      } else {
        const defaultAmalan: Amalan[] = [
          { id: "1", name: "Tahajud", completed: false },
          { id: "2", name: "Subuh", completed: false },
          { id: "3", name: "Dzuhur", completed: false },
          { id: "4", name: "Ashar", completed: false },
          { id: "5", name: "Maghrib", completed: false },
          { id: "6", name: "Isya", completed: false },
        ];
        setAmalanList(defaultAmalan);
        setIsLocked(false);
      }
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [dateKey]);

  // Load riyadhoh data
const [riyadhohList, setRiyadhohList] = useState<Riyadhoh[]>(() => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("mutabaah-riyadhoh");
    return stored ? JSON.parse(stored) : [];
  }
  return [];
});


  const [riyadhohHistory, setRiyadhohHistory] = useState<RiyadhohHistory[]>(
    () => {
      const stored = localStorage.getItem("mutabaah-riyadhoh-history");
      return stored ? JSON.parse(stored) : [];
    }
  );

  // Save to localStorage whenever amalan changes
  useEffect(() => {
    if (dateKey) {
      localStorage.setItem(
        `mutabaah-${dateKey}`,
        JSON.stringify({
          amalanList,
          isLocked,
        })
      );
    }
  }, [amalanList, isLocked, dateKey]);

  useEffect(() => {
    localStorage.setItem("mutabaah-riyadhoh", JSON.stringify(riyadhohList));
  }, [riyadhohList]);

  useEffect(() => {
    localStorage.setItem(
      "mutabaah-riyadhoh-history",
      JSON.stringify(riyadhohHistory)
    );
  }, [riyadhohHistory]);

  useEffect(() => {
    localStorage.setItem(
      "mutabaah-amalan-history",
      JSON.stringify(amalanHistory)
    );
  }, [amalanHistory]);

  const toggleAmalan = (id: string) => {
    if (isLocked) return;
    setAmalanList(
      amalanList.map((a) =>
        a.id === id ? { ...a, completed: !a.completed } : a
      )
    );
  };

  const addAmalan = () => {
    if (newAmalan.trim() && !isLocked) {
      setAmalanList([
        ...amalanList,
        {
          id: Date.now().toString(),
          name: newAmalan,
          completed: false,
        },
      ]);
      setNewAmalan("");
    }
  };

  const deleteAmalan = (id: string) => {
    if (isLocked) return;
    setAmalanList(amalanList.filter((a) => a.id !== id));
  };

  const addRiyadhoh = () => {
    if (newRiyadhoh.trim() && newRiyadhohTarget.trim()) {
      const target = Number.parseInt(newRiyadhohTarget) || 0;
      setRiyadhohList([
        ...riyadhohList,
        {
          id: Date.now().toString(),
          name: newRiyadhoh,
          target,
          count: 0,
          startDate: new Date().toLocaleDateString("id-ID"),
          active: true,
        },
      ]);
      setNewRiyadhoh("");
      setNewRiyadhohTarget("");
    }
  };

  const deleteRiyadhoh = (id: string) => {
    setRiyadhohList(riyadhohList.filter((r) => r.id !== id));
  };

  const toggleRiyadhoh = (id: string) => {
    setRiyadhohList(
      riyadhohList.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const incrementRiyadhohCount = (id: string) => {
    const updated = riyadhohList.map((r) => {
      if (r.id === id && r.count < r.target) {
        const newCount = r.count + 1;
        setRiyadhohHistory((prev) => [
          ...prev,
          {
            date: currentDate,
            id: r.id,
            name: r.name,
            count: newCount,
            target: r.target,
          },
        ]);
        return { ...r, count: newCount };
      }
      return r;
    });
    setRiyadhohList(updated);
  };

  const decrementRiyadhohCount = (id: string) => {
    const updated = riyadhohList.map((r) => {
      if (r.id === id && r.count > 0) {
        const newCount = r.count - 1;
        setRiyadhohHistory((prev) => [
          ...prev,
          {
            date: currentDate,
            id: r.id,
            name: r.name,
            count: newCount,
            target: r.target,
          },
        ]);
        return { ...r, count: newCount };
      }
      return r;
    });
    setRiyadhohList(updated);
  };

  const completedCount = amalanList.filter((a) => a.completed).length;

  const toggleHistoryDate = (date: string) => {
    const newExpanded = new Set(expandedHistoryDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedHistoryDates(newExpanded);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#159947] mb-2">
            Mutaba&apos;ah
          </h1>
          <p className="text-muted-foreground text-lg">
            Pelacakan Amalan Harian
          </p>
        </div>

        {/* Date Display */}
        <Card className="mb-6 bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-center text-lg font-medium text-foreground">
              📅 {currentDate}
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setActiveTab("daily")}
            variant={activeTab === "daily" ? "default" : "outline"}
            className={`flex-1 min-w-max ${
              activeTab === "daily"
                ? "bg-[#159947] text-white hover:bg-[#127c41]"
                : "bg-white text-black border hover:bg-amber-400 hover:text-white"
            }`}
          >
            Amalan Harian
          </Button>
          <Button
            onClick={() => setActiveTab("targets")}
            variant={activeTab === "targets" ? "default" : "outline"}
            className={`flex-1 min-w-max ${
              activeTab === "targets"
                ? "bg-[#159947] text-white hover:bg-[#127c41]"
                : "bg-white text-black border hover:bg-amber-400 hover:text-white"
            }`}
          >
            Target Riyadhoh
          </Button>
          <Button
            onClick={() => setActiveTab("history")}
            variant={activeTab === "history" ? "default" : "outline"}
            className={`flex-1 min-w-max ${
              activeTab === "history"
                ? "bg-[#159947] text-white hover:bg-[#127c41]"
                : "bg-white text-black border hover:bg-amber-400 hover:text-white"
            }`}
          >
            Riwayat
          </Button>
        </div>

        {/* Daily Amalan Tab */}
        {activeTab === "daily" && (
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="bg-linear-to-br from-[#159947]/10 to-[#22C55E]/10 border-[#159947]/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Kemajuan Hari Ini
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {completedCount}/{amalanList.length}
                    </p>
                  </div>
                  <div className="text-5xl">✨</div>
                </div>
              </CardContent>
            </Card>

            {/* Amalan Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Daftar Amalan</CardTitle>
                <CardDescription>
                  {isLocked ? "🔒 Daftar Terkunci" : "✏️ Daftar Terbuka"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Amalan Items */}
                <div className="space-y-2">
                  {amalanList.map((amalan) => (
                    <div
                      key={amalan.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/60 transition-colors group"
                    >
                      <button
                        onClick={() => toggleAmalan(amalan.id)}
                        disabled={isLocked}
                        className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          amalan.completed
                            ? "bg-[#159947] border-[#159947] text-[#F2F2F2]"
                            : "border-[#737373] hover:border-[#159947]"
                        } ${
                          isLocked
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {amalan.completed && <Check size={16} />}
                      </button>
                      <span
                        className={`flex-1 transition-all ${
                          amalan.completed
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {amalan.name}
                      </span>
                      <button
                        onClick={() => deleteAmalan(amalan.id)}
                        disabled={isLocked}
                        className="opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 text-destructive hover:bg-destructive/10 p-2 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Amalan */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Input
                    type="text"
                    placeholder="Tambah amalan baru..."
                    value={newAmalan}
                    onChange={(e) => setNewAmalan(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addAmalan()}
                    disabled={isLocked}
                    className="bg-background"
                  />
                  <Button
                    onClick={addAmalan}
                    disabled={isLocked || !newAmalan.trim()}
                    size="sm"
                    className="px-4"
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    onClick={() => setIsLocked(!isLocked)}
                    variant={isLocked ? "default" : "outline"}
                    className="w-full"
                  >
                    {isLocked ? (
                      <>
                        <Lock size={16} />
                        Buka & Edit
                      </>
                    ) : (
                      <>
                        <Unlock size={16} />
                        Kunci & Simpan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Target Riyadhoh Tab */}
        {activeTab === "targets" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">
                  Target Riyadhoh
                </CardTitle>
                <CardDescription>
                  Kelola target-target spiritual Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Riyadhoh List */}
                <div className="space-y-3">
                  {riyadhohList.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-lg">Belum ada target riyadhoh</p>
                      <p className="text-sm mt-2">
                        Tambahkan target baru untuk memulai
                      </p>
                    </div>
                  ) : (
                    riyadhohList.map((riyadhoh) => (
                      <div
                        key={riyadhoh.id}
                        className="p-4 rounded-lg bg-muted border border-border flex flex-col gap-3 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => toggleRiyadhoh(riyadhoh.id)}
                              className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 ${
                                riyadhoh.active
                                  ? "bg-accent border-accent text-accent-foreground"
                                  : "border-muted-foreground bg-background"
                              } cursor-pointer`}
                            >
                              {riyadhoh.active && <Check size={16} />}
                            </button>
                            <div>
                              <p className="font-medium text-foreground">
                                {riyadhoh.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Dimulai: {riyadhoh.startDate}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteRiyadhoh(riyadhoh.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 p-2 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 px-3">
                          <button
                            onClick={() => decrementRiyadhohCount(riyadhoh.id)}
                            className="px-2 py-1 rounded border border-border hover:bg-muted/60 transition-colors disabled:opacity-50"
                            disabled={riyadhoh.count === 0}
                          >
                            −
                          </button>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">
                                {riyadhoh.count}/{riyadhoh.target}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {riyadhoh.target > 0
                                  ? Math.round(
                                      (riyadhoh.count / riyadhoh.target) * 100
                                    )
                                  : 0}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${
                                    riyadhoh.target > 0
                                      ? (riyadhoh.count / riyadhoh.target) * 100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => incrementRiyadhohCount(riyadhoh.id)}
                            className="px-2 py-1 rounded border border-border hover:bg-muted/60 transition-colors disabled:opacity-50"
                            disabled={riyadhoh.count >= riyadhoh.target}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Riyadhoh */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Nama target riyadhoh..."
                      value={newRiyadhoh}
                      onChange={(e) => setNewRiyadhoh(e.target.value)}
                      className="bg-background flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Target"
                      value={newRiyadhohTarget}
                      onChange={(e) => setNewRiyadhohTarget(e.target.value)}
                      className="bg-background w-20"
                      min="1"
                    />
                  </div>
                  <Button
                    onClick={addRiyadhoh}
                    disabled={!newRiyadhoh.trim() || !newRiyadhohTarget.trim()}
                    className="w-full"
                  >
                    <Plus size={16} />
                    Tambah Target
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">
                  Riwayat Amalan Harian
                </CardTitle>
                <CardDescription>Rekam jejak amalan Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {amalanHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-lg">Belum ada riwayat</p>
                  </div>
                ) : (
                  amalanHistory
                    .slice()
                    .reverse()
                    .map((history) => (
                      <div
                        key={history.date}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleHistoryDate(history.date)}
                          className="w-full p-4 flex items-center justify-between hover:bg-muted/60 transition-colors"
                        >
                          <div className="text-left">
                            <p className="font-medium text-foreground">
                              {history.date}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {history.completedCount}/
                              {history.amalanList.length} selesai
                            </p>
                          </div>
                          {expandedHistoryDates.has(history.date) ? (
                            <ChevronUp
                              size={20}
                              className="text-muted-foreground"
                            />
                          ) : (
                            <ChevronDown
                              size={20}
                              className="text-muted-foreground"
                            />
                          )}
                        </button>

                        {expandedHistoryDates.has(history.date) && (
                          <div className="bg-muted/50 p-4 space-y-2 border-t border-border">
                            {history.amalanList.map((amalan) => (
                              <div
                                key={amalan.id}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                    amalan.completed
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : "border-muted-foreground"
                                  }`}
                                >
                                  {amalan.completed && <Check size={14} />}
                                </div>
                                <span
                                  className={`text-sm ${
                                    amalan.completed
                                      ? "line-through text-muted-foreground"
                                      : "text-foreground"
                                  }`}
                                >
                                  {amalan.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">
                  Riwayat Target Riyadhoh
                </CardTitle>
                <CardDescription>
                  Perkembangan target spiritual Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                {riyadhohHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-lg">Belum ada riwayat</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {riyadhohHistory
                      .slice()
                      .reverse()
                      .map((entry, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-muted rounded-lg flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {entry.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-primary">
                              {entry.count}/{entry.target}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.target > 0
                                ? Math.round((entry.count / entry.target) * 100)
                                : 0}
                              %
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
