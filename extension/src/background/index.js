//這是擴充內的中央指揮,他不能碰到DOM但是可以使用高級功能(ex右鍵選單,或偵測網頁變化)
//他負責建立右鍵選單,監聽右鍵選單點擊事件,並派內容腳本查完整單和句子(content script)
//然後將傳回的東西傳給safe-cooker煮便當菜
//拿回菜做成便當,同步上supabase,再傳給content script顯示


import supabase from "../lib/supabaseClient.js";
// 1. 只有在安裝或更新時，建立右鍵選單(因為他會記得所以不用重複建立)
console.log(
  "🔥 Background Service Worker 已啟動! 時間:",
  new Date().toLocaleTimeString(),
);
//chrome.runtime.onInstalled.addListener為chrome.runtime.onInstalled加上監聽器(在擴充功能安裝或更新時觸發)
chrome.runtime.onInstalled.addListener(() => {
  // 建立一個右鍵選單項目
  chrome.contextMenus.create({
    id: "jp-dictionary-search",
    // %s 會自動變成選取的文字
    title: "用 JPDictionary 查詢「%s」",
    // 只有選取文字時才出現
    contexts: ["selection"],
  });
});

// 2. 監聽點擊事件,他會傳入兩個參數info(點擊資訊(按鈕名稱,狀態...))和tab(點擊時的分頁資訊(分頁ID,網址...))
chrome.contextMenus.onClicked.addListener((info, tab) => {
  //因為只要有右鍵選單被點擊就會被觸發,所以要篩一下
  if (info.menuItemId === "jp-dictionary-search") {
    // 發送訊息給當前分頁的 Content Script
    //後端(background)傳給前端(action contentscript等能跟網頁互動或顯示畫面的部分)用chrome.tabs.sendMessage(tabId, {內容})
    // 我們只負責傳遞「要把選取的字查一下」這個指令
    chrome.tabs.sendMessage(tab.id, {
      type: "search-full-sentence",
      selectionText: info.selectionText,
    });
  }
});


// 3. 監聽來自 Content Script 的通訊
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "START_COOKING") {
    console.log("🔔 Background 收到煮飯請求，準備開工...");
    // 非同步處理必須回傳 true，告訴 chrome 我們稍後會回傳結果 (sendResponse)
    handleCookingFlow(request.orderData, request.accessToken).then(sendResponse);
    return true; 
  }
});

// 4. 完整的烹飪與存檔流程
async function handleCookingFlow(orderData, token) {
  try {
    console.log("👨‍🍳 廚房開始作業...", orderData.target);

    // A. 呼叫 Supabase Edge Function (safe-cooker)
    // 這裡參考您 index.ts 要求的 orderInput 格式
    const { data: bendoMeals, error: cookError } =
      await supabase.functions.invoke("safe-cooker", {
        body: { orderInput: orderData.fullSentence },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    if (cookError) throw new Error(`AI 廚房回報錯誤: ${cookError.message}`);
    console.log("🥗 食材準備完成：", bendoMeals);

    // B. 取得目前的 UserID (存檔必備)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError) throw userError;

    // C. 仿照 BendoKitchen.jsx 製作結構化便當
    // 注意：欄位名稱必須與您 Supabase 的 Table 欄位一致
    const newBendo = {
      // 基本資料
      bendoName: bendoMeals.word || orderData.target,
      chtMeaning: bendoMeals.meaning,
      reading: bendoMeals.reading,
      accent: bendoMeals.accent,

      // 句子資料
      example_ja: bendoMeals.example_ja,
      example_cht: bendoMeals.example_cht,

      // 進階 JSON 資料 (直接存入對應的 JSONB 欄位)
      moraDetails: bendoMeals.moraDetails,
      partOfSpeech: bendoMeals.partOfSpeech,
      wordMapping: bendoMeals.wordMapping,
      variations: bendoMeals.variations,

      // 狀態與歸屬
      user_id: user.id,
      isMastered: false,
      created_at: new Date().toISOString(),
    };

    console.log("準備存入資料庫...");
    // D. 存入 Supabase
    const { data: savedData, error: dbError } = await supabase
      .from("bendoOrderHistory")
      .insert([newBendo])
      .select()
      .single();

    if (dbError) throw new Error(`資料庫同步失敗: ${dbError.message}`);

    console.log("🍱 便當已送入儲藏室，ID:", savedData.id);

    // 回傳給 Content Script 的結果
    return {
      success: true,
      data: bendoMeals, // 傳回 AI 原始結果供顯示 UI
    };
    // E. 錯誤處理
  } catch (err) {
    console.error("❌ 廚房事故報告：", err);
    return {
      success: false,
      error: err.message,
    };
  }
}