type ChatHistoryItem = { role: string; parts: { text: string }[] };

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "";
const PROXY_TOKEN = (import.meta as any).env?.VITE_PROXY_TOKEN || "";

const apiUrl = (path: string) => {
  if (!API_BASE_URL) return path; // assumes same-origin proxy (optional)
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
};

const commonHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (PROXY_TOKEN) headers["X-Proxy-Token"] = PROXY_TOKEN;
  return headers;
};

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const chatWithWeldingExpert = async (message: string, history: ChatHistoryItem[]) => {
  try {
    const res = await fetch(apiUrl("/api/chat"), {
      method: "POST",
      headers: commonHeaders(),
      body: JSON.stringify({ message, history }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || `HTTP ${res.status}`);
    }
    return data?.text || "";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

export const analyzeWeldImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const res = await fetch(apiUrl("/api/analyze"), {
      method: "POST",
      headers: commonHeaders(),
      body: JSON.stringify({ base64Image, mimeType }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return data?.detail || data?.error || "Произошла ошибка при анализе изображения.";
    }
    return data?.text || "Не удалось проанализировать изображение.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Произошла ошибка при анализе изображения. Проверьте API ключ или попробуйте другое фото.";
  }
};
