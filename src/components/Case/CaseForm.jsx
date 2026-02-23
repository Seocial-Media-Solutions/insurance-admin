import { useState, useEffect } from "react";
import { FileText, Car, User, DollarSign } from "lucide-react";

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
    ourFileNo: "",
    ourFileNoId: "",
    dtOfCaseRec: "",
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

  /* --------------------------
     MAIN FORM HANDLER
  -------------------------- */
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
  useEffect(() => {
    fetchCaseFirmsList();
  }, [city]);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [JSON.stringify(initialData)]);



  const fetchCaseFirmsList = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/casefirm/city/${city}`
      );
      const data = await res.json();

      // Handle both successful and error responses
      if (data.success && data.data) {
        setCaseFirmOptions(data.data);
        console.log("Fetched CaseFirms:", data.data);
      } else {
        setCaseFirmOptions([]);
        console.log(`No case firms found for ${city}`);
      }
    } catch (err) {
      console.error("Error fetching case firms:", err);
      setCaseFirmOptions([]);
    }
  };

  /* --------------------------
     SUBMIT HANDLER
  -------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.caseType) return alert("Select case type");
    if (!form.ourFileNo) return alert("Select CaseFirm");
    onSubmit(form);
  };
  function generateNextFirmCode(firm) {
    if (!firm || !firm.code) return "";

    const nextRecordNumber = (firm.recordNumber || 0) + 1;

    const baseCode = firm.code.replace(/\/\d+$/, ""); // remove last number

    return `${baseCode}/${String(nextRecordNumber).padStart(3, "0")}`;
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

            {/* CaseFirm Dropdown */}
            <label className="block text-sm font-bold mb-2.5">
              Select CaseFirm (Auto-fill File No)
            </label>
            <select
              onChange={(e) => {
                const firm = caseFirmOptions.find(
                  (f) => f._id === e.target.value
                );

                if (firm) {
                  setForm((prev) => ({
                    ...prev,
                    ourFileNo: generateNextFirmCode(firm),
                    ourFileNoId: firm._id,
                  }));
                }
              }}
              className="w-full p-3 border rounded-md"
            >
              <option value="">-- Select Case Firm --</option>
              {(caseFirmOptions || []).map((firm) => (
                <option key={firm._id} value={firm._id}>
                  {firm.name} ({firm.city}) — {generateNextFirmCode(firm)}
                </option>
              ))}
            </select>

            {/* MAIN FORM SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT SIDE */}
              <div className="space-y-8">
                <h3 className="text-lg font-bold">Case Information</h3>

                {[
                  "caseType",
                  "dtOfCaseRec",
                  "caseRecVia",
                  "coClaimNo",
                  "policyNo",
                  "policyPeriod",
                ].map((key) => (
                  <div key={key}>
                    <label className="block mb-1">{formatLabel(key)}</label>

                    {key === "caseType" ? (
                      <select
                        name="caseType"
                        value={form.caseType}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md"
                      >
                        <option value="">Select Case Type</option>
                        <option value="OD">OD (Own Damage)</option>
                        <option value="THEFT">THEFT</option>
                        <option value="TP">TP</option>
                        <option value="FIRE">Fire</option>
                        <option value="OTHER">Other</option>
                      </select>
                    ) : (
                      <input
                        type={dateFields.includes(key) ? "date" : "text"}
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md"
                      />
                    )}
                  </div>
                ))}
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
                  "addressOfInsured",
                  "contactNo",
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
