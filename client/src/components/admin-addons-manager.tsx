import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Settings,
  Database,
} from "lucide-react";

interface AddOnCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean | null;
  sortOrder: number;
}

interface AddOnItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  tooltip: string | null;
  priceMin: number;
  priceMax: number;
  estimatedDays: number;
  timelineLabel: string | null;
  isPopular: boolean | null;
  isActive: boolean | null;
  sortOrder: number;
}

const iconOptions = [
  "Shield",
  "CreditCard",
  "BarChart",
  "Palette",
  "Plug",
  "Settings",
];

export function AdminAddOnsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AddOnCategory | null>(null);
  const [editingItem, setEditingItem] = useState<AddOnItem | null>(null);
  const [selectedCategoryForItem, setSelectedCategoryForItem] = useState<string>("");

  const { data: categories, isLoading: loadingCategories } = useQuery<AddOnCategory[]>({
    queryKey: ["/api/admin/addons/categories"],
  });

  const { data: items, isLoading: loadingItems } = useQuery<AddOnItem[]>({
    queryKey: ["/api/admin/addons/items"],
  });

  const seedAddOns = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/addons/seed", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Add-ons seeded", description: `Created ${data.categoriesCreated} categories and ${data.itemsCreated} items` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/addons/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/addons/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
    },
    onError: () => {
      toast({ title: "Failed to seed add-ons", variant: "destructive" });
    },
  });

  const saveCategory = useMutation({
    mutationFn: async (data: Partial<AddOnCategory> & { id?: string }) => {
      if (data.id) {
        const response = await apiRequest("PATCH", `/api/admin/addons/categories/${data.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/admin/addons/categories", data);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({ title: "Category saved" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/addons/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
    },
    onError: () => {
      toast({ title: "Failed to save category", variant: "destructive" });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/addons/categories/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Category deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/addons/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
    },
    onError: () => {
      toast({ title: "Failed to delete category", variant: "destructive" });
    },
  });

  const saveItem = useMutation({
    mutationFn: async (data: Partial<AddOnItem> & { id?: string }) => {
      if (data.id) {
        const response = await apiRequest("PATCH", `/api/admin/addons/items/${data.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/admin/addons/items", data);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({ title: "Item saved" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/addons/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
      setItemDialogOpen(false);
      setEditingItem(null);
    },
    onError: () => {
      toast({ title: "Failed to save item", variant: "destructive" });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/addons/items/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Item deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/addons/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/addons"] });
    },
    onError: () => {
      toast({ title: "Failed to delete item", variant: "destructive" });
    },
  });

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleEditCategory = (category: AddOnCategory) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleAddItem = (categoryId: string) => {
    setSelectedCategoryForItem(categoryId);
    setEditingItem(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: AddOnItem) => {
    setEditingItem(item);
    setSelectedCategoryForItem(item.categoryId);
    setItemDialogOpen(true);
  };

  if (loadingCategories || loadingItems) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const hasNoAddOns = !categories?.length && !items?.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Add-Ons Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure available add-ons for the submission form
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasNoAddOns && (
            <Button
              variant="outline"
              onClick={() => seedAddOns.mutate()}
              disabled={seedAddOns.isPending}
              data-testid="button-seed-addons"
            >
              {seedAddOns.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Seed Default Add-Ons
            </Button>
          )}
          <Button
            onClick={() => {
              setEditingCategory(null);
              setCategoryDialogOpen(true);
            }}
            data-testid="button-add-category"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {hasNoAddOns ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Add-Ons Configured</h3>
            <p className="text-muted-foreground mb-4">
              Get started by seeding the default add-ons or create your own categories.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories?.map((category) => {
            const categoryItems = items?.filter((i) => i.categoryId === category.id) || [];
            const isExpanded = expandedCategories.has(category.id);

            return (
              <Collapsible
                key={category.id}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover-elevate">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {category.name}
                              {!category.isActive && (
                                <Badge variant="secondary" className="text-xs">Inactive</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {categoryItems.length} items
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(category);
                            }}
                            data-testid={`button-edit-category-${category.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this category and all its items?")) {
                                deleteCategory.mutate(category.id);
                              }
                            }}
                            data-testid={`button-delete-category-${category.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-3">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{item.name}</span>
                              {item.isPopular && (
                                <Badge variant="default" className="text-[10px]">Popular</Badge>
                              )}
                              {!item.isActive && (
                                <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              ${item.priceMin} - ${item.priceMax} | {item.timelineLabel || `${item.estimatedDays} days`}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditItem(item)}
                              data-testid={`button-edit-item-${item.id}`}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (confirm("Delete this item?")) {
                                  deleteItem.mutate(item.id);
                                }
                              }}
                              data-testid={`button-delete-item-${item.id}`}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleAddItem(category.id)}
                        data-testid={`button-add-item-${category.id}`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSave={(data) => saveCategory.mutate(data)}
        isSaving={saveCategory.isPending}
      />

      <ItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        item={editingItem}
        categoryId={selectedCategoryForItem}
        onSave={(data) => saveItem.mutate(data)}
        isSaving={saveItem.isPending}
      />
    </div>
  );
}

function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: AddOnCategory | null;
  onSave: (data: Partial<AddOnCategory>) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [icon, setIcon] = useState(category?.icon || "Settings");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(category?.sortOrder || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: category?.id,
      name,
      description,
      icon,
      isActive,
      sortOrder,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update the category details" : "Create a new add-on category"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              required
              data-testid="input-category-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category description"
              data-testid="input-category-description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger data-testid="select-category-icon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                data-testid="switch-category-active"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-20"
                data-testid="input-category-sort"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} data-testid="button-save-category">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ItemDialog({
  open,
  onOpenChange,
  item,
  categoryId,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AddOnItem | null;
  categoryId: string;
  onSave: (data: Partial<AddOnItem>) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [tooltip, setTooltip] = useState(item?.tooltip || "");
  const [priceMin, setPriceMin] = useState(item?.priceMin || 0);
  const [priceMax, setPriceMax] = useState(item?.priceMax || 0);
  const [estimatedDays, setEstimatedDays] = useState(item?.estimatedDays || 0);
  const [timelineLabel, setTimelineLabel] = useState(item?.timelineLabel || "");
  const [isPopular, setIsPopular] = useState(item?.isPopular ?? false);
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(item?.sortOrder || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: item?.id,
      categoryId,
      name,
      description,
      tooltip,
      priceMin,
      priceMax,
      estimatedDays,
      timelineLabel,
      isPopular,
      isActive,
      sortOrder,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update the item details" : "Create a new add-on item"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="itemName">Name</Label>
            <Input
              id="itemName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              required
              data-testid="input-item-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemDescription">Description</Label>
            <Textarea
              id="itemDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              data-testid="input-item-description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemTooltip">Tooltip</Label>
            <Input
              id="itemTooltip"
              value={tooltip}
              onChange={(e) => setTooltip(e.target.value)}
              placeholder="Helpful tooltip text"
              data-testid="input-item-tooltip"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceMin">Min Price ($)</Label>
              <Input
                id="priceMin"
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(parseInt(e.target.value) || 0)}
                data-testid="input-item-price-min"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMax">Max Price ($)</Label>
              <Input
                id="priceMax"
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(parseInt(e.target.value) || 0)}
                data-testid="input-item-price-max"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedDays">Est. Days</Label>
              <Input
                id="estimatedDays"
                type="number"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 0)}
                data-testid="input-item-days"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timelineLabel">Timeline Label</Label>
              <Input
                id="timelineLabel"
                value={timelineLabel}
                onChange={(e) => setTimelineLabel(e.target.value)}
                placeholder="e.g., 1-2 weeks"
                data-testid="input-item-timeline"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center space-x-2">
              <Switch
                id="itemActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                data-testid="switch-item-active"
              />
              <Label htmlFor="itemActive">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="itemPopular"
                checked={isPopular}
                onCheckedChange={setIsPopular}
                data-testid="switch-item-popular"
              />
              <Label htmlFor="itemPopular">Popular</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="itemSort">Sort</Label>
              <Input
                id="itemSort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-16"
                data-testid="input-item-sort"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} data-testid="button-save-item">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
