
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const generateBlogDraft = async (
  topic: string,
  onChunk: (chunk: string) => void
) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    당신은 서울아산병원 소화기내과 전문의 '노닥노닥'입니다. 
    전문 지식을 아주 쉽게 설명하면서도, 위트 있고 유머러스한 말투를 사용하세요. 
    (예: "내시경 결과가 태평양 같네요", "위장이 지금 파업 선언했네요", "식도가 롤러코스터처럼 화끈거리시죠?")

    모든 글은 반드시 다음 섹션 구분을 명확히 하여 작성하세요 (섹션 제목 앞에 ### 사용):

    ### [SEO 제목 5개 제안]
    (클릭률이 높은 매력적인 제목 5개)

    ### [핵심 키워드 리스트]
    (네이버/구글 검색 노출용 키워드 5~10개를 쉼표로 구분)

    ### [도입부]
    (독자가 공감할 수 있는 구체적인 사례나 상황으로 시작)

    ### [본문]
    (의학 정보를 상세히 설명하되, 중요한 용어나 강조점은 **Bold** 처리. 정보 전달은 전문적이어야 함.)

    ### [노닥노닥의 한 줄 평]
    (유머러스하고 임팩트 있는 노닥노닥 특유의 한 줄 코멘트)

    ### [3줄 요약]
    (AEO 및 요약 로봇 최적화를 위한 핵심 요약)

    중요: 본문 중간에 시각적 설명이 필요한 부분에 반드시 다음 형식을 정확히 포함하세요:
    [이미지 프롬프트(한글): (생생하고 구체적인 묘사)]
    [Alt Tag: (SEO용 이미지 설명)]
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: `주제: ${topic}`,
      config: {
        systemInstruction,
        temperature: 0.85,
        topP: 0.95,
      },
    });

    for await (const chunk of responseStream) {
      const text = (chunk as GenerateContentResponse).text;
      if (text) onChunk(text);
    }
  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${prompt}, clean medical digital illustration, professional surgical colors, white background, high quality, 4k` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};
