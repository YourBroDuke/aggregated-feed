import { X, RotateCcw } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Platform, FilterOptions } from '@/types';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: Platform[];
  filters: FilterOptions;
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
}

export function FilterPanel({
  isOpen,
  onClose,
  platforms,
  filters,
  onFiltersChange,
  onClearFilters
}: FilterPanelProps) {
  const contentTypes = [
    { id: 'article', label: '文章', icon: '📖' },
    { id: 'video', label: '视频', icon: '🎥' },
    { id: 'tweet', label: '推文', icon: '🐦' },
    { id: 'lifestyle', label: '生活', icon: '📷' }
  ];

  const timeRanges = [
    { id: 'all', label: '全部时间' },
    { id: 'today', label: '今天' },
    { id: 'week', label: '最近一周' },
    { id: 'month', label: '最近一个月' }
  ];

  const sortOptions = [
    { id: 'newest', label: '最新发布' },
    { id: 'popular', label: '最多点赞' },
    { id: 'engagement', label: '最多互动' }
  ];

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    const newPlatforms = checked
      ? [...filters.platforms, platformId]
      : filters.platforms.filter(id => id !== platformId);
    onFiltersChange({ platforms: newPlatforms });
  };

  const isFilterActive = () => {
    return filters.platforms.length > 0 ||
           filters.timeRange !== 'all';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">内容筛选</SheetTitle>
            <div className="flex items-center space-x-2">
              {isFilterActive() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  className="flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>重置</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <SheetDescription>
            根据平台、内容类型、时间范围和排序方式筛选内容
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* 平台筛选 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">平台筛选</h3>
            <div className="space-y-3">
              {platforms.map((platform) => (
                <div key={platform.type} className="flex items-center space-x-3">
                  <Checkbox
                    id={`platform-${platform.type}`}
                    checked={filters.platforms.includes(platform.type)}
                    onCheckedChange={(checked) => 
                      handlePlatformChange(platform.type, !!checked)
                    }
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <img 
                      src={platform.icon} 
                      alt={platform.name}
                      className="w-5 h-5 object-contain"
                    />
                    <Label 
                      htmlFor={`platform-${platform.type}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {platform.name}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* 时间范围 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">时间范围</h3>
            <RadioGroup
              value={filters.timeRange}
              onValueChange={(value) => 
                onFiltersChange({ timeRange: value as FilterOptions['timeRange'] })
              }
            >
              {timeRanges.map((range) => (
                <div key={range.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={range.id} id={`time-${range.id}`} />
                  <Label 
                    htmlFor={`time-${range.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {range.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

        </div>


        {/* 底部操作按钮 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <Button 
              className="flex-1"
            >
              应用筛选
            </Button>
            {isFilterActive() && (
              <Button 
                variant="outline" 
                onClick={onClearFilters}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>重置</span>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
