// src/context/GlobalContexts.jsx

import React from "react";
import { CPanelProductsContext } from "./CPanelProductsContext";
import { CPanelSalesContext } from "./CPanelSalesContext";
import { ShoppingCartContext } from "./ShoppingCartContext";
import { ThemeProvider } from "./ThemeProviderContext";
import { IsLoggedInContext } from "./IsLoggedContext";
import { FavoritesProvider } from "./FavoritesContext";


const GlobalContexts = ({ children }) => {
    return (
        <IsLoggedInContext>
            <FavoritesProvider>
                <CPanelProductsContext>
                    <CPanelSalesContext>
                        <ShoppingCartContext>
                            <ThemeProvider>
                                    {children}
                            </ThemeProvider>
                        </ShoppingCartContext>
                    </CPanelSalesContext>
                </CPanelProductsContext>
            </FavoritesProvider>
        </IsLoggedInContext>
    );
};

export default GlobalContexts;
