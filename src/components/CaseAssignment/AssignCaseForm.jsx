import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import * as Icons from "lucide-react";   // ✅ dynamic icon loader
import { getVisitRoutes } from "../../utils/visit";

 import { API } from "../../utils/api";
 const API_BASE = API;

export default function AssignCaseForm({ onAssignmentCreated }) {
  const [step, setStep] = useState(0);
  const [cases, setCases] = useState([]);
  const [alreadyVisits, setAlreadyVisits] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    caseId: "",
    caseType: "",
    fieldExecutiveId: "",
    investigationVisits: [], // visit objects {visitKey, label, endpoint}
    selectedVisitEndpoint: "",
    contactPersonName: "",
    contactPersonPhone: "",
    priority: "high",
  });

  const [errors, setErrors] = useState({});

  /* ---------------------------------------------------------
     FETCH CASES + EXECUTIVES
  --------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const caseRes = await axios.get(`${API}/cases`);
        if (caseRes.data.success) setCases(caseRes.data.data);

        const execRes = await axios.get(`${API}/field-executives`);
        if (execRes.data.success) setExecutives(execRes.data.data);
      } catch (err) {
        toast.error("Failed loading data");
      }
    })();
  }, []);

  /* ---------------------------------------------------------
     CASE SELECTION
  --------------------------------------------------------- */
  const handleCaseSelect = (e) => {
    const caseId = e.target.value;
    const selected = cases.find((c) => c._id === caseId);

    setFormData((prev) => ({
      ...prev,
      caseId,
      caseType: selected?.caseType || "",
      investigationVisits: [],
      selectedVisitEndpoint: "",
    }));

    setAlreadyVisits(selected?.alreadyVisits || []);
    setErrors((prev) => ({ ...prev, caseId: "" }));
  };


  /* ---------------------------------------------------------
     INPUT CHANGE HANDLER
  --------------------------------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ---------------------------------------------------------
     TOGGLE VISIT LOGIC & COMPONENT
  --------------------------------------------------------- */
  const toggleVisit = (visit) => {
    setFormData((prev) => {
      const exists = prev.investigationVisits.some((v) => v.visitKey === visit.key);
      let updated;

      if (exists) {
        updated = prev.investigationVisits.filter((v) => v.visitKey !== visit.key);
      } else {
        updated = [
          ...prev.investigationVisits,
          { visitKey: visit.key, label: visit.label, endpoint: visit.endpoint || "" },
        ];
      }

      // Optional: update selectedVisitEndpoint based on last selection or primary selection
      // For now, we leave it as references might be inside investigationVisits
      return { ...prev, investigationVisits: updated };
    });
  };

  const ToggleButton = ({ label, active, onClick, icon, disabled }) => {
    const IconComp = Icons[icon] || Icons.Circle;

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={!disabled ? onClick : undefined}
        className={`
        flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition
        ${disabled
            ? "bg-green-50 text-green-700 border-green-300 cursor-not-allowed opacity-80"
            : active
              ? "bg-blue-600 text-white border-blue-600 hover:scale-105"
              : "bg-white text-gray-700 border-gray-300 hover:scale-105"
          }
        active:scale-95
      `}
      >
        <IconComp size={16} />
        {label}
        {disabled && <Icons.CheckCircle2 size={16} className="text-green-600 ml-1" />}
      </button>
    );
  };


  /* ---------------------------------------------------------
     VALIDATION
  --------------------------------------------------------- */
  const validateStep = () => {
    const e = {};

    if (step === 0 && !formData.caseId) e.caseId = "Select a case";
    if (step === 1 && !formData.fieldExecutiveId) e.fieldExecutiveId = "Select an executive";
    if (step === 2 && formData.investigationVisits.length === 0)
      e.investigationVisits = "Select at least one visit";

    if (step === 3) {
      if (!formData.contactPersonName) e.contactPersonName = "Required";
      if (!formData.contactPersonPhone) e.contactPersonPhone = "Required";
      else if (!/^\d{10}$/.test(formData.contactPersonPhone))
        e.contactPersonPhone = "Must be 10 digits";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => validateStep() && setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  /* ---------------------------------------------------------
     SUBMIT
  --------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    setLoading(true);

    try {
      const res = await axios.post(`${API}/assignments`, formData);

      if (res.data.success) {


        setFormData({
          caseId: "",
          caseType: "",
          fieldExecutiveId: "",
          investigationVisits: [],
          selectedVisitEndpoint: "",
          contactPersonName: "",
          contactPersonPhone: "",
          priority: "high",
        });

        setStep(0);
        onAssignmentCreated?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
     VISITS BASED ON CASE TYPE
  --------------------------------------------------------- */
  const VISITS = getVisitRoutes(formData.caseType);

  /* ---------------------------------------------------------
     UI START
  --------------------------------------------------------- */
  return (
    <div className="max-w-full mx-auto bg-white shadow-md rounded-lg p-6">

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          {["Case", "Executive", "Visits", "Contact"].map((t, i) => (
            <span key={i} className={i === step ? "text-blue-600 font-bold" : "text-gray-500"}>
              {t}
            </span>
          ))}
        </div>

        <div className="w-full bg-gray-300 h-2 rounded">
          <div
            className="bg-blue-600 h-2 rounded transition-all"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ---------------- STEP 0: CASE ---------------- */}
        {step === 0 && (
          <div>
            <label className="block mb-2 text-sm font-medium">Select Case *</label>
            <select
              value={formData.caseId}
              onChange={handleCaseSelect}
              className={`w-full p-2 border rounded ${errors.caseId && "border-red-500"}`}
            >
              <option value="">Select case</option>
              {cases.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.ourFileNo} — {c.vehicleNo}
                </option>
              ))}
            </select>
            {errors.caseId && <p className="text-red-500 text-sm">{errors.caseId}</p>}
          </div>
        )}

        {/* ---------------- STEP 1: EXECUTIVE ---------------- */}
        {step === 1 && (
          <div>
            <label className="block mb-2 text-sm font-medium">Select Executive *</label>
            <select
              name="fieldExecutiveId"
              value={formData.fieldExecutiveId}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.fieldExecutiveId && "border-red-500"}`}
            >
              <option value="">Select executive</option>
              {executives.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.fullName} - {e.contactNumber}
                </option>
              ))}
            </select>

            {errors.fieldExecutiveId && (
              <p className="text-red-500 text-sm">{errors.fieldExecutiveId}</p>
            )}
          </div>
        )}

        {/* ---------------- STEP 2: VISITS ---------------- */}
        {step === 2 && (
          <div>
            <label className="block mb-2 font-medium text-sm">
              Investigation Visits ({formData.caseType})
            </label>

            <div className="flex flex-wrap gap-3">
              {VISITS.map((v) => {
                // Check if visit is already assigned (handle object structure from DB)
                const isAssigned = alreadyVisits.some((av) => (av.visitKey || av) === v.key);

                return (
                  <ToggleButton
                    key={v.key}
                    label={v.label}
                    icon={v.icon}
                    disabled={isAssigned}
                    active={formData.investigationVisits.some(
                      (sel) => sel.visitKey === v.key
                    )}
                    onClick={() => toggleVisit(v)}
                  />
                );
              })}

            </div>

            {errors.investigationVisits && (
              <p className="text-red-500 text-sm mt-2">{errors.investigationVisits}</p>
            )}
          </div>
        )}

        {/* ---------------- STEP 3: CONTACT ---------------- */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">Contact Person *</label>
              <input
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.contactPersonName && "border-red-500"}`}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Phone *</label>
              <input
                name="contactPersonPhone"
                value={formData.contactPersonPhone}
                onChange={handleChange}
                placeholder="10 digits"
                className={`w-full p-2 border rounded ${errors.contactPersonPhone && "border-red-500"}`}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Selected Endpoint</label>
              <input
                readOnly
                value={formData.selectedVisitEndpoint}
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {/* ---------------- BUTTONS ---------------- */}
        <div className="flex justify-between mt-6">
          {step > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Previous
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "Assigning..." : "Assign Case"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
