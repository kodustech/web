import React from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";

interface AutoCompleteProps {
    id?: string;
    data: any[];
    placeholder: string;
    onChange: (selectedOption: any) => void;
    value: any;
    isSearchable?: boolean;
    isMulti?: boolean;
    isLoading?: boolean;
}

const animatedComponents = makeAnimated();

const AutoComplete: React.FC<AutoCompleteProps> = ({
    id,
    data,
    placeholder,
    onChange,
    value,
    isSearchable = true,
    isMulti = false,
    isLoading = false,
}) => {
    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: "#292031",
            borderColor: state.isFocused ? "#40345A" : "#40345A",
            color: "#DFD8F5",
            minHeight: "50px",
        }),
        valueContainer: (provided: any) => ({
            ...provided,
            color: "#DFD8F5",
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: "#6D677E",
        }),
        input: (provided: any) => ({
            ...provided,
            color: "#DFD8F5",
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: "#DFD8F5",
            fontWeight: "bold",
        }),
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: "#382A41",
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: "#fff",
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            "backgroundColor": state.isSelected
                ? "#292031"
                : state.isFocused
                  ? "#292031"
                  : null,
            "color": state.isSelected ? "#DFD8F5" : "#DFD8F5",
            "&:hover": {
                backgroundColor: "#1F1825",
                color: "#DFD8F5",
            },
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: "#292031",
            zIndex: 2,
            color: "#DFD8F5",
        }),
    };

    return (
        <Select
            id={id}
            options={data}
            styles={customStyles}
            placeholder={placeholder}
            isSearchable={isSearchable}
            isMulti={isMulti}
            onChange={onChange}
            value={value || ""}
            components={animatedComponents}
            closeMenuOnSelect={false}
            isLoading={isLoading}
        />
    );
};

export default AutoComplete;
