// ============================================================
// utils/caseFirmForm.utils.js
// Utility helpers for the CaseFirm Add / Edit form
// ============================================================

// ----------------------------------------------------------
// 1. DEFAULT (empty) form state
//    Add any new field here and it propagates everywhere.
// ----------------------------------------------------------
export const CASE_FIRM_INITIAL_STATE = {
    recipientCompany: "",
    city: "",
    regionalOffice: "",
    operationType: "",
    financialYear: "",
    recipientDesignation: "",
    recipientDepartment: "",
    recipientAddress: "",
};

// ----------------------------------------------------------
// 2. Map an existing firm document to form state
//    Used by the Edit handler.
// ----------------------------------------------------------
export const firmToFormData = (firm) => ({
    recipientCompany: firm.recipientCompany || "",
    city: firm.city || "",
    regionalOffice: firm.regionalOffice || "",
    operationType: firm.operationType || "",
    financialYear: firm.financialYear || "",
    recipientDesignation: firm.recipientDesignation || "",
    recipientDepartment: firm.recipientDepartment || "",
    recipientAddress: firm.recipientAddress || "",
});

// ----------------------------------------------------------
// 3. Field configuration array
//    Each entry drives one form field in the drawer.
//
//    Shape:
//    {
//      key        : string  — matches formData key & backend field name
//      label      : string  — human-readable label shown above the input
//      type       : "text" | "date" | "textarea"
//      placeholder: string  (optional, not used for date/textarea)
//      required   : boolean
//      rows       : number  (only for textarea)
//    }
// ----------------------------------------------------------
export const CASE_FIRM_FIELDS = [
    {
        key: "recipientCompany",
        label: "Recipient Company",
        type: "text",
        placeholder: "Enter Recipient Company",
        required: false,
    },
    {
        key: "city",
        label: "City",
        type: "text",
        placeholder: "Enter city",
        required: true,
    },
    {
        key: "regionalOffice",
        label: "Regional Office",
        type: "text",
        placeholder: "Enter Regional Office (Ex: NIA-RO)",
        required: true,
    },
    {
        key: "operationType",
        label: "Operation Type",
        type: "text",
        placeholder: "Enter Operation Type (Ex: OD)",
        required: true,
    },
    {
        key: "financialYear",
        label: "Financial Year",
        type: "text",
        placeholder: "Enter Financial Year (Ex: 24-25)",
        required: true,
    },

    {
        key: "recipientDesignation",
        label: "Recipient Designation",
        type: "text",
        placeholder: "Enter Recipient Designation",
        required: false,
    },
    {
        key: "recipientDepartment",
        label: "Recipient Department",
        type: "text",
        placeholder: "Enter Recipient Department",
        required: false,
    },

    {
        key: "recipientAddress",
        label: "Recipient Address",
        type: "textarea",
        placeholder: "Enter Recipient Address",
        required: false,
        rows: 3,
    },
];
