import { createContext } from "react";

export const ExpandableContext = createContext({
  isExpanded: false,
  toggle: () => {},
});
