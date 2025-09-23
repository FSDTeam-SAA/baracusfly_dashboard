"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

import { ArrowLeft, Mail, Phone, MapPin, User2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// --- Small helpers ---
function LabelValue({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-base text-foreground break-words">{children ?? "—"}</div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  const tone =
    s === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    s === "pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
    s === "suspended" ? "bg-rose-100 text-rose-700 border-rose-200" :
    "bg-secondary text-secondary-foreground border-border";
  return (
    <Badge variant="outline" className={`capitalize ${tone}`}>{status ? s : "unknown"}</Badge>
  );
}

export default function ServiceProviderDetailsPage() {
  const params = useParams() as { id?: string };

  const { data: provider, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["service-provider", params?.id],
    queryFn: async () => {
      const res = await api.get(`/user/get-seller/${params?.id}`);
      return res.data?.data;
    },
    enabled: Boolean(params?.id),
  });

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/service-providers">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-36" />
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (isError) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Something went wrong</CardTitle>
              <CardDescription>
                {(error as any)?.message || "We couldn't load this seller right now."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Button onClick={() => refetch()}>Try again</Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/service-providers">Go back</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="p-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>No provider found</CardTitle>
            <CardDescription>The requested seller could not be located.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/dashboard/service-providers">Back to list</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const serviceName: string = provider?.category?.[0]?.name || "—";
  const description: string = provider?.category?.[0]?.description || "—";
  const address: string = Array.isArray(provider?.address)
    ? provider.address.join(", ")
    : provider?.address || "—";

  return (
    <div className="p-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/service-providers">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Seller Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default">Message</Button>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Basic information and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-offset-2 ring-primary/20">
                <AvatarImage src={provider?.profileImage || "/placeholder.svg"} alt={provider?.fullName} />
                <AvatarFallback>{provider?.fullName?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-xl font-semibold truncate">{provider?.fullName || "—"}</div>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={provider?.status} />
                  {provider?.gender ? (
                    <Badge variant="secondary" className="capitalize flex items-center gap-1">
                      <User2 className="h-3.5 w-3.5" /> {provider.gender}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                <LabelValue label="Email">{provider?.email || "—"}</LabelValue>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                <LabelValue label="Phone Number">{provider?.phone || "—"}</LabelValue>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <LabelValue label="Address">{address}</LabelValue>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Details */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Service Details</CardTitle>
            <CardDescription>What this seller offers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <LabelValue label="Service Name">{serviceName}</LabelValue>
              <LabelValue label="Seller ID">{provider?.id || params?.id || "—"}</LabelValue>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="leading-relaxed whitespace-pre-line">{description}</p>
            </div>

            {/* Optional: compliance/verification */}
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Verified seller checks may apply depending on your workflow.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
