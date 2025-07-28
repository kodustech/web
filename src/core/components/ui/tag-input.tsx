import React, { useState } from "react";
import { Plus, X } from "lucide-react";

import { Badge } from "./badge";
import { Input } from "./input";

interface TagInputProps {
    tags: string[] | undefined;
    disabled?: boolean;
    id?: string;
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({
    tags = [],
    onTagsChange,
    disabled,
    id,
    placeholder = "Press Enter to add a new value",
}) => {
    const [inputValue, setInputValue] = useState("");

    const addTag = (tag: string) => {
        if (tag.trim() !== "" && !tags.includes(tag.trim())) {
            onTagsChange([...tags, tag.trim()]);
            setInputValue("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        onTagsChange(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="relative">
                <Input
                    id={id}
                    type="text"
                    disabled={disabled}
                    value={inputValue}
                    maxLength={100}
                    placeholder={placeholder}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(inputValue);
                        }
                    }}
                />

                {inputValue && (
                    <Badge
                        className="absolute top-1/2 right-2 -translate-y-1/2"
                        leftIcon={<Plus className="size-3" />}
                        onClick={() => addTag(inputValue)}>
                        Add item
                    </Badge>
                )}
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags?.map((tag) => (
                        <Badge
                            key={tag}
                            variant="helper"
                            disabled={disabled}
                            onClick={() => removeTag(tag)}>
                            {tag}
                            <X className="text-danger -mr-1 h-4 w-4" />
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagInput;
