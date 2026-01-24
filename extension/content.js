
//這裡是負責跟前台互動的人員,
//負責接收前台資料傳到後台或將後台資料顯示到前台

// 監聽來自 background.js 的訊息,他會帶有三個參數:
// request: 傳來的請求物件
// sender: 發送訊息的來源
// sendResponse: 回應函式,可以用來通知background我收到訊息了
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //如果指令名是 analyzeContext (分析上下文),就處理搜尋
  if (request.action === "analyzeContext") {
    handleSearch(request.selectionText);
  }

  // 表示我們有需要等一下才會回應的東西,沒有加這行的話,sendResponse會在這個函式結束時被chrome直接關掉
  return true;
});

async function handleSearch(selectedText) {
  // 1. 抓取上下文 (Context)
  // window.getSelection() 可以拿到使用者當前的選取範圍
  const selection = window.getSelection();
  //設定一個函式來裝抓到的上下文,預設是選到的單字本身
  let contextText = selectedText;

  //如果有選取範圍的話(當然有不然你右鍵不會有選單)
  if (selection.rangeCount > 0) {
    // 取得選取範圍的起點所在的節點
    const node = selection.anchorNode;
    // 如果是文字節點(最末端的節點)，
    // 就抓它的父元素 (比如 <p>...</p>,元素節點) 的內容這樣通常能抓到整句話或整段話
    // 如果節點是文字節點(nodeType === 3)，就抓他的父節點(parentNode)，不是文字節點就直接用它
    const container = node.nodeType === 3 ? node.parentNode : node;
    //將這個元素(節點)內的文字內容存到 contextText 裡
    //innerText(抓我們看到的字) 或 textContent(抓寫在程式碼上面的字,做保險)
    contextText = container.innerText || container.textContent;
  }

  // 如果抓不到上下文，就用單字本身代替
  if (!contextText) contextText = selectedText;

  // 2. 顯示 UI (先顯示載入中)
  showPopup(selectedText, "分析中...", true);

  // 3. [修改] 改成發送訊息給 Background，請它幫忙呼叫 API
  chrome.runtime.sendMessage(
    {
      action: "fetchFromAPI",
      word: selectedText,
      sentence: contextText
    },

    (response) => {
      // 這是 callback，當 background 回傳結果時會跑這裡
      if (chrome.runtime.lastError) {
        showPopup("錯誤", "無法連接擴充功能後台: " + chrome.runtime.lastError.message, false);
        return;
      }

      if (response && response.success) {
        // 成功！顯示結果
        // 注意：這裡 response.data 已經是 API 回傳的完整 JSON 物件
        showPopup(selectedText, response.data.result, false);
      } else {
        // 失敗
        const errorMsg = response ? response.error : "未知錯誤";
        showPopup("錯誤", "連線失敗: " + errorMsg + "\n請確認 localhost:3000 是否開啟。", false);
      }
    }
  );
}

function showPopup(title, content, isLoading) {
  // 找到已存在的彈出視窗並移除它
  let existingPopup = document.getElementById("jp-dict-extension-root");
  if (existingPopup) {
    //把他從html上移除
    existingPopup.remove();
  }

  // 顯示東西的地基,建立一個div元素,並把他的id設為jp-dict-extension-root
  const popup = document.createElement('div');
  popup.id = 'jp-dict-extension-root';

  // 標題列
  const header = document.createElement('div');
  header.id = 'jp-dict-header';
  //在header裡面放兩個span,一個是標題,一個是關閉按鈕(&times;是"×")
  header.innerHTML = `
    <span>JPDictionary</span>
    <span id="jp-dict-close-btn">&times;</span>
  `;

  // 內容區
  const body = document.createElement('div');
  body.id = 'jp-dict-content'

  //如果搜尋中就顯示載入中,否則顯示內容
  if (isLoading) {
    body.innerHTML = `<div class="jp-dict-loading">正在詢問 AI...<br>查詢：${title}</div>`;
  } else {
    body.innerHTML = `
      <div class="jp-dict-word">${title}</div>
      <div>${content}</div>
    `;
  }

  //先將header和body加入popup,再將popup加入body
  popup.appendChild(header);
  popup.appendChild(body);
  document.body.appendChild(popup);


  // 為關閉按鈕事件加上監聽器,如果點擊就移除整個popup
  document.getElementById('jp-dict-close-btn').addEventListener('click', () => {
    popup.remove();
  });
}
