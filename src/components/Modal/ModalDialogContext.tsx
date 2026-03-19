import { createContext, FC, useContext } from "react";
import { WithChildren } from "@/core/utils/style/WithChildren";

const ModalDialogContext = createContext(false);

export const ModalDialogContextProvider: FC<WithChildren> = ({ children }) => {
  return (
    <ModalDialogContext.Provider value={true}>
      {children}
    </ModalDialogContext.Provider>
  );
};

export const useIsInsideModalDialog = (): boolean => {
  return useContext(ModalDialogContext);
};
