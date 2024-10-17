import { X } from "lucide-react";
import { SelectItemOptions } from ".";
import {
  FormControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui";

type Props = {
  field?: any;
  placeholder?: string;
  options: SelectItemOptions[];
  disabledClear?: boolean;
  disabled?: boolean;
  onChange?: (value: any) => void;
};

export function SelectBasic({
  field,
  placeholder,
  options,
  disabledClear,
  disabled,
  onChange,
}: Props) {
  const clear = () => {
    field?.onChange("");
    if (onChange) onChange("");
  };
  return (
    <Select
      value={field?.value}
      onValueChange={(value) => {
        field?.onChange(value);
        if (onChange) onChange(value);
      }}
      disabled={disabled}
    >
      <FormControl>
        <div className="relative">
          <SelectTrigger>
            <SelectValue
              placeholder={!field?.value ? placeholder : field.value}
            />
          </SelectTrigger>
          {field?.value && !disabledClear ? (
            <div
              title="Limpar"
              className="absolute bottom-[0.55rem] right-6 mx-1.5 mt-0.5 flex cursor-pointer flex-col items-center justify-center rounded-full p-1 hover:bg-muted"
              onClick={(e: any) => {
                e.stopPropagation();
                clear();
              }}
            >
              <X className="h-3.5 w-3.5 stroke-muted-foreground opacity-50" />
            </div>
          ) : null}
        </div>
      </FormControl>
      <SelectContent>
        {options?.map(({ label, value, description }, index) => (
          <SelectItem key={index} value={`${value}`} className="cursor-pointer">
            {label}
            {description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
