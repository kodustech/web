"use client";

import {
    createContext,
    createRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { usePathname } from "next/navigation";

import { EmptyComponent } from "../empty";

type Props = { closeable: boolean };

export const MagicModalContext = createContext<Props>({ closeable: true });

export const useMagicModalState = () => useContext(MagicModalContext);

type IModal = {
    show: typeof show;
    hide: typeof hide;
    lock: () => void;
    unlock: () => void;
};

const magicModalRef = createRef<IModal>();

const show = async <Return,>(
    component: () => React.JSX.Element,
    props?: { closeable?: boolean },
): Promise<Return | undefined> => {
    return magicModalRef.current?.show?.(component, props);
};

const hide = async (returns?: unknown): Promise<void> => {
    return magicModalRef.current?.hide(returns);
};

export const magicModal: IModal = {
    show,
    hide,
    lock: () => magicModalRef.current?.lock(),
    unlock: () => magicModalRef.current?.unlock(),
};

type ModalCallback = (returns?: unknown) => void;

export const MagicModalPortal = () => {
    const callbackRef = useRef<ModalCallback>(() => {});
    const [Content, setContent] = useState<React.FC | null>(null);
    const [closeable, setCloseable] = useState(true);
    const pathname = usePathname();

    const hide = useCallback<IModal["hide"]>(async (returns) => {
        setContent(null);
        callbackRef.current(returns);
    }, []);

    useEffect(() => {
        hide();
    }, [pathname, hide]);

    const show = useCallback<IModal["show"]>(
        async (NewComponent, props = {}) => {
            const { closeable = true } = props;

            setContent(() => NewComponent);
            setCloseable(closeable);

            return new Promise((resolve) => {
                callbackRef.current = resolve as ModalCallback;
            });
        },
        [Content],
    );

    const lock: IModal["lock"] = () => setCloseable(false);
    const unlock: IModal["unlock"] = () => setCloseable(true);

    useImperativeHandle(magicModalRef, () => ({
        hide,
        show,
        lock,
        unlock,
    }));

    const RenderingContent = Content ?? EmptyComponent;

    return (
        <MagicModalContext.Provider value={{ closeable }}>
            <RenderingContent />
        </MagicModalContext.Provider>
    );
};
