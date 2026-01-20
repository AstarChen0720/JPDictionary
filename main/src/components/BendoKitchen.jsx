//這是便當的廚房區,負責對所有客人的點的便當的菜進行烹飪製作
//(跟gemini溝通)


import {useState} from "react";
//從google/generative-ai團隊請GoogleGenerativeAI這位中央廚房在我們餐廳的"駐點服務人員"來讓我們可以跟中央廚房溝通
import { GoogleGenerativeAI } from "@google/generative-ai";

//拿出我們的會員卡,並讓駐點服務人員根據會員卡的內容來準備好服務我們
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY; //從皮夾內拿會員卡
const genAI = new GoogleGenerativeAI(AI_API_KEY);

//將所有跟烹飪便當的步驟和東西
function BendoKitchen() {
  //拿一本筆記本來紀錄廚房目前是否正在煮飯中
  const [isCooking, setIsCooking] = useState(false);

  //做菜SOP:將傳進來的客人的點單內容,叫gemini煮完再裝好後送回
  const cookingSOP = async (orderInput) => {
    //檢查如果有點餐內容才製作東西  
    if (!orderInput) return null;
      //try可以有catch來告訴我們遇到哪些意料之外的錯誤(error)
      try{
        //先打開"正在煮飯中"的燈
        setIsCooking(true);
        //叫genAI用getGenerativeModel呼叫gemin
        const aiModel = genAI.getGenerativeModel({
          //廚師種類
          model: "gemini-2.5-flash",
          //指令內容
          systemInstruction: `
          你是一位精通日文教學的專業廚師。
          當我給你一個日文單字時，請嚴格遵守以下規則：
          1. 輸出格式必須是純 JSON 物件。
          2. JSON 欄位必須固定為：word, reading, meaning, accent, moraDetails, example_ja, example_cht。
          3. 請使用繁體中文回覆。
          4. 絕對不要包含任何 Markdown 標籤，如 \`\`\`json 或 \`\`\`。
          5. 只要輸出 JSON 本身，不要有任何前言或後記。
          6. moraDetails 欄位要求：請依據重音規則將讀音拆分為音拍陣列，每個物件包含：
            - char: string (該音拍的假名，注意拗音如きゃ算一拍)
            - isHigh: boolean (是否為高音)
            - hasDrop: boolean (比較這音拍和下一音拍的高低音有沒有相同,如果不同就標示true,相同或是最後一個音拍就標示false)
          `,
        });

        //叫那位廚師依據我們的指令幫客人的點單做出對應的菜,並送回來
        const result = await aiModel.generateContent(orderInput); //await是代表要等到廚師做好菜才繼續往下做
        //從廚師送回來的東西中(他會用一個箱子裝,但裡面可能有送貨地址等其他東西),取出我們要的菜的盒子,然後取出裡面的菜
        const response = result.response;
        const responseText = response.text(); //text要加括號,因為裡面的東西是二進制格式,text()就是把text部份的二進制內容翻譯成文字的意思

        //然後因為菜全部都糊在一起,所以要把他們分開方便裝成便當
        const bendoMeals = JSON.parse(responseText);

        //做出對應的便當
        const newBendo = {
          id: Date.now(),
          bendoName: orderInput, // 便當名稱:用客人點的內容當便當名稱
          chtMeaning: bendoMeals.meaning, // 主菜：中文意思
          reading: bendoMeals.reading, // 配菜1：讀音
          accent: bendoMeals.accent, // 配菜2：重音
          example_ja: bendoMeals.example_ja, // 飯：日文例句
          example_cht: bendoMeals.example_cht, // 湯：中文例句
          moraDetails: bendoMeals.moraDetails, // 新配菜：音拍詳細資料
        };

        //因為setState不會馬上更新,所以等他一下(100毫秒)再用console.log印出來看看
        setTimeout(() => console.log("新便當製作完成：", newBendo), 100);

        return newBendo;
        
      } catch (error) {
        console.error("點餐SOP錯誤回報", error); //用紅字印出error內容,error()是用紅字的意思(error)才是錯誤內容
      } finally {
        setIsCooking(false); //關掉"正在煮飯中"的燈
    }
  }
  //回傳其他人才能用
  return { isCooking, cookingSOP };
}

export default BendoKitchen;
