// 這是 Vercel 的 Serverless Function(=cloud function) (Node.js 環境)

//因為我的網站不是全天候在運作的,所以要他直接幫我處理chrome extension傳來的請求
//他負責將我chrome extension傳來的文字組合後supabse edge function處理然後把結果回傳給chrome extension並上傳到supabase資料庫

//要寫export是因為這最後是要給vercel serverless function運作的
export default async function handler(req, res) {
  // === 緊急測試：先確保伺服器會回話 ===
  console.log("Vercel Function 被呼叫了！ Method:", req.method); // 請看 VS Code 終端機有沒有這行

  //設定 CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // 這裡故意加一個簡單的回傳測試，如果連這個都失敗，那就是本地環境大問題
    if (req.method === "GET") {
      return res.status(200).json({ message: "API is working!" });
    }

    if (!req.body) throw new Error("無請求內容 (req.body is empty)");

    const { word, sentence } = req.body;

    // 讀取新的 .env 檔
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_API_KEY; // 確認名稱一致

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("缺少變數:", { supabaseUrl, supabaseAnonKey }); // 這行會顯示在終端機
      throw new Error("環境變數讀取失敗");
    }

    const orderInput = `請分析日文單字：「${word}」。(特別注意此單字是出現在這個上下文句子中：「${sentence}」)`;
    console.log("正在呼叫 Supabase:", supabaseUrl); // 終端機顯示進度

    const response = await fetch(`${supabaseUrl}/functions/v1/safe-cooker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ orderInput }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Supabase Error:", errText); // 終端機顯示錯誤
      throw new Error(errText);
    }

    const bendoMeals = await response.json();

    // 直接回傳，前端會處理顯示
    res.status(200).json({
      result: generateHtml(bendoMeals, word), // 把 HTML 產生邏輯抽出去讓程式碼乾淨點
      raw: bendoMeals,
    });
  } catch (error) {
    console.error("Handler Error:", error); // 終端機顯示錯誤
    res.status(500).json({ error: error.message || "Unknown Error" });
  }
}

// 輔助函式：產生 HTML (放在檔案最下方即可)
function generateHtml(data, word) {
  if (!data) return "無資料";
  const reading = data.reading || word;
  const accent = data.accent || "";
  const meaning = data.meaning || "查詢失敗";
  const pos = data.partOfSpeech || "";
  const exJa = data.example_ja || "";
  const exCht = data.example_cht || "";
  let detail = "";
  if (data.variations?.[0]?.meanings?.[0]) {
    detail = data.variations[0].meanings[0].meaningInDetail || "";
  }

  return `
      <div style="margin-bottom: 5px;">
        <span style="font-size: 1.2em; font-weight: bold; color: #0366d6;">${reading}</span>
        <span style="font-size: 0.9em; color: #666; margin-left: 5px;">[${accent}]</span>
      </div>
      <div style="margin-bottom: 8px; font-size: 1.1em; font-weight: bold; color: #222;">
        ${meaning}
      </div>
      <div style="margin-bottom: 10px; color: #555; font-size: 0.9em;">
        <span style="background: #eee; padding: 2px 6px; border-radius: 4px;">${pos}</span>
        <br> <span style="display:block; margin-top:4px;">${detail}</span>
      </div>
      <div style="border-top: 1px dashed #eee; padding-top: 8px;">
        <div style="color: #444; margin-bottom: 2px;">${exJa}</div>
        <div style="color: #888; font-size: 0.85em;">${exCht}</div>
      </div>`;
}
