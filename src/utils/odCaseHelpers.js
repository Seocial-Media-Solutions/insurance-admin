export const formatLabel = (str) => {
    return str
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
};

export const getInputType = (fieldName) => {
    const lower = fieldName.toLowerCase();
    if (lower.includes("dateandtime")) return "datetime-local";
    if (lower.includes("date") || lower.includes("dob")) return "date";
    if (
        lower.includes("details") ||
        lower.includes("description") ||
        lower.includes("opinion") ||
        lower.includes("narration") ||
        lower.includes("address") ||
        lower.includes("record")
    ) {
        return "textarea";
    }
    if (lower.includes("latitude") || lower.includes("longitude")) return "number";
    return "text";
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
