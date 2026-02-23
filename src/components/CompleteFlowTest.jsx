import React, { useState } from 'react';
import axios from 'axios';
import { API } from '../utils/api';

const CompleteFlowTest = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [flowData, setFlowData] = useState({
    reportId: '',
    personId: '',
    imageUrl: '',
    assignmentId: '65a1b2c3d4e5f6a7b8c9d0e1',
    caseId: '65a1b2c3d4e5f6a7b8c9d0e2',
    fieldExecutiveId: '65a1b2c3d4e5f6a7b8c9d0e3',
  });
  const [results, setResults] = useState({});

  const API_BASE = API;

  const step1CreateDraft = async () => {
    try {
      const reportData = {
        assignmentId: flowData.assignmentId,
        caseId: flowData.caseId,
        fieldExecutiveId: flowData.fieldExecutiveId,
        investigationDate: '2024-01-15',
        investigationTime: '10:30 AM',
        locationVisited: '123 Test Street, Mumbai'
      };
      
      const response = await axios.post(`${API_BASE}/investigations`, reportData);
      setFlowData({...flowData, reportId: response.data.data._id});
      setResults({...results, step1: response.data});
      setCurrentStep(2);
      alert('✅ Step 1: Draft report created!');
    } catch (error) {
      alert('❌ Step 1 failed: ' + error.response?.data?.message);
    }
  };

  const step2AddPerson = async () => {
    try {
      const personData = {
        personName: 'Test User',
        personAge: 30,
        personGender: 'Male',
        personAddress: '456 Test Ave, Delhi',
        personPhone: '9876543210',
        relationWithCase: 'Witness',
        personSequence: 1
      };
      
      const response = await axios.post(
        `${API_BASE}/investigations/${flowData.reportId}/persons`,
        personData
      );
      setFlowData({...flowData, personId: response.data.data._id});
      setResults({...results, step2: response.data});
      setCurrentStep(3);
      alert('✅ Step 2: Person added!');
    } catch (error) {
      alert('❌ Step 2 failed: ' + error.response?.data?.message);
    }
  };

  const step3UploadImage = async () => {
    // For demo, we'll use a placeholder URL
    const demoImageUrl = 'https://via.placeholder.com/300x200/007bff/ffffff?text=Test+Document';
    setFlowData({...flowData, imageUrl: demoImageUrl});
    setResults({...results, step3: {success: true, imageUrl: demoImageUrl}});
    setCurrentStep(4);
    alert('✅ Step 3: Image URL set (in real app, upload would happen here)');
  };

  const step4AddDocument = async () => {
    try {
      const documentData = {
        documentType: 'Aadhar Card',
        documentPhoto: flowData.imageUrl,
        documentNumber: '1234-5678-9012',
        documentDescription: 'Test Aadhar Card',
        documentSequence: 1
      };
      
      const response = await axios.post(
        `${API_BASE}/investigations/${flowData.reportId}/persons/${flowData.personId}/documents`,
        documentData
      );
      setResults({...results, step4: response.data});
      setCurrentStep(5);
      alert('✅ Step 4: Document added!');
    } catch (error) {
      alert('❌ Step 4 failed: ' + error.response?.data?.message);
    }
  };

  const step5AddStatement = async () => {
    try {
      const statementData = {
        statementText: 'I witnessed the incident. It happened around 10:30 AM.',
        statementPhoto: flowData.imageUrl,
        remarks: 'Cooperative witness'
      };
      
      const response = await axios.patch(
        `${API_BASE}/investigations/persons/${flowData.personId}/statement`,
        statementData
      );
      setResults({...results, step5: response.data});
      setCurrentStep(6);
      alert('✅ Step 5: Statement added!');
    } catch (error) {
      alert('❌ Step 5 failed: ' + error.response?.data?.message);
    }
  };

  const step6SubmitReport = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/investigations/${flowData.reportId}/submit`
      );
      setResults({...results, step6: response.data});
      setCurrentStep(7);
      alert('✅ Step 6: Report submitted!');
    } catch (error) {
      alert('❌ Step 6 failed: ' + error.response?.data?.message);
    }
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setFlowData({
      reportId: '',
      personId: '',
      imageUrl: '',
      assignmentId: '65a1b2c3d4e5f6a7b8c9d0e1',
      caseId: '65a1b2c3d4e5f6a7b8c9d0e2',
      fieldExecutiveId: '65a1b2c3d4e5f6a7b8c9d0e3',
    });
    setResults({});
  };

  const steps = [
    { number: 1, name: 'Create Draft Report', action: step1CreateDraft },
    { number: 2, name: 'Add Person', action: step2AddPerson },
    { number: 3, name: 'Upload Image', action: step3UploadImage },
    { number: 4, name: 'Add Document', action: step4AddDocument },
    { number: 5, name: 'Add Statement', action: step5AddStatement },
    { number: 6, name: 'Submit Report', action: step6SubmitReport },
    { number: 7, name: 'Complete!', action: null }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🔄 Complete Flow Test</h2>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.number
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}
              >
                {step.number}
              </div>
              <span className="text-xs mt-2 text-center">{step.name}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {steps.slice(0, -1).map((step, index) => (
            <div
              key={index}
              className={`h-1 flex-1 mx-1 ${
                currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Current Step Action */}
      <div className="text-center mb-6">
        {currentStep <= 6 && (
          <button
            onClick={steps[currentStep - 1].action}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg font-semibold"
          >
            Execute Step {currentStep}: {steps[currentStep - 1].name}
          </button>
        )}
        {currentStep === 7 && (
          <div className="text-center">
            <div className="text-green-600 text-2xl font-bold mb-4">🎉 Complete Flow Test Successful!</div>
            <button
              onClick={resetFlow}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Test Again
            </button>
          </div>
        )}
      </div>

      {/* Flow Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border border-gray-200 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Report ID</label>
          <input
            type="text"
            value={flowData.reportId}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Person ID</label>
          <input
            type="text"
            value={flowData.personId}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="text"
            value={flowData.imageUrl}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm"
          />
        </div>
      </div>

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <div className="space-y-4">
            {Object.entries(results).map(([step, result]) => (
              <div key={step} className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-semibold mb-2">Step {step.replace('step', '')}</h4>
                <pre className="text-sm whitespace-pre-wrap bg-white p-2 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteFlowTest;