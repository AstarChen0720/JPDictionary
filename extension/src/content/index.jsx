//這裡是擴充內的內容腳本,他可以碰到DOM但是無法使用高級功能

import React from "react";
import { createRoot } from "react-dom/client";
import supabase from "../lib/supabaseClient";
import LoginModal from "./components/LoginModal.jsx";
import ResultOverlay from "./components/ResultOverlay.jsx";

console.log("JPDictionary 服務生已就位");

let shadowHost = null;
let modalRoot = null;

// 用來掛載結果視窗的 (跟 Login 分開比較好管理，或共用也可以)
let resultHost = null;
let resultRoot = null;

//顯示結果視窗的函式
function showResultOverlay(data) {
  // 1. 如果已經有開著的，先關掉
  removeResultOverlay();

  // 2. 建立 shadowHost避免被當前網頁影響到(跟 LoginModal 一樣)
  resultHost = document.createElement("div");
  resultHost.id = "jp-dictionary-result-host";
  resultHost.style.position = "static"; // 設為 static 避免影響內部 fixed
  resultHost.style.zIndex = "2147483647";

  // 3. 掛載 (一樣建議掛在 body 前面)
  if (document.body) {
    document.body.insertAdjacentElement("afterbegin", resultHost);
  } else {
    document.documentElement.appendChild(resultHost);
  }

  // 4. Shadow DOM
  const shadowRoot = resultHost.attachShadow({ mode: "open" });
  resultRoot = createRoot(shadowRoot);

  // 5. 渲染
  resultRoot.render(
    <ResultOverlay bendoData={data} onClose={removeResultOverlay} />,
  );
}

// 移除結果視窗的函式
function removeResultOverlay() {
  if (resultRoot) {
    resultRoot.unmount();
    resultRoot = null;
  }
  if (resultHost) {
    resultHost.remove();
    resultHost = null;
  }
}

//抓取整段上下文的魔法
function getSelectionContext(selectedText) {
  // 抓取使用者目前選取的文字範圍
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;
  // 2. 聰明的抓取上下文 (Context)
  // 我們抓取選取文字所在的那個節點的 "整段文字"
  //找出選取文字起點處的節點
  const anchorNode = selection.anchorNode;

  // 如果是文字節點(TEXT_NODE,nodetype === 3)，就抓它的父元素，不然就抓它自己
  const parentElement =
    anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode;

  // 去除多餘空白
  const fullContext = parentElement.innerText.trim(); // 或是 textContent

  return {
    target: selectedText, // 選中的字 (例如: 食べる)
    context: fullContext, // 整句 (例如: 私はご飯を食べる)
    fullSentence: `我要查詢「${fullContext}」中的「${selectedText}」`, // 組合好的 prompt
  };
}

// 顯示登入視窗
function showLoginModal(onSuccess) {
  // 如果已經有視窗了先清掉，避免重複
  removeModal();

  console.log("正在渲染登入視窗...");

  // 1. 建立宿主元素 (Host)
  shadowHost = document.createElement("div");
  shadowHost.id = "jp-dictionary-host";
  // 避免宿主本身被網頁 CSS 影響，將其重置
  shadowHost.style.position = "absolute";
  shadowHost.style.top = "0";
  shadowHost.style.left = "0";
  shadowHost.style.width = "0";
  shadowHost.style.height = "0";
  shadowHost.style.zIndex = "2147483647"; // 宿主層級也要最高

  // 掛載到 Body (比 documentElement 安全)
  document.body.appendChild(shadowHost);

  // 2. 建立結界 (Shadow Root)
  // mode: 'open' 代表我們還可以透過 JS 選取到它
  //.attachShadow代表掛載一個獨立且css不會受到外面影響的區域
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });

  // 3. 在結界裡建立地基
  modalRoot = createRoot(shadowRoot);

  // 4. 渲染元件 (注意要傳入 style 來讓元件在 shadow dom 裡維持 fixed 定位)
  modalRoot.render(
    <LoginModal onClose={removeModal} onLoginSuccess={onSuccess} />,
  );
}

// 移除登入視窗
function removeModal() {
  //如果有地基且有登入頁面才把它拆掉(怕有時候還沒建立就拆掉會報錯)
  if (modalRoot) {
    //把 React 元件的監視器,邏輯和程式都卸載掉
    modalRoot.unmount();
    //將建築物(整個位置)清空(如果沒清空別人會覺得還有東西,會佔用資源,且會留有之前的殘骸,你不完全清空會無法重新建立新的東西)
    modalRoot = null;
  }
  if (shadowHost) {
    //把元素刪除
    shadowHost.remove();
    //將建築物(整個位置)清空(如果沒清空別人會覺得還有東西,會佔用資源,且會留有之前的殘骸,你不完全清空會無法重新建立新的東西)
    shadowHost = null;
  }
}

// 送去煮飯的函式
async function sendToKitchen(orderData, session) {
  console.log("🚀 正式送單往後台廚房...", orderData);

  try {
    // 使用 chrome.runtime.sendMessage 傳送給 Background
    const response = await chrome.runtime.sendMessage({
      type: "START_COOKING",
      orderData: orderData,
      accessToken: session.access_token, // 帶上通行證，後端才知道是誰
    });

    if (response.success) {
      console.log("✅ 廚房出菜了！", response.data);
      // 顯示結果視窗
      showResultOverlay(response.data);
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error("❌ 烹飪失敗：", error);
    alert("廚房發生錯誤：" + error.message);
  }
}

//接收來自background的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //因為都共用頻道,所以要篩一下
  if (request.type === "search-full-sentence") {
    handleSearch(request.selectionText);
  }
});

//======主函式======
async function handleSearch(selectedText) {
  // ★ 關鍵防禦 1：如果你是在廣告框或 iframe 裡執行，就跳過
  // 檢查目前執行的 window 是否為最頂層視窗
  if (window !== window.top) {
    console.log("偵測到在 sub-iframe 執行，略過 UI 渲染");
    return;
  }

  // 1. 抓取選取物件
  const orderData = getSelectionContext(selectedText);
  if (!orderData) return;

  console.log("----- 已收到點餐需求 -----", orderData);

  // 2. 檢查是否已登入
  const {
    data: { session },
  } = await supabase.auth.getSession();

  //沒有登入就叫出登入視窗
  if (!session) {
    console.log("未登入，呼叫登入視窗...");
    showLoginModal((newSession) => {
      //本質上就是把函式寫好後綁到一個名子(就像是變數)然後傳來傳去,他的好處是可以在別的地方執行,但結果還是會回傳到原本的地方,他只是從其他地方遠端執行而已,不是像變數定義的那樣在呼叫的地方執行
      //登入成功後的回呼函式 (callback)
      //我將這函式當作參數傳給loginModal 然後當作onLoginSuccess(就像用const將函式綁到一個變數一樣)傳入loginModal,然後onLoginSuccess(data.session),他將session當作參數傳入並執行(呼叫)onLoginSuccess函式也就是位於index的showLoginModal函式
      console.log("登入成功！繼續原本的查詢...", newSession);
      removeModal(); // 把登入窗關掉
      sendToKitchen(orderData, newSession); // 繼續未完成的任務
    });
  } else {
    console.log("已登入，直接送往廚房");
    sendToKitchen(orderData, session);
  }
}
