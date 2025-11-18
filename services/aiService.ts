import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Timetable, TimetableConstraints } from '../types';

const SYSTEM_INSTRUCTION_CHATBOT = `You are a helpful academic assistant for the Smart Academic Management System.
Your role is to help students, faculty, and admins with their academic needs.
You can generate Q&A, create topic-wise notes, provide explanations and summaries,
and help with assignments, quizzes, and finding learning resources.
Please format your responses using Markdown for better readability.`;

let ai: GoogleGenAI | null = null;
try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI. Make sure API_KEY is set.", error);
}

const formatHistoryForApi = (history: ChatMessage[]) => {
  // Exclude the welcome message from the history sent to the API
  return history.filter(m => m.id !== 'welcome-msg').map(message => ({
    role: message.sender === 'user' ? 'user' : 'model',
    parts: [{ text: message.text }]
  }));
}

export const generateResponse = async (prompt: string, history: ChatMessage[]): Promise<string> => {
  if (!ai) {
    throw new Error("AI Service is not initialized. Please check your API key.");
  }

  try {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: SYSTEM_INSTRUCTION_CHATBOT },
        history: formatHistoryForApi(history)
    });
    
    const response = await chat.sendMessage({ message: prompt });
    return response.text;
  } catch (error) {
    console.error("Error generating response from Gemini API:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
};

const timetableResponseSchema = {
    type: Type.OBJECT,
    properties: {
        timetables: {
            type: Type.ARRAY,
            description: "A list of three distinct, ranked timetable options.",
            items: {
                type: Type.OBJECT,
                properties: {
                    option: { type: Type.NUMBER, description: "The rank of this timetable option (1, 2, or 3)." },
                    reasoning: { type: Type.STRING, description: "A brief explanation of why this timetable is a good option (e.g., balanced workload, no long gaps)." },
                    schedule: {
                        type: Type.ARRAY,
                        description: "The weekly schedule for this timetable option.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.STRING, description: "Day of the week (e.g., 'Monday')." },
                                time: { type: Type.STRING, description: "Time slot (e.g., '09:00 - 10:00')." },
                                subject: { type: Type.STRING, description: "Name of the subject." },
                                faculty: { type: Type.STRING, description: "Name of the faculty teaching." },
                                classroom: { type: Type.STRING, description: "Name of the classroom." },
                            },
                             required: ["day", "time", "subject", "faculty", "classroom"],
                        }
                    }
                },
                required: ["option", "reasoning", "schedule"],
            }
        }
    },
    required: ["timetables"],
};


export const generateTimetable = async (constraints: TimetableConstraints): Promise<Timetable[]> => {
    if (!ai) throw new Error("AI Service is not initialized.");

    const prompt = `
        You are an expert academic scheduler. Your task is to create three conflict-free, optimized weekly timetables based on the following constraints.
        
        Constraints:
        - Course: ${constraints.courseId}
        - Semester: ${constraints.semester}
        - Subjects to schedule: ${constraints.subjects.join(', ')}
        - Available faculty: ${constraints.faculties.join(', ')}
        - Available classrooms: ${constraints.classrooms.join(', ')}
        - Available time slots: ${constraints.timing.join(', ')}
        - Each subject should be scheduled at least once per week.
        - A faculty member or a classroom cannot be in two places at once.
        - Try to balance the daily workload for students. Avoid scheduling too many difficult subjects back-to-back.
        - Rank the three generated timetables from best (1) to worst (3), providing a brief reasoning for each ranking.
        - Ensure the output is a valid JSON object matching the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: timetableResponseSchema,
            },
        });

        const jsonText = response.text;
        const parsedJson = JSON.parse(jsonText);
        
        if (!parsedJson.timetables || !Array.isArray(parsedJson.timetables)) {
            throw new Error("Invalid format received from AI. Expected a 'timetables' array.");
        }

        return parsedJson.timetables as Timetable[];

    } catch (error) {
        console.error("Error generating timetable from Gemini API:", error);
        throw new Error("Failed to generate timetable. The AI model may be experiencing issues.");
    }
};


export const generateLearningResource = async (topic: string): Promise<string> => {
    if (!ai) {
        throw new Error("AI Service is not initialized. Please check your API key.");
    }

    const prompt = `
        As an expert teacher, create a concise and easy-to-understand learning resource on the following topic: "${topic}".
        The output should be formatted in Markdown and must include the following sections:
        
        ### 1. Summary
        Provide a brief, one-paragraph summary of the topic.
        
        ### 2. Key Learning Points
        List the most important concepts or facts as a bulleted list. Aim for 3-5 key points.
        
        ### 3. Practice Questions
        Create 2-3 simple questions to help a student test their understanding of the material.
    `;
    
    const systemInstruction = "You are an expert educator who excels at breaking down complex topics for students.";

    try {
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction },
        });

        return response.text;
    } catch (error) {
        console.error("Error generating learning resource from Gemini API:", error);
        return "I'm sorry, I encountered an error while generating the learning material. Please try again.";
    }
};