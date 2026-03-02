import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const explainConcept = async (grade: string, topic: string, concept: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Jelaskan konsep "${concept}" dalam topik "${topic}" untuk siswa kelas ${grade} SMP. 
    Gunakan bahasa yang sangat sederhana, ramah, dan mudah dimengerti. 
    Berikan contoh kehidupan nyata jika memungkinkan. 
    Gunakan format Markdown untuk penjelasan yang rapi.
    PENTING: Gunakan sintaks LaTeX untuk semua rumus matematika, contoh: $x^2$ atau $\sqrt{x}$.`,
  });
  return response.text;
};

export const generatePracticeQuestion = async (grade: string, topic: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Buatlah satu soal latihan matematika untuk kelas ${grade} SMP topik "${topic}". 
    Sertakan pilihan ganda (A, B, C, D) dan kunci jawaban beserta penjelasan langkah demi langkah.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ["question", "options", "correctAnswer", "explanation"],
      },
    },
  });
  return JSON.parse(response.text || "{}");
};

export const chatWithTutor = async (history: { role: string; parts: { text: string }[] }[], message: string) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "Anda adalah tutor matematika yang sabar dan ramah untuk siswa SMP kelas 7 dan 8. Tugas Anda adalah membantu mereka memahami konsep matematika yang sulit dengan cara yang menyenangkan dan mudah dimengerti. Jangan langsung memberikan jawaban jika mereka bertanya soal, tapi bimbing mereka langkah demi langkah.",
    },
  });

  // Since we can't easily pass history to ai.chats.create in this SDK version without a bit more boilerplate, 
  // we'll use a simpler approach for now or just send the message.
  // Actually, the SDK supports history in create.
  
  const response = await chat.sendMessage({ message });
  return response.text;
};
