import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./providers/QueryProvider";
import "./index.css";
import Layout from "./components/layout/Layout.jsx";
import { ContactProvider } from "./context/ContactProvider.jsx";
import { CaseProvider } from "./context/CaseContext.jsx";
import { ODCaseProvider } from "./context/ODCaseContext.jsx";
import { TheftCaseProvider } from "./context/TheftCaseContext.jsx";
import { FieldExecutiveProvider } from "./context/FieldExecutiveContext.jsx";
import { AssignmentProvider } from "./context/AssignmentContext.jsx";
import { FirmProvider } from "./context/FirmContext.jsx";
import { InvestigationProvider } from "./context/InvestigationContext.jsx";
import { SearchProvider } from "./context/SearchContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <QueryProvider>
          <ContactProvider>
            <CaseProvider>
              <ODCaseProvider>
                <TheftCaseProvider>
                  <FieldExecutiveProvider>
                    <AssignmentProvider>
                      <FirmProvider>
                        <InvestigationProvider>
                          <SearchProvider>
                            <App />
                          </SearchProvider>
                        </InvestigationProvider>
                      </FirmProvider>
                    </AssignmentProvider>
                  </FieldExecutiveProvider>
                </TheftCaseProvider>
              </ODCaseProvider>
            </CaseProvider>
          </ContactProvider>
        </QueryProvider>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
