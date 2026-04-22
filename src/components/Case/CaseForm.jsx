import { useState, useEffect, useCallback } from "react";
import { FileText, Car, User, DollarSign } from "lucide-react";
import { API } from "../../utils/api";
// State to Cities mapping
const STATE_CITY_MAP = {
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bharatpur"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur"],
};

export default function CaseForm({
  onSubmit = () => { },
  initialData = {},
  readOnly = false,
}) {
  const initialForm = {
    caseType: "",
    recordNumber: 0,
    ourFileNo: "",
    caseFirmId: "",
    dtOfCaseRec: new Date().toISOString().split('T')[0],
    caseRecVia: "",
    coClaimNo: "",
    policyNo: "",
    policyPeriod: "",
    vehicleNo: "",
    engineNo: "",
    chassisNo: "",
    nameOfInsured: "",
    addressOfInsured: "",
    contactNo: "",
    status: "pending",
    dtCaseSub: "",
    hardCopySubmittedOn: "",
    feeBillDt: "",
    billNo: "",
    feeBillRs: "",
    feeRec: "",
    feeRecDt: "",
  };

  const [form, setForm] = useState({ ...initialForm, ...initialData });
  const [caseFirmOptions, setCaseFirmOptions] = useState([]);
  const [state, setState] = useState("Rajasthan");
  const [city, setCity] = useState("Jaipur");
  const [availableCities, setAvailableCities] = useState(STATE_CITY_MAP["Rajasthan"] || []);

  // Extra state for caseRecVia "OTHER" textbox
  const [caseRecViaOther, setCaseRecViaOther] = useState("");
  // Extra state for policy period date pickers
  const [policyPeriodStart, setPolicyPeriodStart] = useState("");
  const [policyPeriodEnd, setPolicyPeriodEnd] = useState("");

  /* --------------------------
     MAIN FORM HANDLER
  -------------------------- */
  /* --------------------------
     EFFECT: PARSE INITIAL DATA
  -------------------------- */
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const data = { ...initialData };

      // Map caseFirmId (populated or ID) correctly
      if (data.caseFirmId) {
        const firmId = typeof data.caseFirmId === 'object' ? data.caseFirmId._id : data.caseFirmId;
        data.caseFirmId = firmId;

        // Sync City/State from the firm if it's already populated
        if (typeof initialData.caseFirmId === 'object') {
          if (initialData.caseFirmId.city) setCity(initialData.caseFirmId.city);
          if (initialData.caseFirmId.code && !data.ourFileNo) data.ourFileNo = initialData.caseFirmId.code;
        }
      }

      setForm((prev) => ({ ...prev, ...data }));

      // Parse policyPeriod "YYYY-MM-DD to YYYY-MM-DD"
      if (data.policyPeriod && typeof data.policyPeriod === 'string' && data.policyPeriod.includes(" to ")) {
        const [start, end] = data.policyPeriod.split(" to ");
        setPolicyPeriodStart(start);
        setPolicyPeriodEnd(end);
      }

      // Parse caseRecVia OTHER
      const standardVia = ["BY EMAIL", "BY HAND"];
      if (data.caseRecVia && !standardVia.includes(data.caseRecVia.toUpperCase())) {
        setForm(prev => ({ ...prev, caseRecVia: "OTHER" }));
        setCaseRecViaOther(data.caseRecVia);
      }
    }
  }, [initialData, caseFirmOptions]);

  /* --------------------------
     FETCH SPECIFIC FIRM BY ID (For existing cases)
  -------------------------- */
  useEffect(() => {
    const fetchFirmById = async () => {
      if (!form.caseFirmId || form.ourFileNo) return;

      // Check if already in options
      if (caseFirmOptions.some(f => f._id === form.caseFirmId)) return;

      try {
        const res = await fetch(`${API}/casefirm/${form.caseFirmId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setForm(prev => ({
            ...prev,
            ourFileNo: data.data.code || "",
            recordNumber: data.data.recordNumber || prev.recordNumber
          }));
        }
      } catch (err) {
        console.error("Error fetching specific firm:", err);
      }
    };
    fetchFirmById();
  }, [form.caseFirmId, form.ourFileNo, caseFirmOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };



  /* --------------------------
     HANDLE STATE CHANGE
  -------------------------- */
  useEffect(() => {
    const cities = STATE_CITY_MAP[state] || [];
    setAvailableCities(cities);
    // Set first city as default when state changes
    if (cities.length > 0) {
      setCity(cities[0]);
    }
  }, [state]);

  /* --------------------------
     INITIAL LOAD
  -------------------------- */
  const fetchCaseFirmsList = useCallback(async () => {
    if (!city) return;
    try {
      const res = await fetch(
        `${API}/casefirm/city/${city}`
      );
      const data = await res.json();

      if (data.success && data.data) {
        setCaseFirmOptions(data.data);
      } else {
        setCaseFirmOptions([]);
      }
    } catch (err) {
      console.error("Error fetching case firms:", err);
      setCaseFirmOptions([]);
    }
  }, [city]);

  /* --------------------------
     INITIAL LOAD
  -------------------------- */
  useEffect(() => {
    fetchCaseFirmsList();
  }, [fetchCaseFirmsList]);

  // Handle automatic file code generation
  useEffect(() => {
    // Only auto-generate for NEW cases
    if (initialData && initialData._id) return;

    if (form.ourFileNoId && form.caseType) {
      const firm = caseFirmOptions.find(f => f._id === form.ourFileNoId);
      if (firm) {
        // Map exactly to the actual code from the firm as requested
        const actualCode = firm.code || "";
        if (actualCode !== form.ourFileNo) {
          setForm(prev => ({ ...prev, ourFileNo: actualCode }));
        }
      }
    }
  }, [form.caseType, form.ourFileNoId, caseFirmOptions]);



  /* --------------------------
     SUBMIT HANDLER
  -------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.caseType) return alert("Select case type");
    if (!form.recordNumber) return alert("Select CaseFirm");
    if (form.contactNo && form.contactNo.length < 10) {
      return alert("Contact number must be exactly 10 digits");
    }

    // Compose policyPeriod as "startDate to endDate" string
    const composedPolicyPeriod =
      policyPeriodStart && policyPeriodEnd
        ? `${policyPeriodStart} to ${policyPeriodEnd}`
        : form.policyPeriod;

    // If caseRecVia is OTHER, use the typed text
    const finalCaseRecVia =
      form.caseRecVia === "OTHER" ? caseRecViaOther : form.caseRecVia;

    onSubmit({
      ...form,
      policyPeriod: composedPolicyPeriod,
      caseRecVia: finalCaseRecVia,
      contactNo: String(form.contactNo),
      // Ensure backend-friendly ID mapping
      caseFirmId: form.caseFirmId,
      ourFileNoId: form.caseFirmId, // Send both just in case
    });
  };
  function generateNextFirmCode(firm) {
    // We now just return the actual code as requested
    return firm?.code || "";
  }
  /* --------------------------
     DATE FIELDS
  -------------------------- */
  const dateFields = [
    // Main form date fields
    "dtOfCaseRec",
    "dateOfLoss",
    "dtCaseSub",
    "hardCopySubmittedOn",
    "feeBillDt",
    "feeRecDt",
    // OD Details date fields
    "dateOfLossAndTime",
    "firDetailsDate",
    "dateOfClaimIntimated",
    "registrationDate",
    // Theft Details date fields
    "investigationAppointmentDate",
    "firstContactDate",
    "dateOfPurchase",
  ];

  /* --------------------------
     FORM SECTIONS
  -------------------------- */
  const formatLabel = (key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="max-w-7xl rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* HEADER */}
          <div className="px-2 py-3 bg-blue-600 text-white">
            <h2 className="text-2xl font-bold text-center">
              {initialData._id ? "Edit Case" : "New Case Registration"}
            </h2>
          </div>

          <div className="p-6 sm:p-10 space-y-10">
            {/* STATE AND CITY SELECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* STATE */}
              <div>
                <label className="block text-sm font-bold mb-2.5">Select State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 border rounded-md bg-white"
                >
                  {Object.keys(STATE_CITY_MAP).map((stateName) => (
                    <option key={stateName} value={stateName}>
                      {stateName}
                    </option>
                  ))}
                </select>
              </div>

              {/* CITY */}
              <div>
                <label className="block text-sm font-bold mb-2.5">Select City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 border rounded-md bg-white"
                  disabled={availableCities.length === 0}
                >
                  {availableCities.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Case Type */}
            <div>
              <label className="block mb-1">Case Type</label>
              <select
                name="caseType"
                value={form.caseType}
                onChange={(e) => {
                  handleChange(e);
                  // Clear firm selection when case type changes
                  setForm(prev => ({ ...prev, ourFileNoId: "", ourFileNo: "", recordNumber: 0 }));
                }}
                className="w-full p-3 border rounded-md"
              >
                <option value="">Select Case Type</option>
                <option value="OD">OD (Own Damage)</option>
                <option value="THEFT">THEFT</option>
                <option value="TP">TP</option>
                <option value="FIRE">Fire</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* CaseFirm Dropdown */}
            <label className="block text-sm font-bold mb-2.5">
              Select CaseFirm (Auto-fill Record Number)
            </label>
            <select
              value={form.caseFirmId || ""}
              onChange={(e) => {
                const firm = caseFirmOptions.find(
                  (f) => f._id === e.target.value
                );

                if (firm) {
                  setForm((prev) => ({
                    ...prev,
                    recordNumber: (firm.recordNumber || 0) + 1,
                    caseFirmId: firm._id,
                    ourFileNo: firm.code || "",
                  }));
                } else {
                  setForm(prev => ({ ...prev, caseFirmId: "", recordNumber: 0, ourFileNo: "" }));
                }
              }}
              className="w-full p-3 border rounded-md bg-white disabled:opacity-50"
              disabled={!form.caseType}
            >
              <option value="">{form.caseType ? `-- Select ${form.caseType} Firm --` : "-- Select Case Type First --"}</option>
              {(caseFirmOptions || [])
                .filter((f) => (f.operationType || "").toUpperCase() === (form.caseType || "").toUpperCase())
                .map((firm) => (
                  <option key={firm._id} value={firm._id}>
                    {firm.name} ({firm.city}) — {firm.code}
                  </option>
                ))}
            </select>

            {/* MAIN FORM SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT SIDE */}
              <div className="space-y-8">
                <h3 className="text-lg font-bold">Case Information</h3>


                {/* Our File No (Generated) */}
                <div>
                  <label className="block mb-1 font-bold text-blue-700">File No</label>
                  <input
                    type="text"
                    name="ourFileNo"
                    value={form.ourFileNo || ""}
                    readOnly
                    className="w-full p-3 border rounded-md bg-blue-50 font-mono font-bold text-blue-800"
                    placeholder="Select CaseFirm to generate..."
                  />
                </div>

                {/* Dt Of Case Rec */}
                <div>
                  <label className="block mb-1">Dt Of Case Rec</label>
                  <input
                    type="date"
                    name="dtOfCaseRec"
                    value={form.dtOfCaseRec}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md"
                  />
                </div>

                {/* Case Rec Via — Select with OTHER text box */}
                <div>
                  <label className="block mb-1">Case Rec Via</label>
                  <select
                    name="caseRecVia"
                    value={form.caseRecVia}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md"
                  >
                    <option value="">Select Option</option>
                    <option value="BY EMAIL">By Email</option>
                    <option value="BY HAND">By Hand</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {form.caseRecVia === "OTHER" && (
                    <input
                      type="text"
                      placeholder="Please specify..."
                      value={caseRecViaOther}
                      onChange={(e) => setCaseRecViaOther(e.target.value)}
                      className="w-full p-3 border rounded-md mt-2"
                    />
                  )}
                </div>

                {/* Co Claim No */}
                <div>
                  <label className="block mb-1">Co Claim No</label>
                  <input
                    type="text"
                    name="coClaimNo"
                    value={form.coClaimNo}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md"
                  />
                </div>

                {/* Policy No */}
                <div>
                  <label className="block mb-1">Policy No</label>
                  <input
                    type="text"
                    name="policyNo"
                    value={form.policyNo}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md"
                  />
                </div>

                {/* Policy Period — Two Date Pickers */}
                <div>
                  <label className="block mb-1">Policy Period</label>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={policyPeriodStart}
                        onChange={(e) => {
                          const start = e.target.value;

                          setPolicyPeriodStart(start);

                          if (!start) {
                            setPolicyPeriodEnd("");
                            return;
                          }

                          const date = new Date(start);
                          date.setFullYear(date.getFullYear() + 1);

                          const endDate = date.toISOString().split("T")[0];

                          setPolicyPeriodEnd(endDate);
                        }}
                        className="w-full p-3 border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={policyPeriodEnd}
                        onChange={(e) => setPolicyPeriodEnd(e.target.value)}
                        className="w-full p-3 border rounded-md"
                      />
                    </div>
                  </div>

                  {policyPeriodStart && policyPeriodEnd && (
                    <p className="text-xs text-gray-500 mt-1">
                      Will be saved as:{" "}
                      <strong>
                        {policyPeriodStart} to {policyPeriodEnd}
                      </strong>
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="space-y-8">
                <h3 className="text-lg font-bold">Insured / Vehicle</h3>

                {[
                  "vehicleNo",
                  "engineNo",
                  "chassisNo",
                  "dateOfLoss",
                  "nameOfInsured",

                ].map((key) => (
                  <div key={key}>
                    <label className="block mb-1">{formatLabel(key)}</label>
                    <input
                      type={dateFields.includes(key) ? "date" : "text"}
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-md"
                    />
                  </div>
                ))}
                <div >
                  <label className="block mb-1">addressOfInsured</label>
                  <textarea
                    type={"textArea"}
                    name={"addressOfInsured"}
                    value={form["addressOfInsured"]}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md"
                  />
                </div>
                {/* Contact No — input type number, passed as String */}
                <div>
                  <label className="block mb-1">Contact No</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="contactNo"
                    value={form.contactNo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setForm((prev) => ({ ...prev, contactNo: val }));
                    }}
                    className="w-full p-3 border rounded-md"
                    placeholder="Enter Contact Number"
                    minLength="10"
                    maxLength="10"
                  />
                </div>
              </div>
            </div>


          </div>

          {/* FOOTER BUTTON */}
          {!readOnly && (
            <div className="p-6 border-t text-right">
              <button
                type="submit"
                className="px-10 py-3 rounded-xl bg-blue-600 text-white font-bold"
              >
                {initialData._id ? "Update Case" : "Submit Case"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
