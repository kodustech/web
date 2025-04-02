import { useEffect, type EffectCallback } from "react";

export const useEffectOnce = (effect: EffectCallback) => {
    useEffect(effect, []);
};
