import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Database,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

import { getBooks, getIssuedBooks, getFines } from "@/lib/services/library";
import { getMenuItems, getOrders } from "@/lib/services/canteen";
import { getResources, getAssignments, getStudyGroups, getForums } from "@/lib/services/academic";
import { getEvents } from "@/lib/services/events";
import { getFacilities, getFacilityBookings } from "@/lib/services/facilities";
import { getNotifications } from "@/lib/services/notifications";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

type Health = "loading" | "healthy" | "error" | "warning";

interface ModuleStatus {
  name: string;
  status: Health;
  message: string;
  count?: number;
}

const MODULES: { name: string; load: (userId?: string) => Promise<unknown[]> }[] = [
  { name: "Library — Books", load: () => getBooks() },
  { name: "Library — Issued Books", load: (u) => getIssuedBooks(u) },
  { name: "Library — Fines", load: (u) => getFines(u) },
  { name: "Canteen — Menu", load: () => getMenuItems() },
  { name: "Canteen — Orders", load: (u) => getOrders(u) },
  { name: "Academic — Study Materials", load: () => getResources() },
  { name: "Academic — Assignments", load: () => getAssignments() },
  { name: "Academic — Study Groups", load: () => getStudyGroups() },
  { name: "Academic — Forums", load: () => getForums() },
  { name: "Campus — Events", load: () => getEvents() },
  { name: "Campus — Facilities", load: () => getFacilities() },
  { name: "Campus — Facility Bookings", load: (u) => getFacilityBookings({ userId: u }) },
  { name: "Notifications", load: (u) => getNotifications(u ?? "anonymous") },
];

const Verification = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [apiStatus, setApiStatus] = useState<ModuleStatus>({
    name: "Backend API",
    status: "loading",
    message: "Checking connection…",
  });
  const [storageStatus, setStorageStatus] = useState<ModuleStatus>({
    name: "Local Data Layer",
    status: "loading",
    message: "Checking localStorage…",
  });
  const [moduleStatuses, setModuleStatuses] = useState<ModuleStatus[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const checkApi = useCallback(async () => {
    setApiStatus({ name: "Backend API", status: "loading", message: "Checking connection…" });
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE}/health`, { signal: controller.signal }).catch(() =>
        fetch(API_BASE.replace(/\/api\/v1$/, "/actuator/health"), { signal: controller.signal }),
      );
      clearTimeout(timeout);
      if (res && res.ok) {
        setApiStatus({
          name: "Backend API",
          status: "healthy",
          message: `Spring Boot API reachable at ${API_BASE}`,
        });
      } else {
        setApiStatus({
          name: "Backend API",
          status: "warning",
          message: "API not reachable — running on the local data layer (this is fine for demos).",
        });
      }
    } catch {
      setApiStatus({
        name: "Backend API",
        status: "warning",
        message: "API not reachable — running on the local data layer (this is fine for demos).",
      });
    }
  }, []);

  const checkStorage = useCallback(() => {
    try {
      const k = "__cc_health__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      setStorageStatus({
        name: "Local Data Layer",
        status: "healthy",
        message: "localStorage is available and writable.",
      });
    } catch {
      setStorageStatus({
        name: "Local Data Layer",
        status: "error",
        message: "localStorage is blocked — the app cannot persist data in this browser.",
      });
    }
  }, []);

  const runFullVerification = useCallback(async () => {
    setIsVerifying(true);
    toast.info("Running system diagnostics…");
    checkStorage();
    await checkApi();

    setModuleStatuses(
      MODULES.map((m) => ({ name: m.name, status: "loading" as Health, message: "Verifying…" })),
    );

    const results: ModuleStatus[] = [];
    for (const mod of MODULES) {
      try {
        const rows = await mod.load(user?.id);
        results.push({
          name: mod.name,
          status: "healthy",
          message: `Functional — ${rows.length} record${rows.length === 1 ? "" : "s"}.`,
          count: rows.length,
        });
      } catch (err) {
        results.push({
          name: mod.name,
          status: "error",
          message: err instanceof Error ? err.message : "Failed to load module data.",
        });
      }
      setModuleStatuses([...results, ...MODULES.slice(results.length).map((m) => ({
        name: m.name,
        status: "loading" as Health,
        message: "Verifying…",
      }))]);
    }

    setIsVerifying(false);
    toast.success("Diagnostics complete");
  }, [checkApi, checkStorage, user?.id]);

  useEffect(() => {
    if (!isAuthLoading) runFullVerification();
  }, [isAuthLoading, runFullVerification]);

  const StatusIcon = ({ status }: { status: Health }) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const StatusBadge = ({ status }: { status: Health }) => {
    switch (status) {
      case "loading":
        return <Badge variant="outline">Checking</Badge>;
      case "healthy":
        return <Badge className="bg-emerald-500 hover:bg-emerald-500">Healthy</Badge>;
      case "warning":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-600">
            Fallback
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  const healthy = moduleStatuses.filter((s) => s.status === "healthy").length;
  const failing = moduleStatuses.filter((s) => s.status === "error").length;

  return (
    <div className="container mx-auto flex flex-col gap-6 px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <ShieldCheck className="h-8 w-8 text-primary" />
            System Health
          </h1>
          <p className="mt-1 text-muted-foreground">
            Live diagnostics for every Campus Connect module and its data layer.
          </p>
        </div>
        <Button onClick={runFullVerification} disabled={isVerifying} className="flex items-center gap-2">
          {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Re-run diagnostics
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-2 border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Backend API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="font-medium">{apiStatus.name}</span>
              <StatusIcon status={apiStatus.status} />
            </div>
            <p className="px-1 text-sm text-muted-foreground">{apiStatus.message}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5" />
              Identity &amp; Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="font-medium">{storageStatus.name}</span>
              <StatusIcon status={storageStatus.status} />
            </div>
            <p className="px-1 text-sm text-muted-foreground">{storageStatus.message}</p>
            {user ? (
              <div className="flex flex-wrap gap-2 text-[11px]">
                <Badge variant="secondary">{user.full_name}</Badge>
                <Badge variant="outline">{user.role}</Badge>
              </div>
            ) : (
              <p className="px-1 text-xs italic text-muted-foreground">No user signed in.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/10 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutDashboard className="h-5 w-5" />
              Module Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Modules checked</span>
              <span className="font-bold">{moduleStatuses.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Healthy</span>
              <span className="font-bold text-emerald-500">{healthy}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Errors</span>
              <span className="font-bold text-destructive">{failing}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-2" />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Module diagnostics</CardTitle>
          <CardDescription>
            Each module is loaded through the same service layer the app uses at runtime.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[420px]">
            <div className="divide-y">
              {moduleStatuses.map((status) => (
                <div
                  key={status.name}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{status.name}</span>
                    <StatusBadge status={status.status} />
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <p className="hidden text-sm text-muted-foreground sm:block">{status.message}</p>
                    <StatusIcon status={status.status} />
                  </div>
                </div>
              ))}
              {moduleStatuses.length === 0 && !isVerifying && (
                <div className="p-8 text-center text-muted-foreground">
                  Click “Re-run diagnostics” to start.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verification;
