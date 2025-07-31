import React, { createContext, useContext, useState } from "react";

const LoadingContext = createContext<{
  loading: boolean;
  setLoading: (val: boolean) => void;
}>({
  loading: false,
  setLoading: () => {},
});

export const useGlobalLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
