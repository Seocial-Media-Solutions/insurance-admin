export const formatLabel = (str) => {
    return str
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
};

export const getInputType = (fieldName) => {
    const lower = fieldName.toLowerCase();
    
    // Theft specific overrides
    if (lower === "invoicenowithdate") return "text";
    if (lower === "dateofloss") return "datetime-local";
    
    if (lower.includes("dateandtime")) return "datetime-local";
    if (lower.includes("date") || lower.includes("dob")) return "date";
    if (
        lower.includes("details") ||
        lower.includes("description") ||
        lower.includes("opinion") ||
        lower.includes("narration") ||
        lower.includes("address") ||
        lower.includes("introduction") ||
        lower.includes("information") ||
        lower.includes("summary") ||
        lower.includes("version") ||
        lower.includes("contact") ||
        lower.includes("record") ||
        lower.includes("remark") ||
        lower.includes("findings") ||
        lower.includes("conclusion")
    ) {
        return "textarea";
    }
    if (lower.includes("latitude") || lower.includes("longitude")) return "text";
    return "text";
};

export const cleanNumericInput = (val) => {
    if (typeof val !== "string") return val;
    // Allow digits, one dot, and one minus sign at start
    let cleaned = val.replace(/[^0-9.-]/g, '');
    
    // Ensure only one dot
    const parts = cleaned.split('.');
    if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Ensure minus is only at the beginning
    if (cleaned.indexOf('-') > 0) {
        cleaned = cleaned.charAt(0) + cleaned.slice(1).replace(/-/g, '');
    }
    
    return cleaned;
};

export const getNestedValue = (obj, path) => {
    const keys = path.split('.');
    return keys.reduce((acc, key) => acc?.[key], obj);
};

export const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((acc, key) => {
        if (!acc[key]) acc[key] = {};
        return acc[key];
    }, obj);
    target[lastKey] = value;
    return obj;
};
