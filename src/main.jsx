import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./providers/QueryProvider";
import App from "./App.jsx";
import "./index.css";
import Layout from "./components/layout/Layout.jsx";
import { ContactProvider } from "./context/ContactProvider.jsx";

import { CaseProvider } from "./context/CaseContext";
import { ODCaseProvider } from "./context/ODCaseContext";
import { TheftCaseProvider } from "./context/TheftCaseContext";
import { FieldExecutiveProvider } from "./context/FieldExecutiveContext";
import { AssignmentProvider } from "./context/AssignmentContext";
import { FirmProvider } from "./context/FirmContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <ContactProvider>
          <CaseProvider>
            <ODCaseProvider>
              <TheftCaseProvider>
                <FieldExecutiveProvider>
                  <AssignmentProvider>
                    <FirmProvider>
                      <Layout />
                    </FirmProvider>
                  </AssignmentProvider>
                </FieldExecutiveProvider>
              </TheftCaseProvider>
            </ODCaseProvider>
          </CaseProvider>
        </ContactProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
