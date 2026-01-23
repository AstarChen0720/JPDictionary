//這是便當的廚房區,負責對所有客人的點的便當的菜進行烹飪製作
//(跟gemini溝通)

import { useState } from "react";

// 引入我們自己設定好的 Supabase Client
import supabase from "../supabaseClient";


//將所有跟烹飪便當的步驟和東西
function BendoKitchen() {
  //拿一本筆記本來紀錄廚房目前是否正在煮飯中
  const [isCooking, setIsCooking] = useState(false);

  //做菜SOP:將傳進來的客人的點單內容,叫gemini煮完再裝好後送回
  const cookingSOP = async (orderInput) => {
    //檢查如果有點餐內容才製作東西
    if (!orderInput) return null;
    //try可以有catch來告訴我們遇到哪些意料之外的錯誤(error)
    try {
      //先打開"正在煮飯中"的燈
      setIsCooking(true);

      console.log("正在請雲端廚房煮便當菜");

      // 用invoke呼叫 Supabase Edge Function 'safe-cooker',invoke是跟supabse sdk說我要呼叫edge function 
      // invoke("edge function名稱", {選項})
      const { data, error } = await supabase.functions.invoke("safe-cooker", {
        //將orderInput的內容放進orderInput欄位內傳給edge function
        body: { orderInput: orderInput },
        headers: {
        },
      });

      if (error) {
        throw new Error(`雲端廚房回報錯誤: ${error.message}`);
      }

      const bendoMeals = data;
      console.log("從中央廚房取得食材：", bendoMeals);



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
        partOfSpeech: bendoMeals.partOfSpeech, // 新配菜：詞性
        wordMapping: bendoMeals.wordMapping, // 新配菜：單字拆解後對應的假名
        variations: bendoMeals.variations, // 新配菜：所有變化的資料
        isMastered: false, // 新增欄位：是否已精通，預設為 false
      };

      //因為setState不會馬上更新,所以等他一下(100毫秒)再用console.log印出來看看
      setTimeout(() => console.log("新便當製作完成：", newBendo), 100);

      return newBendo;
    } catch (error) {
      console.error("點餐SOP錯誤回報", error); //用紅字印出error內容,error()是用紅字的意思(error)才是錯誤內容
    } finally {
      setIsCooking(false); //關掉"正在煮飯中"的燈
    }
  };
  //回傳其他人才能用
  return { isCooking, cookingSOP };
}

export default BendoKitchen;
