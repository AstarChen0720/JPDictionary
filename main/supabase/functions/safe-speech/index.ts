// 設定 CORS HEADERS，讓前端可以跨域呼叫
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};


Deno.serve(async (req) => {
  // 1. 處理預檢請求 (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. 取得前端傳來的文字
    const { howToSpeechText } = await req.json();
    if (!howToSpeechText) {
      throw new Error("找不到輸入的文字");
    }

    // 3. 取得 API Key (請記得在 Supabase Dashboard 設定 GOOGLE_TTS_API_KEY)
    // 也可以沿用之前的 AI_API_KEY 或另外設定一個專門的
    const SPEECH_API_KEY =
      Deno.env.get("SPEECH_API_KEY") || Deno.env.get("VITE_SPEECH_API_KEY");

    if (!SPEECH_API_KEY) {
      throw new Error("找不到 SPEECH_API_KEY");
    }

    //要給播音公司的包裹(委託書)
    const speechOrder = {
      audioConfig: {
        audioEncoding: "MP3", //編碼格式(要寄回的是錄音帶還是CD...)
        pitch: 0, //音調高低
        speakingRate: 1, //說話速度
      },
      input: { text: howToSpeechText }, //要念的內容
      voice: {
        //聲音設定
        languageCode: "ja-JP",
        name: "ja-JP-Chirp3-HD-Autonoe",
      },
    };

    //將會員卡上的會員資訊一併放入並寄給播音公司
    const response = await fetch(
      //fetch是郵差他會將包裹寄去再送回對方的回擲,他需要地址和包裹,fetch(地址,包裹(有一堆選項))
      //地址
      `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${SPEECH_API_KEY}`,
      //包裹
      {
        method: "POST", //投遞目的(ex訂購,退貨...)
        headers: { "Content-Type": "application/json" }, //說明標籤(ex:內含易碎物品)
        body: JSON.stringify(speechOrder), //包裹本身,且將包裹本身裝成易於運送的盒子(郵包)寄出
      },
    );

    //如果呼叫 Google TTS API 發生錯誤，拋出錯誤訊息
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google TTS 錯誤回報: ${response.status} ${errorText}`);
    }

    //取出播音公司寄回的包裹內容(CD)並拆開盒子取出
    //.json()代表抓body的內容並轉成JSON格式
    const speechCD = await response.json();

    // 4. 回傳給前端
    return new Response(JSON.stringify(speechCD), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    // 錯誤處理
  } catch (error) {
    console.error("Function Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      },
    )
  }
})

