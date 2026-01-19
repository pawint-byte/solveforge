import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Shield,
  CreditCard,
  BarChart,
  Palette,
  Plug,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  DollarSign,
  Clock,
  Sparkles,
  X,
} from "lucide-react";

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

interface AddOnCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  items: AddOnItem[];
}

interface SelectedAddOn {
  item: AddOnItem;
  customDescription?: string;
}

interface AddOnsBuilderProps {
  selectedAddOns: SelectedAddOn[];
  onSelectionChange: (addons: SelectedAddOn[]) => void;
  showPricingCalculator?: boolean;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Shield,
  CreditCard,
  BarChart,
  Palette,
  Plug,
  Settings,
};

export function AddOnsBuilder({
  selectedAddOns,
  onSelectionChange,
  showPricingCalculator = true,
}: AddOnsBuilderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { data: categories, isLoading } = useQuery<AddOnCategory[]>({
    queryKey: ["/api/addons"],
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

  const toggleAddOn = (item: AddOnItem) => {
    const isSelected = selectedAddOns.some((addon) => addon.item.id === item.id);
    if (isSelected) {
      onSelectionChange(selectedAddOns.filter((addon) => addon.item.id !== item.id));
    } else {
      onSelectionChange([...selectedAddOns, { item }]);
    }
  };

  const updateCustomDescription = (itemId: string, description: string) => {
    onSelectionChange(
      selectedAddOns.map((addon) =>
        addon.item.id === itemId ? { ...addon, customDescription: description } : addon
      )
    );
  };

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchQuery.trim()) return categories;

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, searchQuery]);

  const pricingCalculation = useMemo(() => {
    const minTotal = selectedAddOns.reduce(
      (sum, addon) => sum + addon.item.priceMin,
      0
    );
    const maxTotal = selectedAddOns.reduce(
      (sum, addon) => sum + addon.item.priceMax,
      0
    );
    const totalDays = Math.max(
      ...selectedAddOns.map((addon) => addon.item.estimatedDays),
      0
    );
    return { minTotal, maxTotal, totalDays, count: selectedAddOns.length };
  }, [selectedAddOns]);

  const getCategoryIcon = (iconName: string | null) => {
    if (!iconName) return Settings;
    return iconMap[iconName] || Settings;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search add-ons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-addons-search"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchQuery("")}
              data-testid="button-clear-search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            {filteredCategories?.map((category) => {
              const IconComponent = getCategoryIcon(category.icon);
              const isExpanded = expandedCategories.has(category.id);
              const selectedInCategory = selectedAddOns.filter(
                (addon) => addon.item.categoryId === category.id
              ).length;

              return (
                <Collapsible
                  key={category.id}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover-elevate p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-primary/10">
                              <IconComponent className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-medium">
                                {category.name}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">
                                {category.items.length} options
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedInCategory > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {selectedInCategory}
                              </Badge>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4 px-4 space-y-2">
                        {category.items.map((item) => {
                          const isSelected = selectedAddOns.some(
                            (addon) => addon.item.id === item.id
                          );
                          const selectedAddon = selectedAddOns.find(
                            (addon) => addon.item.id === item.id
                          );

                          return (
                            <div
                              key={item.id}
                              className={`p-3 rounded-lg border transition-colors ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={item.id}
                                  checked={isSelected}
                                  onCheckedChange={() => toggleAddOn(item)}
                                  data-testid={`checkbox-addon-${item.id}`}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <label
                                      htmlFor={item.id}
                                      className="font-medium text-sm cursor-pointer"
                                    >
                                      {item.name}
                                    </label>
                                    {item.isPopular && (
                                      <Badge
                                        variant="default"
                                        className="text-[10px] px-1.5 py-0"
                                      >
                                        <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                                        Popular
                                      </Badge>
                                    )}
                                    {item.tooltip && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          {item.tooltip}
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2 text-xs">
                                    {item.priceMin > 0 || item.priceMax > 0 ? (
                                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                        <DollarSign className="h-3 w-3" />
                                        {item.priceMin === item.priceMax
                                          ? `$${item.priceMin}`
                                          : `$${item.priceMin} - $${item.priceMax}`}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground italic">
                                        Custom quote
                                      </span>
                                    )}
                                    {item.timelineLabel && (
                                      <span className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {item.timelineLabel}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isSelected && item.name === "Custom Feature" && (
                                <div className="mt-3 pl-7">
                                  <Input
                                    placeholder="Describe your custom requirement..."
                                    value={selectedAddon?.customDescription || ""}
                                    onChange={(e) =>
                                      updateCustomDescription(item.id, e.target.value)
                                    }
                                    className="text-sm"
                                    data-testid="input-custom-addon-description"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}

            {filteredCategories?.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No add-ons found matching "{searchQuery}"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {showPricingCalculator && (
            <div className="md:sticky md:top-4 h-fit">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Pricing Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pricingCalculation.count === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Select add-ons to see estimated pricing
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {selectedAddOns.map((addon) => (
                          <div
                            key={addon.item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="truncate flex-1 mr-2">
                              {addon.item.name}
                            </span>
                            <span className="text-muted-foreground whitespace-nowrap">
                              {addon.item.priceMin > 0 || addon.item.priceMax > 0
                                ? addon.item.priceMin === addon.item.priceMax
                                  ? `$${addon.item.priceMin}`
                                  : `$${addon.item.priceMin}-${addon.item.priceMax}`
                                : "TBD"}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => toggleAddOn(addon.item)}
                              data-testid={`button-remove-addon-${addon.item.id}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Estimated Total</span>
                          <span className="text-primary">
                            {pricingCalculation.minTotal === pricingCalculation.maxTotal
                              ? `$${pricingCalculation.minTotal.toLocaleString()}`
                              : `$${pricingCalculation.minTotal.toLocaleString()} - $${pricingCalculation.maxTotal.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Estimated Timeline</span>
                          <span>
                            {pricingCalculation.totalDays > 0
                              ? `~${pricingCalculation.totalDays} days`
                              : "Varies"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        * Final pricing will be confirmed after project review
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function AddOnsSummary({
  selectedAddOns,
}: {
  selectedAddOns: SelectedAddOn[];
}) {
  if (selectedAddOns.length === 0) return null;

  const minTotal = selectedAddOns.reduce(
    (sum, addon) => sum + addon.item.priceMin,
    0
  );
  const maxTotal = selectedAddOns.reduce(
    (sum, addon) => sum + addon.item.priceMax,
    0
  );

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">Selected Add-ons</span>
        <Badge variant="secondary">{selectedAddOns.length}</Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        {selectedAddOns.map((addon) => (
          <Badge key={addon.item.id} variant="outline" className="text-xs">
            {addon.item.name}
          </Badge>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        Estimated: {minTotal === maxTotal
          ? `$${minTotal.toLocaleString()}`
          : `$${minTotal.toLocaleString()} - $${maxTotal.toLocaleString()}`}
      </div>
    </div>
  );
}

export type { AddOnItem, AddOnCategory, SelectedAddOn };
