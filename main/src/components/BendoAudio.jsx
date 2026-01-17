//負責便當(單字卡)所有音訊的元件,包含唸出單字的功能

import { useState } from "react";

//拿出會員卡
const SPEECH_API_KEY = import.meta.env.VITE_SPEECH_API_KEY; //從皮夾拿會員卡

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
        }
      );

      //取出播音公司寄回的包裹內容(CD)並拆開盒子取出
      //.json()代表抓body的內容並轉成JSON格式
      const speechCD = await response.json();
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