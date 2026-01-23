//負責便當(單字卡)所有音訊的元件,包含唸出單字的功能

import { useState } from "react";

//引入準備好的Supabase客戶端
import  supabase  from "../supabaseClient";
//拿出會員卡



function BendoAudio() {
  //先拿一盒子放播音公司寄來的CD

  const [speechAudioBox, setSpeechAudioBox] = useState({});
  //念讀音SOP:當客人問如何念時
  //先檢查現在的CD盒內有沒有對應的CD,有就直接拿來播
  //沒有的話就將客人想問的字寄到播音公司,然後將播音公司寄回的CD放到播放器中播給客人聽,再將CD放到CD盒內以備下次使用
  //howToSpeechText是客人想問的字(看下面button的onClick,他們按下後會呼叫howToSpeech()並將參數帶入他們想問的字)

  const howToSpeech = async (howToSpeechText) => {
    //先檢查CD盒內有沒有對應的CD,有得話直接拿來播
    if (speechAudioBox[howToSpeechText]) {
      //讓店員大喊正在做什麼來掌握現在執行進度(測試用)
      console.log("正在播放現成的CD");
      //設定好播放器的模式(可能是CD模式,可能是錄音帶模式...)
      const speechAudioSrc = `data:audio/mp3;base64,${speechAudioBox[howToSpeechText]}`; //${...}代表要放入的CD
      //將CD放入播放器
      const speechAudio = new Audio(speechAudioSrc);
      //按開始播放
      speechAudio.play();
      return; //結束這個念讀音SOP,不要再去跟播音公司買CD
    }
    //沒有現成的CD故要去跟播音公司買
    try {
      console.log("沒有現成CD，準備寄信給播音公司...");
      //要給播音公司的包裹(委託書)

      // 呼叫 Edge Function
      const { data, error } = await supabase.functions.invoke("safe-speech", {
        body: { howToSpeechText: howToSpeechText },
      });

      if (error) {
        throw new Error(`語音服務回報錯誤: ${error.message}`);
      }


      //拿到播音公司寄來的CD
      const speechCD = data;
      //如果有收到CD有內容的話


      if (speechCD.audioContent) {
        //設定好播放器的模式(可能是CD模式,可能是錄音帶模式...)
        const speechAudioSrc = `data:audio/mp3;base64,${speechCD.audioContent}`;
        //將CD放入播放器
        const speechAudio = new Audio(speechAudioSrc);
        //按開始播放
        speechAudio.play();
        //將CD放到CD盒內
        setSpeechAudioBox({
          ...speechAudioBox, //展開舊物件
          [howToSpeechText]: speechCD.audioContent, //用客人想問的字當作key來放CD
        });
      }
    } catch (error) {
      console.error("念讀音SOP錯誤回報", error);
    }
  };
  //回傳其他人才能用
  return { howToSpeech };
}

export default BendoAudio;