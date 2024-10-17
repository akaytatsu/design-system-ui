import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  Button,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icons } from "@/index";
import { cn, debounce } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { CommandList } from "cmdk";
import { Check, ChevronDown, X } from "lucide-react";
import { Tag } from "../tag";

const selectVariants = cva(
  "flex justify-between items-center rounded border border-solid whitespace-nowrap border-muted-foreground p-3 h-10 w-full bg-white cursor-pointer",
  {
    variants: {
      size: {
        large: "h-12",
        medium: "h-10",
        small: "h-8",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  },
);

interface SelectProps extends VariantProps<typeof selectVariants> {
  selected?: string[];
  disabled?: boolean;
  multiple?: boolean;
  options: SelectItemOptions[];
  className?: string;
  label?: string;
  placeholder?: string;
  loading?: boolean;
  moreLoading?: boolean;
  totalRegisters?: number;
  error?: string;
  onChangeValue: (values: string[]) => void;
  onFetchMore?: () => void;
  onSearch?: (inputValue: string) => Promise<SelectItemOptions[]>;
}

export interface SelectItemOptions {
  value: string;
  label: string;
  description?: string;
}

export const SelectAdvanced = React.forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      selected,
      disabled = false,
      multiple = false,
      options,
      className,
      size = "medium",
      label,
      placeholder = "Selecione",
      loading,
      moreLoading,
      totalRegisters,
      error: errorParent,
      onChangeValue,
      onFetchMore,
      onSearch,
      ...props
    }: SelectProps,
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [filteredItems, setFilteredItems] = useState<SelectItemOptions[]>([]);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [selectedItems, setSelectedItems] = useState<SelectItemOptions[]>([]);
    const [error, setError] = useState<string>(errorParent || "");
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
      debounce(async (searchValue: string) => {
        try {
          setError("");
          if (!searchValue) {
            setIsSearching(false);
            setFilteredItems([]);
            return;
          }

          if (onSearch) {
            setSearchLoading(true);
            const fetchedItems = await onSearch(searchValue);
            setFilteredItems(fetchedItems);
            setIsSearching(true);
          }
        } catch (error) {
          console.error("Erro ao buscar itens", error);
          setError("Ocorreu um erro");
        } finally {
          setSearchLoading(false);
        }
      }, 500),
      [onSearch],
    );

    useEffect(() => {
      // if exists
      if (Array.isArray(selected)) {
        // multiple value
        const selectedItems = options.filter((item) =>
          selected.includes(item.value),
        );
        setSelectedItems(removeDuplicates(selectedItems));
      } else {
        // single value
        const selectedItems = options.filter((item) => item.value === selected);
        setSelectedItems(selectedItems);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options]);

    const toggleItem = (item: SelectItemOptions) => {
      const index = selectedItems.findIndex(
        (selectedItem) => selectedItem.value === item.value,
      );
      if (index === -1) {
        if (multiple) {
          setSelectedItems((prev) => removeDuplicates([...prev, item]));
          onChangeValue([...selectedItems.map((i) => i.value), item.value]);
        } else {
          setSelectedItems([item]);
          onChangeValue([item.value]);
        }
      } else {
        setSelectedItems((prev) => {
          const newSelectedItems = [...prev];
          newSelectedItems.splice(index, 1);
          return newSelectedItems;
        });
        onChangeValue(
          selectedItems
            .filter((i) => i.value !== item.value)
            .map((i) => i.value),
        );
      }

      // // Verifica se item selecionado está na lista de opções
      // // Se não tiver, adiciona na lista de opções
      if (!options.some((option) => option.value === item.value)) {
        options.push(item);
      }
      setOpenCombobox(multiple);
    };

    const onComboboxOpenChange = (value: boolean) => {
      if (!disabled && !loading) {
        setOpenCombobox(value);
      }
    };

    const onCloseHandler = (item: SelectItemOptions) => {
      const index = selectedItems.findIndex(
        (selectedItem) => selectedItem.value === item.value,
      );
      if (index !== -1) {
        setSelectedItems((prev) => {
          const newSelectedItems = [...prev];
          newSelectedItems.splice(index, 1);
          return newSelectedItems;
        });
        onChangeValue(
          selectedItems
            .filter((i) => i.value !== item.value)
            .map((i) => i.value),
        );
      }
    };
    const comboboxRef = useRef<HTMLDivElement>(null);

    const getAnimationStyle = () =>
      openCombobox
        ? "transition ease-in-out transform rotate-180 duration-300 motion-reduce:transition-none motion-reduce:hover:transform-none"
        : "transition ease-in-out transform rotate-[360deg] duration-300 motion-reduce:transition-none motion-reduce:hover:transform-none";

    //TODO: Não apagar lógica de scroll bottom
    // const handleScrollBottom = async (
    //   event: React.UIEvent<HTMLElement>,
    // ): Promise<void> => {
    //   const target = event.target as HTMLElement;
    //   const threshold = 20; // Ajuste esse valor conforme necessário para acionar mais cedo
    //   const isNearBottom =
    //     target.scrollHeight - (target.scrollTop + target.clientHeight) <
    //     threshold;

    //   if (isNearBottom && !inputValue && !moreLoading) {
    //     if (onFetchMore) {
    //       onFetchMore();
    //     }
    //   }
    // };

    const isNotSelectedYet = (): boolean => selectedItems.length === 0;
    const isOnlyOneSelected = (): boolean => selectedItems.length === 1;
    const moreThanOrEqualOneSelected = (): boolean => selectedItems.length >= 1;

    const moreThanOneSelected = (): boolean => {
      return selectedItems.length > 1;
    };

    // Example using optional chaining and nullish coalescing
    const getContainerWithLabelHeight = (size: string): string => {
      return (
        {
          large: "h-16",
          medium: "h-14",
          small: "h-12",
        }[size] ?? ""
      );
    };

    const onValueChangeHandler = async (value: string): Promise<void> => {
      setInputValue(value);
      if (onSearch) {
        setSearchLoading(true);
        debouncedSearch(value);
      }
    };

    const removeDuplicates = (
      arr?: SelectItemOptions[],
    ): SelectItemOptions[] => {
      // Remover itens duplicados baseado no value
      return (
        arr?.filter(
          (option, index, self) =>
            index === self.findIndex((t) => t.value === option.value),
        ) || []
      );
    };

    const orderedOptions = (): SelectItemOptions[] => {
      if (!options) return [];

      if (!onSearch) return options;

      // Função para verificar se um item está selecionado
      const isSelected = (option: SelectItemOptions) =>
        selectedItems?.some((selected) => selected.value === option.value);

      // Filtrar e ordenar os selecionados
      const selectedOptions = options
        .filter(isSelected)
        .sort((a, b) => a.label.localeCompare(b.label));

      // Filtrar e ordenar os não selecionados
      const notSelectedOptions = options
        .filter((option) => !isSelected(option))
        .sort((a, b) => a.label.localeCompare(b.label));

      // Concatenar as duas listas
      let sortedOptions = selectedOptions.concat(notSelectedOptions);
      sortedOptions = removeDuplicates(sortedOptions);
      return sortedOptions;
    };

    return (
      <div className="w-full" ref={ref}>
        <Popover
          open={openCombobox}
          onOpenChange={onComboboxOpenChange}
          {...props}
        >
          <PopoverTrigger asChild>
            <div
              className={cn(
                "flex w-full flex-col items-start justify-center",
                !!label && getContainerWithLabelHeight(size!),
              )}
            >
              {label && (
                <span className="mb-1 ml-0 text-xs font-medium text-primary/75 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  <label htmlFor="focusDiv">{label}</label>
                </span>
              )}
              <div
                id="focusDiv"
                tabIndex={0} // Ensure the div is focusable
                ref={comboboxRef}
                role="combobox"
                aria-expanded={openCombobox}
                className={cn(
                  selectVariants({ size: size ?? "medium", className }),
                  {
                    "cursor-not-allowed bg-neutral_high-light text-accent-foreground opacity-50":
                      disabled,
                  },
                )}
              >
                <span
                  className={`truncate text-sm font-normal ${
                    isNotSelectedYet()
                      ? "text-muted-foreground"
                      : "text-neutral_low"
                  } select-none`}
                >
                  {isNotSelectedYet() &&
                    (loading ? "Carregando..." : placeholder)}
                  {isOnlyOneSelected() && !multiple && selectedItems[0].label}
                  {moreThanOrEqualOneSelected() && multiple && (
                    <Tag
                      label={selectedItems[0].label}
                      variant={"default"}
                      closeable
                      onClose={() => onCloseHandler(selectedItems[0])}
                    />
                  )}
                  {moreThanOneSelected() && multiple && (
                    <TooltipProvider delayDuration={400}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Tag
                            label={`+ ${selectedItems.length - 1}`}
                            variant={"default"}
                            className="ml-1"
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          className="flex max-w-[300px] flex-wrap items-center gap-1"
                        >
                          {selectedItems.map((item, index) =>
                            index > 0 ? (
                              <Tag
                                key={index}
                                label={item.label}
                                variant={"default"}
                                closeable
                                onClose={() => onCloseHandler(item)}
                                className=""
                              />
                            ) : null,
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </span>
                {selectedItems?.length ? (
                  <div
                    title="Limpar"
                    className="absolute bottom-[0.35rem] right-8 mx-1.5 mt-1 flex cursor-pointer flex-col items-center justify-center rounded-full p-1 hover:bg-muted"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setSelectedItems([]);
                      onChangeValue([]);
                    }}
                  >
                    <X className="h-4 w-4 stroke-muted-foreground opacity-50" />
                  </div>
                ) : null}

                <div className="flex h-full items-center justify-center">
                  <ChevronDown
                    className={`ml-2 h-6 w-6 shrink-0 text-brand ${getAnimationStyle()}`}
                  />
                </div>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="PopoverContent mt-1 p-0">
            <Command className="rounded-md" shouldFilter={!onSearch}>
              <div className="relative">
                <CommandInput
                  ref={inputRef}
                  placeholder="Buscar"
                  value={inputValue}
                  onValueChange={onValueChangeHandler}
                />
                {searchLoading ? (
                  <div className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center bg-white">
                    <Icons.Loader2 className="h-4 w-4 animate-fast-spin stroke-brand" />
                  </div>
                ) : inputValue ? (
                  <div
                    title="Limpar"
                    className="absolute bottom-[0.55rem] right-0 mx-1.5 mt-1 flex cursor-pointer flex-col items-center justify-center rounded-full p-1 hover:bg-muted"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      onValueChangeHandler("");
                    }}
                  >
                    <X className="h-4 w-4 stroke-muted-foreground opacity-50" />
                  </div>
                ) : null}
              </div>
              <CommandList>
                {error ? (
                  <CommandEmpty>{error}</CommandEmpty>
                ) : (
                  <>
                    <CommandGroup
                      className="max-h-[190px] overflow-y-auto overflow-x-hidden"
                      // onScroll={handleScrollBottom}
                    >
                      <RenderItems />
                      <RenderfilteredItems />
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );

    function RenderItems() {
      if (
        !isSearching &&
        !filteredItems?.length &&
        !options?.length &&
        !loading
      ) {
        return (
          <CommandItem
            key={`${inputValue}`}
            value={`${inputValue}`}
            className="text-xs text-muted-foreground"
          >
            <div className={cn("mr-2 h-4 w-4")} />
            Não há registros
          </CommandItem>
        );
      }
      return (
        <>
          {!isSearching &&
            !filteredItems?.length &&
            orderedOptions()?.map((item, index) => {
              const isActive = selectedItems.some(
                (selectedItem) => selectedItem.value == item.value,
              );
              return (
                <CommandItem
                  key={index}
                  value={item.label}
                  onSelect={() => toggleItem(item)}
                  className="hover:cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex-1">
                    {item.label}
                    {item.description && (
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    )}
                  </div>
                </CommandItem>
              );
            })}

          {!isSearching &&
          !filteredItems?.length &&
          totalRegisters &&
          options &&
          totalRegisters > options?.length ? (
            <div className="flex w-full flex-col items-center justify-center">
              <Separator className="w-full" />
              <Button
                className="my-2"
                variant={"ghost"}
                type="button"
                onClick={() => (moreLoading ? null : onFetchMore?.())}
                size={"sm"}
                disabled={moreLoading}
              >
                {moreLoading ? "Carregando..." : "Carregar mais"}
              </Button>
            </div>
          ) : null}
        </>
      );
    }

    function RenderfilteredItems() {
      /* API Data list for Fetched Items*/
      return isSearching && !filteredItems?.length ? (
        <div className="flex w-full items-center justify-center p-1 text-sm text-muted-foreground">
          Nenhum resultado encontrado
        </div>
      ) : isSearching ? (
        filteredItems?.map((fetchedItem, fetchIndex) => {
          const isActive = selectedItems.some(
            (selectedItem) => selectedItem.value === fetchedItem.value,
          );
          return (
            <CommandItem
              key={fetchIndex}
              value={fetchedItem.label}
              onSelect={() => toggleItem(fetchedItem)}
              className="hover:cursor-pointer"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />
              <div className="flex-1">{fetchedItem.label}</div>
            </CommandItem>
          );
        })
      ) : null;
    }
  },
);
