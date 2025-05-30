import NextImage from "next/image";
import { cn } from "src/core/utils/components";

export const Image = (
    props: Omit<React.ComponentProps<typeof NextImage>, "alt"> & {
        alt?: React.ComponentProps<typeof NextImage>["alt"];
    },
) => {
    const { alt, src, width, height, sizes, className, style, ...otherProps } =
        props;

    return (
        <NextImage
            {...otherProps}
            alt={alt ?? "(no description provided)"}
            src={src}
            sizes="100vw"
            width={9999}
            height={9999}
            className={cn("pointer-events-none select-none", className)}
            style={{
                ...style,
                width: "100%",
                height: "auto",
            }}
        />
    );
};
