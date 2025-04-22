import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { cn } from "src/core/utils/components";

import { Button } from "./button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./command";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";

type PhoneInputProps = Omit<
    React.ComponentProps<typeof Input>,
    "onChange" | "value" | "ref"
> &
    Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
        onChange?: (value: RPNInput.Value) => void;
    };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
    React.forwardRef<
        React.ElementRef<typeof RPNInput.default>,
        PhoneInputProps
    >(({ className, onChange, ...props }, ref) => {
        return (
            <RPNInput.default
                ref={ref}
                className={cn("flex [&>div]:w-full", className)}
                flagComponent={FlagComponent}
                countrySelectComponent={CountrySelect}
                inputComponent={InputComponent}
                smartCaret={false}
                /**
                 * Handles the onChange event.
                 *
                 * react-phone-number-input might trigger the onChange event as undefined
                 * when a valid phone number is not entered. To prevent this,
                 * the value is coerced to an empty string.
                 *
                 * @param {E164Number | undefined} value - The entered value
                 */
                onChange={(value) =>
                    onChange?.(value || ("" as RPNInput.Value))
                }
                {...props}
            />
        );
    });
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
    HTMLInputElement,
    React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => (
    <Input
        className={cn("flex-1 rounded-s-none", className)}
        {...props}
        ref={ref}
    />
));
InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
    disabled?: boolean;
    value: RPNInput.Country;
    options: CountryEntry[];
    onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({
    disabled,
    value: selectedCountry,
    options: countryList,
    onChange,
}: CountrySelectProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    size="md"
                    type="button"
                    variant="helper"
                    className="flex gap-2 rounded-e-none pr-3 pl-4 ring-1"
                    disabled={disabled}>
                    <FlagComponent
                        country={selectedCountry}
                        countryName={selectedCountry}
                    />
                    <ChevronsUpDownIcon
                        className={cn(
                            "-mr-1 size-4 opacity-50",
                            disabled ? "hidden" : "opacity-100",
                        )}
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <ScrollArea className="h-72">
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {countryList.map(({ value, label }) =>
                                    value ? (
                                        <CountrySelectOption
                                            key={value}
                                            country={value}
                                            countryName={label}
                                            selectedCountry={selectedCountry}
                                            onChange={onChange}
                                        />
                                    ) : null,
                                )}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
    selectedCountry: RPNInput.Country;
    onChange: (country: RPNInput.Country) => void;
}

const CountrySelectOption = ({
    country,
    countryName,
    selectedCountry,
    onChange,
}: CountrySelectOptionProps) => {
    return (
        <CommandItem
            className="gap-2 px-4 text-sm"
            onSelect={() => onChange(country)}>
            <FlagComponent country={country} countryName={countryName} />
            <span className="flex-1">
                {countryName}
                <span className="text-text-placeholder/50 ml-2">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
            </span>

            <CheckIcon
                className={cn(
                    "text-primary-light size-5",
                    country === selectedCountry ? "opacity-100" : "opacity-0",
                )}
            />
        </CommandItem>
    );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
    const Flag = flags[country];

    return (
        <span className="bg-card-lv1 h-4.5 w-6.5 overflow-hidden rounded-sm *:size-full!">
            {Flag && <Flag title={countryName} />}
        </span>
    );
};

export { PhoneInput };
