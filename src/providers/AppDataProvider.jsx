import React from "react";
import { ContactProvider } from "../context/ContactProvider";
import { CaseProvider } from "../context/CaseContext";
import { ODCaseProvider } from "../context/ODCaseContext";
import { TheftCaseProvider } from "../context/TheftCaseContext";
import { FieldExecutiveProvider } from "../context/FieldExecutiveContext";
import { AssignmentProvider } from "../context/AssignmentContext";
import { FirmProvider } from "../context/FirmContext";
import { InvestigationProvider } from "../context/InvestigationContext";
import { SearchProvider } from "../context/SearchContext";

export const AppDataProvider = ({ children }) => {
  return (
    <ContactProvider>
      <CaseProvider>
        <ODCaseProvider>
          <TheftCaseProvider>
            <FieldExecutiveProvider>
              <AssignmentProvider>
                <FirmProvider>
                  <InvestigationProvider>
                    <SearchProvider>
                      {children}
                    </SearchProvider>
                  </InvestigationProvider>
                </FirmProvider>
              </AssignmentProvider>
            </FieldExecutiveProvider>
          </TheftCaseProvider>
        </ODCaseProvider>
      </CaseProvider>
    </ContactProvider>
  );
};
