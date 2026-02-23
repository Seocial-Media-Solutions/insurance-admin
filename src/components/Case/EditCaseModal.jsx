// import { useState, useEffect } from "react";

// export default function EditCaseModal({ open, caseData, onClose, onSave }) {
//   const [form, setForm] = useState(caseData);

//   useEffect(() => {
//     setForm(caseData);
//   }, [caseData]);

//   // Close modal on Escape
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     if (open) window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [open, onClose]);

//   if (!open) return null;

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   // Dynamic required field validation
//   const sections = {
//     "Case Details": {
//       icon: "📋",
//       color: "var(--accent)",
//       fields: [
//         { label: "Our File No", name: "ourFileNo", type: "text", required: true },
//         { label: "Dt. Of Case Rec", name: "dtOfCaseRec", type: "date" },
//         { label: "Case Rec Via", name: "caseRecVia", type: "text" },
//         { label: "Co. Claim No", name: "coClaimNo", type: "text" },
//         { label: "Policy No", name: "policyNo", type: "text" },
//         { label: "Policy Period", name: "policyPeriod", type: "text", placeholder: "03.01.2025 to 02.01.2026" },
//       ],
//     },
//     "Vehicle Information": {
//       icon: "🚗",
//       color: "var(--secondary)",
//       fields: [
//         { label: "Vehicle No", name: "vehicleNo", type: "text" },
//         { label: "Engine No", name: "engineNo", type: "text" },
//         { label: "Chassis No", name: "chassisNo", type: "text" },
//         { label: "Date of Loss", name: "dateOfLoss", type: "date" },
//       ],
//     },
//     "Insured Information": {
//       icon: "👤",
//       color: "var(--primary)",
//       fields: [
//         { label: "Name of Insured", name: "nameOfInsured", type: "text", span: 2 },
//         { label: "Address of Insured", name: "addressOfInsured", type: "text", span: 3 },
//         { label: "Contact No", name: "contactNo", type: "text" },
//         { label: "Status", name: "status", type: "select" },
//       ],
//     },
//     "Financial & Additional Details": {
//       icon: "💰",
//       color: "var(--secondary)",
//       fields: [
//         { label: "Dt. Case Sub", name: "dtCaseSub", type: "date" },
//         { label: "Hard Copy Submitted On", name: "hardCopySubmittedOn", type: "date" },
//         { label: "Fee Bill Dt", name: "feeBillDt", type: "date" },
//         { label: "Bill No", name: "billNo", type: "text" },
//         { label: "Fee Bill Rs", name: "feeBillRs", type: "text" },
//         { label: "Fee Rec", name: "feeRec", type: "text" },
//         { label: "Fee Rec Dt", name: "feeRecDt", type: "date" },
//       ],
//     },
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const requiredFields = Object.values(sections)
//       .flatMap(s => s.fields)
//       .filter(f => f.required)
//       .map(f => f.name);

//     for (const field of requiredFields) {
//       if (!form[field]) {
//         alert(`Please fill in the required field: ${field}`);
//         return;
//       }
//     }

//     onSave(form);
//   };

//   return (
//     <div
//       className=" inset-0 z-50 flex items-center justify-center"
//       style={{ backgroundColor: "var(--background)" }}
//       aria-modal="true"
//       role="dialog"
//     >
//       <div
//         className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl transform transition-all duration-300 scale-100"
//         style={{ backgroundColor: "var(--card)", color: "var(--foreground)", borderColor :"var(--foreground)" }}
//       >
//         {/* Header */}
//         <div
//           className="px-6 py-6 flex items-center justify-between flex-shrink-0"
//           style={{ background: "var(--background)" , borderColor :"var(--foreground)"}}
//         >
//           <div className="flex items-center gap-4">
//             <div
//               className="w-12 h-12 rounded-xl flex items-center justify-center"
//              style={{ background: "var(--foreground)" }}
//             >
//               <span className="text-2xl">✏️</span>
//             </div>
//             <div>
//               <h2 className="text-2xl sm:text-3xl font-bold">Edit Case</h2>
//               <p className="text-sm mt-1" style={{ color: "var(--secondary)" }}>
//                 Update case information and details
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-2xl hover:rotate-90 transform transition-all"
//             style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "var(--foreground)" }}
//             aria-label="Close"
//           >
//             ×
//           </button>
//         </div>

//         {/* Form Body */}
//         <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
//           <div className="space-y-8">
//             {Object.entries(sections).map(([title, { icon, color, fields }]) => (
//               <div key={title} className="space-y-5">
//                 {/* Section Header */}
//                 <div className="flex items-center gap-3 pb-3 border-b-2" style={{ borderColor: "var(--border)" }}>
//                   <div
//                     className="w-9 h-9 rounded-lg flex items-center justify-center border"
//                     style={{ borderColor: "var(--border)", backgroundColor: color }}
//                   >
//                     <span className="text-lg">{icon}</span>
//                   </div>
//                   <h3 className="text-lg font-bold">{title}</h3>
//                 </div>

//                 {/* Fields */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//                   {fields.map((field) => (
//                     <div
//                       key={field.name}
//                       className={
//                         field.span === 2
//                           ? "sm:col-span-2"
//                           : field.span === 3
//                           ? "sm:col-span-2 lg:col-span-3"
//                           : ""
//                       }
//                     >
//                       <label className="block text-sm font-bold mb-2">
//                         {field.label}
//                         {field.required && <span className="text-red-500 ml-1">*</span>}
//                       </label>
//                       {field.type === "select" ? (
//                         <select
//                           name={field.name}
//                           value={form?.[field.name] || "Not Paid"}
//                           onChange={handleChange}
//                           className="w-full px-4 py-3 border border-default rounded-xl focus:outline-none"
//                         >
//                           <option value="Paid">Paid</option>
//                           <option value="Not Paid">Not Paid</option>
//                         </select>
//                       ) : (
//                         <input
//                           type={field.type}
//                           name={field.name}
//                           value={form?.[field.name] || ""}
//                           onChange={handleChange}
//                           placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
//                           className="w-full px-4 py-3 border border-default rounded-xl focus:outline-none"
//                           style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
//                         />
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}

//             {/* Form Actions */}
//             <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t-2" style={{ borderColor: "var(--border)" }}>
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="w-full sm:w-auto px-8 py-3.5 border border-default rounded-xl font-bold"
//                 style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleSubmit}
//                 className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold"
//                 style={{
//                   backgroundColor: "var(--accent)",
//                   color: "var(--accent-foreground)",
//                 }}
//               >
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
