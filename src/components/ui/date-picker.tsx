import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
	value?: Date | null;
	onChange?: (date: Date | null) => void;
	disabled?: boolean;
	readonly?: boolean;
	showTime?: boolean;
	placeholder?: string;
}

export function DatePicker({
	value,
	onChange,
	disabled = false,
	readonly = false,
	showTime = false,
	placeholder = 'Pick a date',
}: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					className={cn(
						'w-full justify-start text-left font-normal',
						!value && 'text-muted-foreground'
					)}
					disabled={disabled || readonly}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{value ? format(value, 'PPP') : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar mode="single" selected={value || undefined} onSelect={onChange} initialFocus />
			</PopoverContent>
		</Popover>
	);
}
