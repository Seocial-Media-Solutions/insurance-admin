import React, { Suspense, lazy, memo } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
/* --------------------------
   Lazy Loaded Pages with Prefetch
--------------------------- */
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CaseManagement = lazy(() => import("./pages/Cases"));
const AssignmentManagement = lazy(() => import("./pages/CaseAssignment/AssignmentManagement"));
// const InvestigationsDashboard = lazy(() => import("./pages/Investigation/Investigations"));
const FieldExecutiveList = lazy(() => import("./pages/FieldExecutive/FieldExecutiveList"));
const AddFieldExecutive = lazy(() => import("./pages/FieldExecutive/AddFieldExecutive"));
const EditFieldExecutive = lazy(() => import("./pages/FieldExecutive/EditFieldExecutive"));
const AssignmentViewPage = lazy(() => import("./pages/CaseAssignment/AssignmentViewPage"));
const CaseAdd = lazy(() => import("./pages/CaseManagement/CaseAdd"));
const CaseView = lazy(() => import("./pages/CaseManagement/CaseView"));
const CaseEdit = lazy(() => import("./pages/CaseManagement/CaseEdit"));
const CaseFirmPage = lazy(() => import("./pages/CaseFirm"));
const CaseList = lazy(() => import("./pages/Cases/CaseManagement"));

const CreateTheftCaseFull = lazy(() => import("./pages/Cases/theftCase"));
const CreateOdCaseFull = lazy(() => import("./pages/Cases/odCase"));
const ODCaseView = lazy(() => import("./pages/Cases/ODCaseView"));
const TheftCaseView = lazy(() => import("./pages/Cases/TheftCaseView"));

/* --------------------------
   Optimized Loader
--------------------------- */

const Loader = memo(() => (
  <div className="w-full h-screen flex items-center justify-center text-xl">
    Loading…
  </div>
));

/* --------------------------
   Memoized Toast Config
--------------------------- */

const toastConfig = {
  position: "top-right",
  reverseOrder: false,
  gutter: 8,
  toastOptions: {
    duration: 5000,
    style: { background: "white", color: "black" },
    success: {
      duration: 2000,
      iconTheme: { primary: "green", secondary: "black" },
    },
  },
};

/* --------------------------
   Main App Component
--------------------------- */

function AppComponent() {
  return (
    <>
      <Toaster {...toastConfig} />

      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<CaseManagement />} />

          {/* Field Executives */}
          <Route path="/field-executives" element={<FieldExecutiveList />} />
          <Route path="/field-executives/add" element={<AddFieldExecutive />} />
          <Route path="/field-executives/edit/:id" element={<EditFieldExecutive />} />

          {/* Case Firm */}
          <Route path="/casefirm" element={<CaseFirmPage />} />
          {/* Case CRUD */}
          <Route path="/cases/addcase" element={<CaseAdd />} />
          <Route path="/cases/view/:caseId" element={<CaseView />} />
          <Route path="/cases/edit/:caseId" element={<CaseEdit />} />
          {/* Assignments */}
          <Route path="/cases/assignments" element={<AssignmentManagement />} />
          <Route path="/cases/assignments/view/:id" element={<AssignmentViewPage />} />
          {/* Theft & OD case creation */}
          <Route path="case" element={<CaseList />} />
          <Route path="case/theft-case/edit/:caseId" element={<CreateTheftCaseFull />} />
          <Route path="case/od-case/edit/:caseId" element={<CreateOdCaseFull />} />
          {/* Read-Only View Routes */}
          <Route path="case/od-case/view/:caseId" element={<ODCaseView />} />
          <Route path="case/theft-case/view/:caseId" element={<TheftCaseView />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default memo(AppComponent);