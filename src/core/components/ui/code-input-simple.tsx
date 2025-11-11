"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { cn } from "src/core/utils/components";

type CodeInputSimpleProps = {
    value: string;
    onChangeAction: (value: string) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    language?: string;
};

export function CodeInputSimple({
    value,
    onChangeAction,
    className,
    placeholder,
    disabled,
    language = "javascript",
}: CodeInputSimpleProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleScroll = useCallback(() => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    }, []);

    return (
        <div
            className={cn(
                "relative w-full rounded-lg overflow-hidden ring-1 ring-card-lv3",
                "focus-within:ring-primary/30 focus-within:ring-2 transition-all duration-200",
                "bg-card-lv2",
                className
            )}>
            {/* Highlight Background */}
            <div
                ref={highlightRef}
                className="absolute inset-0 pointer-events-none overflow-auto rounded-lg"
                style={{
                    padding: "12px",
                    fontFamily: "Fira Code, Monaco, monospace",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    minHeight: "120px",
                    maxHeight: "400px",
                }}
                suppressHydrationWarning>
                {isMounted ? (
                    <SyntaxHighlighter
                        language={language}
                        style={atomDark}
                        customStyle={{
                            margin: 0,
                            padding: 0,
                            backgroundColor: "transparent",
                            fontSize: "13px",
                            fontFamily: "Fira Code, Monaco, monospace",
                            lineHeight: 1.5,
                        }}
                        wrapLines={true}
                        lineProps={{
                            style: {
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                            },
                        }}>
                        {value}
                    </SyntaxHighlighter>
                ) : (
                    <pre
                        style={{
                            margin: 0,
                            padding: 0,
                            fontFamily: "Fira Code, Monaco, monospace",
                            fontSize: "13px",
                            lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            color: "transparent",
                        }}>
                        {value}
                    </pre>
                )}
            </div>

            {/* Textarea Input */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChangeAction(e.target.value)}
                onScroll={handleScroll}
                disabled={disabled}
                placeholder={placeholder}
                className={cn(
                    "relative w-full outline-none resize-none",
                    "rounded-lg placeholder:text-text-placeholder/30",
                    "caret-white selection:bg-primary/50 selection:text-white",
                    "font-mono text-sm",
                    disabled && "opacity-50 pointer-events-none cursor-not-allowed"
                )}
                style={{
                    color: "transparent",
                    caretColor: "#ffffff",
                    backgroundColor: "transparent",
                    fontFamily: "Fira Code, Monaco, monospace",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    padding: "12px",
                    margin: 0,
                    border: "none",
                    minHeight: "120px",
                    maxHeight: "400px",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    position: "relative",
                    zIndex: 1,
                    tabSize: 2,
                }}
            />
        </div>
    );
}
