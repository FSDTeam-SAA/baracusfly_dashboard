"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/dashboard/delete-confirm-modal";
import Link from "next/link";
import { EditCategoryModal } from "./edit/EditCategoryModal";

interface Category {
  id: string;
  name: string;
  image: string;
  commission: string;
  date: string;
}

export default function CategoriesPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  // inside component state
  const [editId, setEditId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // ✅ normalize response shape
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      api.get("/category/all-category").then((res) =>
        (res.data?.data || []).map((c: any) => ({
          id: c._id,
          name: c.name,
          image: c.catImage,
          commission: c.commission,
          date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—",
        }))
      ),
  });

  const deleteCategoryMutation = useMutation({
    // ⚠️ check your backend route: might be /category/delete-category/:id
    mutationFn: (id: string) => api.delete(`/category/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
      setDeleteCategory(null);
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(
        categories.map((category: Category) => category.id)
      );
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    }
  };

  const filteredCategories = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            <span>Overview</span>
            <span>›</span>
            <span className="text-gray-900">Categories</span>
          </nav>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/dashboard/categories/add">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Search bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={
                      selectedCategories.length === filteredCategories.length &&
                      filteredCategories.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category: Category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleSelectCategory(category.id, checked as boolean)
                      }
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={category.image || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {category.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-900">
                    {category.commission}
                  </td>
                  <td className="px-4 py-4 text-gray-500">{category.date}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditId(category.id);
                          setEditOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCategory(category)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredCategories.length} results
          </p>
        </div>
      </div>

      <EditCategoryModal
        categoryId={editId}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() =>
          queryClient.invalidateQueries({ queryKey: ["categories"] })
        }
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        open={!!deleteCategory}
        onOpenChange={() => setDeleteCategory(null)}
        onConfirm={() =>
          deleteCategory && deleteCategoryMutation.mutate(deleteCategory.id)
        }
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteCategory?.name}"? This action cannot be undone.`}
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
