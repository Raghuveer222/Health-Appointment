const { callLLMApi } = require('../integrations/llmClient');
const AIInteraction = require('../models/AIInteraction');
const { logEvent } = require('../utils/logger');

/**
 * Generate AI Pre-visit Summary from patient symptoms
 */
const generatePreVisitSummary = async (symptomsData, userId) => {
  const { symptoms, duration, severity, additionalInfo } = symptomsData;
  const prompt = `Analyse these patient-submitted symptoms:
Symptoms: ${symptoms || 'N/A'}
Duration: ${duration || 'N/A'}
Severity: ${severity || 'Moderate'}
Additional Info: ${additionalInfo || 'None'}

Return a JSON object with EXACTLY these keys:
{
  "urgencyLevel": "Low" | "Medium" | "High",
  "chiefComplaint": "A concise 1-sentence summary of the main complaint",
  "suggestedQuestions": [
    "Question 1 for the doctor to ask",
    "Question 2 for the doctor to ask",
    "Question 3 for the doctor to ask"
  ]
}`;

  const systemInstruction = "You are an administrative medical triage assistant. You summarize patient symptoms and suggest clinical questions for the physician. Do NOT provide a definitive diagnosis or medical advice. Output valid JSON only.";

  try {
    const rawResponse = await callLLMApi(prompt, systemInstruction);
    let parsed = JSON.parse(rawResponse.trim());

    // Basic structure validation
    if (!parsed.urgencyLevel || !parsed.chiefComplaint || !Array.isArray(parsed.suggestedQuestions)) {
      throw new Error('Invalid JSON structure from LLM response');
    }

    const urgencyLevel = ['Low', 'Medium', 'High'].includes(parsed.urgencyLevel) ? parsed.urgencyLevel : 'Medium';
    const result = {
      urgencyLevel,
      chiefComplaint: parsed.chiefComplaint || 'Patient experiencing submitted symptoms.',
      suggestedQuestions: parsed.suggestedQuestions.slice(0, 3),
      preVisitSummary: `Urgency: ${urgencyLevel}. Chief Complaint: ${parsed.chiefComplaint}`,
    };

    if (userId) {
      await AIInteraction.create({
        userId,
        type: 'PRE_VISIT',
        prompt,
        rawResponse,
        parsedOutput: result,
        status: 'SUCCESS',
      });
    }

    return result;
  } catch (error) {
    logEvent('LLM Failure', `Pre-visit AI summary failed: ${error.message}. Using safe fallback.`);

    if (userId) {
      await AIInteraction.create({
        userId,
        type: 'PRE_VISIT',
        prompt,
        rawResponse: error.message,
        status: 'FALLBACK_USED',
      }).catch(() => {});
    }

    return {
      urgencyLevel: 'Unknown',
      chiefComplaint: symptoms ? `Patient presented with: ${symptoms.substring(0, 100)}` : 'Symptoms submitted by patient.',
      suggestedQuestions: [],
      preVisitSummary: 'AI summary unavailable. Please review the patient\'s submitted symptoms.',
    };
  }
};

/**
 * Generate AI Post-visit Summary from doctor clinical notes & prescription
 */
const generatePostVisitSummary = async (doctorNotes, medications = [], doctorName = 'the doctor', userId) => {
  const prompt = `Convert these clinical consultation notes into a clear, patient-friendly summary:
Doctor Notes: ${doctorNotes || 'Consultation completed.'}
Prescribed Medications: ${JSON.stringify(medications)}

Return a JSON object with EXACTLY these keys:
{
  "summary": "Patient-friendly simple summary of consultation findings and advice",
  "medicationSchedule": [
    {
      "medicine": "Medicine name",
      "dosage": "Dosage",
      "frequency": "Frequency",
      "duration": "Duration"
    }
  ],
  "followUpSteps": [
    "Step 1",
    "Step 2"
  ]
}`;

  const systemInstruction = "You are a patient education assistant. Convert clinical terminology into friendly, simple instructions for the patient. Output valid JSON only.";

  try {
    const rawResponse = await callLLMApi(prompt, systemInstruction);
    let parsed = JSON.parse(rawResponse.trim());

    const result = {
      summary: parsed.summary || `Consultation complete with Dr. ${doctorName}.`,
      medicationSchedule: Array.isArray(parsed.medicationSchedule) ? parsed.medicationSchedule : [],
      followUpSteps: Array.isArray(parsed.followUpSteps) ? parsed.followUpSteps : ['Follow doctor advice', 'Rest and hydrate'],
      postVisitSummaryFormatted: parsed.summary,
    };

    if (userId) {
      await AIInteraction.create({
        userId,
        type: 'POST_VISIT',
        prompt,
        rawResponse,
        parsedOutput: result,
        status: 'SUCCESS',
      });
    }

    return result;
  } catch (error) {
    logEvent('LLM Failure', `Post-visit AI summary failed: ${error.message}. Using safe fallback.`);

    const formattedMeds = medications.map(m => ({
      medicine: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
    }));

    return {
      summary: `Consultation notes recorded by Dr. ${doctorName}: ${doctorNotes || 'Please follow doctor recommendations.'}`,
      medicationSchedule: formattedMeds,
      followUpSteps: ['Take prescribed medications as directed.', 'Contact clinic if symptoms persist or worsen.'],
      postVisitSummaryFormatted: `Consultation notes recorded by Dr. ${doctorName}: ${doctorNotes || 'Completed.'}`,
    };
  }
};

module.exports = {
  generatePreVisitSummary,
  generatePostVisitSummary,
};
