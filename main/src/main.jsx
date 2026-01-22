import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 包在最外面，賦予導航能力 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

//這是工頭指派工作的地方,所有工人都要集合到這裡聽取工作
//react是一種工人指派公司,不是某個工頭,而是一群可以叫到具有特定技能的工人的地方
//先去叫熟悉react的監工來監督任務的指派工作
//然後叫一個翻譯,因為react工頭他發工作時基準點跟真實的基準點不同,但工人只認原來的基準點,所以要一個翻譯來幫忙轉換基準點(你可以想像工頭他是用英制來指派工作,但工人只認得公制,所以需要翻譯來轉換單位)
//再去拿工地守則
//然後去拿施工圖
//最後先將翻譯對準真實基準點,然後開始指派工作,工作內容是App的設計圖,然後讓監工來監督指派這工作的過程

//import { StrictMode } from 'react',先去叫熟悉react的監工來監督任務的指派工作
//import { createRoot } from 'react-dom/client',然後叫一個翻譯,因為react他發工作時基準點跟真實的基準點不同,但工人只認原來的基準點,所以要一個翻譯來幫忙轉換基準點
//import './index.css',再去拿工地守則
//import App from './App.jsx',然後去拿施工圖
//createRoot(document.getElementById('root'))最後先將翻譯對準真實基準點
// .render(,然後將工作指派下去
//  <StrictMode>
//     <App />
//   </StrictMode>,,工作內容是App的設計圖,然後讓監工來監督指派這工作的過程