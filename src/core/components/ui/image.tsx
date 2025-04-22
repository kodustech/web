import NextImage from "next/image";
import { cn } from "src/core/utils/components";

export const Image = (props: React.ComponentProps<typeof NextImage>) => {
    const { alt, src, width, height, sizes, className, style, ...otherProps } =
        props;

    return (
        <NextImage
            {...otherProps}
            alt={alt}
            src={src}
            sizes="100vw"
            width={9999}
            height={9999}
            className={cn("", className)}
            style={{
                ...style,
                width: "100%",
                height: "auto",
            }}
        />
    );
};
