"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/dashboard/delete-confirm-modal";
import Link from "next/link";
import Image from "next/image";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { EditBannerModal } from "./Edit/EditBannerModal";

interface Banner {
  id: string;
  title: string;
  image: string;
  placement: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Expired" | "Schedule";
  clicks: number;
}

// Helps pluck the array from many possible API shapes
function extractBannerArray(payload: any): any[] {
  const d = payload?.data ?? payload;
  // try common shapes
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.banners)) return d.banners;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  return [];
}

export default function BannersPage() {
  const [selectedBanners, setSelectedBanners] = useState<string[]>([]);
  const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  // inside component:
  const [editId, setEditId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const {
    data: banners = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: () => api.get("/banners"),
    // ⬇️ normalize to an array of your `Banner` shape
    select: (res) => {
      const arr = extractBannerArray(res.data);
      // map to your UI shape; tweak keys to match your backend
      return arr.map(
        (b: any): Banner => ({
          id: b.id ?? b._id ?? String(b.id || b._id),
          title: b.title ?? b.name ?? "Untitled",
          image: b.image ?? b.bannerUrl ?? "",
          placement: b.placement ?? b.position ?? "—",
          startDate: b.startDate ?? b.start_time ?? b.start ?? "",
          endDate: b.endDate ?? b.end_time ?? b.end ?? "",
          status: (b.status ?? "Schedule") as Banner["status"],
          clicks: Number(b.clicks ?? b.metrics?.clicks ?? 0),
        })
      );
    },
    keepPreviousData: true,
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/banners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner deleted successfully");
      setDeleteBanner(null);
    },
    onError: () => toast.error("Failed to delete banner"),
  });

  const handleSelectAll = (checked: CheckedState) => {
    if (checked) setSelectedBanners(banners.map((b) => b.id));
    else setSelectedBanners([]);
  };

  const handleSelectBanner = (bannerId: string, checked: CheckedState) => {
    if (checked)
      setSelectedBanners((prev) =>
        prev.includes(bannerId) ? prev : [...prev, bannerId]
      );
    else setSelectedBanners((prev) => prev.filter((id) => id !== bannerId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Expired":
        return "bg-red-100 text-red-800";
      case "Schedule":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBanners = useMemo(
    () =>
      banners.filter((b) =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [banners, searchTerm]
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Ads</h1>
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            <span>Overview</span>
            <span>›</span>
            <span>Settings</span>
            <span>›</span>
            <span className="text-gray-900">Banner Ads</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search banners…"
            className="h-9 w-56 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/dashboard/banners/add">
              <Plus className="w-4 h-4 mr-2" />
              Add New Banners
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={
                      filteredBanners.length > 0 &&
                      selectedBanners.length === filteredBanners.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banner Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title/Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placement
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBanners.length ? (
                filteredBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selectedBanners.includes(banner.id)}
                        onCheckedChange={(checked) =>
                          handleSelectBanner(banner.id, checked)
                        }
                        aria-label={`Select ${banner.title}`}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-16 h-12 relative rounded overflow-hidden">
                        <Image
                          src={
                            banner.image ||
                            "/placeholder.svg?height=48&width=64"
                          }
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {banner.title}
                    </td>
                    <td className="px-4 py-4 text-gray-900">
                      {banner.placement}
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {banner.startDate}
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {banner.endDate}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant="secondary"
                        className={getStatusColor(banner.status)}
                      >
                        {banner.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-gray-900">{banner.clicks}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditId(banner.id);
                            setEditOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteBanner(banner)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {isFetching ? "Loading…" : "No banners found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditBannerModal
        bannerId={editId}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["banners"] })}
      />

      <DeleteConfirmModal
        open={!!deleteBanner}
        onOpenChange={() => setDeleteBanner(null)}
        onConfirm={() =>
          deleteBanner && deleteBannerMutation.mutate(deleteBanner.id)
        }
        title="Delete Banner"
        description={
          deleteBanner
            ? `Are you sure you want to delete "${deleteBanner.title}"? This action cannot be undone.`
            : ""
        }
        isLoading={deleteBannerMutation.isPending}
      />
    </div>
  );
}
