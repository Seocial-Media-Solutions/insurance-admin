import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export function SearchProvider({ children }) {
    const [globalSearch, setGlobalSearch] = useState("");

    return (
        <SearchContext.Provider value={{ globalSearch, setGlobalSearch }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useGlobalSearch() {
    const ctx = useContext(SearchContext);
    if (!ctx) throw new Error("useGlobalSearch must be used within SearchProvider");
    return ctx;
}
