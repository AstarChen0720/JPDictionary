
//這裡是在後台處理輸入和點擊事件的人員

//當擴充安裝的時候,駐冊右鍵選單
//chrome他會記得註冊的東西,所以我告訴我這右鍵選單的功能,只在安裝的時候註冊一次就好
//所以對onInstalled事件(安裝擴充)監聽(addListener)
chrome.runtime.onInstalled.addListener(() => {
  //請chrome在右鍵選單(contextMenus)建立一個選單
  chrome.contextMenus.create({
    id: "searchJPDict",
    title: '用 JPDictionary 查詢 "%s"', // %s 會顯示你選取的文字
    contexts: ["selection"], // 只有選取文字時才出現
  });
});

// 2. 監聽點擊事件
//監聽chrome的右鍵選單的點擊事件
//當chrome聽到東西時會傳給我們兩個參數info(發生什麼事,ex當前選取的文字,被選到的東西,被按下...) tab(分頁資訊,當前分頁標題,當前分頁id...)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  //因為只要右鍵被點就會觸發這個事件,所以我們要篩選一下,一定要是id="searchJPDict"的時候才處理
  if (info.menuItemId === "searchJPDict") {
    // 當使用者點擊後，我們發送一個訊息給當前頁面的 content.js
    // 指令名是: "analyzeContext" (分析上下文)
    //chrome.tabs.sendMessage是總機(background)打電話給分機(content)時的方法,要記得要說要傳給哪個分頁(tab.id)
    //chrome.tabs.sendMessage(標籤頁id,{要傳的資料物件})
    chrome.tabs.sendMessage(tab.id, {
      //這是標籤,說我要做什麼事,
      action: "analyzeContext",
      //內容,將使用者選到的文字傳過去
      selectionText: info.selectionText,
    });
  }
});
  // [新增] 監聽來自 content.js 的請求 (幫忙跑腿去呼叫 API)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchFromAPI") {
    
    // 這裡我們在後台呼叫，不受網頁 HTTPS 限制
    fetch("http://127.0.0.1:3000/api/callDict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: request.word,
        sentence: request.sentence,
      }),
    })
      .then(async (response) => {
        // 改成 async
        const text = await response.text(); // 先拿純文字
        try {
          const data = JSON.parse(text); // 嘗試解析 JSON
          if (!response.ok) {
            throw new Error(data.error || text); // 如果狀態碼是錯誤，拋出錯誤
          }
          sendResponse({ success: true, data: data });
        } catch (e) {
          // 如果解析失敗，把原始文字印出來，這樣我們就知道伺服器到底回傳了什麼鬼東西
          console.error("解析失敗，伺服器回傳:", text);
          sendResponse({
            success: false,
            error: "伺服器回傳格式錯誤: " + text.substring(0, 50) + "...",
          });
        }
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    // 告訴 Chrome 我們會用非同步方式 (return promise) 回傳 sendResponse
    return true; 
  }
});


