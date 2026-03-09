import axios from "axios";

const API_URL = "https://new-patient-management-backend-syst.vercel.app/api";  // Change if deployed

export const searchPatientByMobile = async (mobile) => {
    return axios.get(`${API_URL}/patients/search?mobile=${mobile}`);
};

export const getPatientHistory = async (patient_id) => {
    try {
        const response = await axios.get(`https://new-patient-management-backend-syst.vercel.app/api/patients/${patient_id}/history`);
        return response.data;  // Return only data
    } catch (error) {
        return null;  // Avoid crashing if no history
    }
};


export const createPatient = async (data) => {
    return axios.post(`${API_URL}/patients`, data);
};

export const addConsultation = async (data) => {
    return axios.post(`${API_URL}/consultations`, data);
};
export const fetchSymptoms = async () => {
    const response = await axios.get("https://new-patient-management-backend-syst.vercel.app/api/symptoms");
    return response.data;
};

export const fetchMedicines = async () => {
    const response = await axios.get("https://new-patient-management-backend-syst.vercel.app/api/medicines");
    return response.data;
};
