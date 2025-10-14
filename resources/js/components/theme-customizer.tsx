import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { HTMLAttributes } from 'react';
import {
    ThemeColor,
    ThemeRadius,
    useThemeCustomization,
} from '@/hooks/use-theme-customization';
import { Label } from '@/components/ui/label';

export default function ThemeCustomizer({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { radius, color, updateRadius, updateColor } =
        useThemeCustomization();

    const radiusOptions: { value: ThemeRadius; label: string }[] = [
        { value: 'none', label: 'None' },
        { value: 'default', label: 'Default' },
        { value: 'full', label: 'Full' },
    ];

    const colorOptions: {
        value: ThemeColor;
        label: string;
        colors: { light: string; dark: string };
    }[] = [
        {
            value: 'zinc',
            label: 'Zinc',
            colors: {
                light: 'bg-zinc-900',
                dark: 'bg-zinc-700',
            },
        },
        {
            value: 'slate',
            label: 'Slate',
            colors: {
                light: 'bg-slate-900',
                dark: 'bg-slate-700',
            },
        },
        {
            value: 'stone',
            label: 'Stone',
            colors: {
                light: 'bg-stone-900',
                dark: 'bg-stone-700',
            },
        },
        {
            value: 'gray',
            label: 'Gray',
            colors: {
                light: 'bg-gray-900',
                dark: 'bg-gray-700',
            },
        },
        {
            value: 'neutral',
            label: 'Neutral',
            colors: {
                light: 'bg-neutral-900',
                dark: 'bg-neutral-700',
            },
        },
        {
            value: 'red',
            label: 'Red',
            colors: {
                light: 'bg-red-600',
                dark: 'bg-red-700',
            },
        },
        {
            value: 'rose',
            label: 'Rose',
            colors: {
                light: 'bg-rose-600',
                dark: 'bg-rose-700',
            },
        },
        {
            value: 'orange',
            label: 'Orange',
            colors: {
                light: 'bg-orange-600',
                dark: 'bg-orange-700',
            },
        },
        {
            value: 'green',
            label: 'Green',
            colors: {
                light: 'bg-green-600',
                dark: 'bg-green-700',
            },
        },
        {
            value: 'blue',
            label: 'Blue',
            colors: {
                light: 'bg-blue-600',
                dark: 'bg-blue-700',
            },
        },
        {
            value: 'yellow',
            label: 'Yellow',
            colors: {
                light: 'bg-yellow-600',
                dark: 'bg-yellow-700',
            },
        },
        {
            value: 'violet',
            label: 'Violet',
            colors: {
                light: 'bg-violet-600',
                dark: 'bg-violet-700',
            },
        },
    ];

    return (
        <div className={cn('space-y-6', className)} {...props}>
            {/* Radius Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Radius</Label>
                <div className="grid grid-cols-3 gap-3">
                    {radiusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => updateRadius(option.value)}
                            className={cn(
                                'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-muted',
                                radius === option.value
                                    ? 'border-primary'
                                    : 'border-border',
                            )}
                        >
                            {radius === option.value && (
                                <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />
                            )}
                            <div
                                className={cn(
                                    'h-12 w-12 bg-primary',
                                    option.value === 'none' && 'rounded-none',
                                    option.value === 'default' &&
                                        'rounded-[0.5rem]',
                                    option.value === 'full' && 'rounded-[1rem]',
                                )}
                            />
                            <span className="text-xs font-medium">
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Color</Label>
                <div className="grid grid-cols-3 gap-3">
                    {colorOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => updateColor(option.value)}
                            className={cn(
                                'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-muted',
                                color === option.value
                                    ? 'border-primary'
                                    : 'border-border',
                            )}
                        >
                            {color === option.value && (
                                <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />
                            )}
                            <div className="flex gap-1">
                                <div
                                    className={cn(
                                        'h-6 w-6 rounded-full',
                                        option.colors.light,
                                    )}
                                />
                                <div
                                    className={cn(
                                        'h-6 w-6 rounded-full',
                                        option.colors.dark,
                                    )}
                                />
                            </div>
                            <span className="text-xs font-medium">
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
