// useState就是一本筆記本用來紀錄東西,而useRef就是用來定位的,他就是一個標記,用來標記你想要標的東西位置或狀態,他會將他標的東西的所有資訊都存在他的裡面叫current的盒子,useEffect就是一份合約,他會讓員工在你訂好的時間下去做某件工作
import { useState, useRef, useEffect } from "react";
import "./App.css";
//從google/generative-ai團隊請GoogleGenerativeAI這位中央廚房在我們餐廳的"駐點服務人員"來讓我們可以跟中央廚房溝通
import {GoogleGenerativeAI} from '@google/generative-ai';

//拿出我們的會員卡,並且讓駐點服務人員根據會員卡上寫的身份(例如普通會員,黃金會員),來訂好能給我們提供的服務內容
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;//從皮夾內拿會員卡
const genAI = new GoogleGenerativeAI(AI_API_KEY);

function App() {
  //先拿一本筆記本用來紀錄客人當下點了什麼(他說了什麼)--客人點單筆記本
  const [orderInput, setOrderInput] = useState("");

  //再拿一本筆記本來紀錄客人的訂單紀錄(不是記客人點餐時講了什麼而是實際的出餐內容訂單)--歷史訂單筆記本
  const [orderHistory, setOrderHistory] = useState([]);

  //拿一個標記來標記輸入框的位置
  const counterRef = useRef(null);

  //拿一個筆記本本來紀錄現在中央廚房是不是正在煮飯中
  const [isLoading, setIsLoading] = useState(false);

  //拿一盒子放播音公司寄來的CD
  const [speechAudioBox, setSpeechAudioBox] = useState({});

  //點餐SOP(新):當客人按下"送出訂單"按鈕後,
  // 依照當前點單筆記本的內容,跟駐點服務人員說要跟廚師說的指令(歷如這菜要怎麼煮)
  // 然後將內容傳給駐點服務人員請他幫我轉交給中央廚房
  // 做完後從駐點服務人員拿到菜盒
  // 打開菜盒並將菜排好
  // 將實際出餐內容(有時客人講不清楚是店員自己修改的)抄到歷史訂單筆記本後,把點單筆記本的這頁撕掉丟垃圾桶
  const takeOrder = async () => {
    //async如果有等的步驟,就先去做別的事
    //檢查如果點單不是空的再去做便當
    if (orderInput !== "") {
      //try可以有catch來告訴我們遇到哪些意料之外的錯誤(error)
      try {
        //先打開"正在煮飯中"的燈
        setIsLoading(true);

        //跟駐點服務人員說要給指定的廚師和給廚師的指令
        //getGenerativeModel是代表我要使用管理廚房的功能
        const aiModel = genAI.getGenerativeModel({
          model: "gemini-2.5-flash", //代表我要的廚師種類
          //指令內容
          systemInstruction: `
          你是一位精通日文教學的專業廚師。
          當我給你一個日文單字時，請嚴格遵守以下規則：
          1. 輸出格式必須是純 JSON 物件。
          2. JSON 欄位必須固定為：word, reading, meaning, accent, example_ja, example_zh。
          3. 請使用繁體中文回覆。
          4. 絕對不要包含任何 Markdown 標籤，如 \`\`\`json 或 \`\`\`。
          5. 只要輸出 JSON 本身，不要有任何前言或後記。
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
          example_zh: bendoMeals.example_zh, // 湯：中文例句
        };

        //把當前的出餐,抄到歷史訂單筆記本上(寫在最前面)
        setOrderHistory([newBendo, ...orderHistory]);
        //把點單筆記本的這頁撕掉,這樣下個客人的點餐才不會混在一起
        setOrderInput("");
      } catch (error) {
        console.error("點餐SOP錯誤回報", error); //用紅字印出error內容,error()是用紅字的意思(error)才是錯誤內容
      } finally {
        //收工例行公式,不管有沒有錯誤發生,最後都要做的工作
        setIsLoading(false); //關掉"正在煮飯中"的燈
      }
    }
  };

  //念讀音SOP:當客人問如何念時,先檢查現在的CD盒內有沒有對應的CD有就直接拿來播,沒有的話就將客人想問的字寄到播音公司,然後將播音公司寄回的CD放到播放器中播給客人聽,再將CD放到CD盒內以備下次使用
  //howToSpeechText是客人想問的字(看下面button的onClick)
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

      //放入會員資訊並寄給播音公司
      const SPEECH_API_KEY = import.meta.env.VITE_SPEECH_API_KEY; //從皮夾拿會員編號
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

      const speechCD = await response.json(); //取出播音公司寄回的包裹內容(CD)並拆開盒子取出,.json()代表抓body的內容並轉成JSON格式
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
          [howToSpeechText]: speechCD.audioContent,//用客人想問的字當作key來放CD
        });
      }
    } catch (error) {
      console.error("念讀音SOP錯誤回報", error);
    }
  };

  //傳送到櫃檯的魔法:客人喊出指令後(按按鈕或喊指令),就會瞬間被傳送到櫃檯前面(輸入框被focus)
  const teleportToCounter = () => {
    //將客人傳送到標記的位置(櫃檯前面),且將位置效果是將課人"拉"到櫃檯(不要瞬間傳送會暈XD)
    counterRef.current?.focus(); //現在標記的盒子裡(?代表如果有東西的話)就把他focus起來
    counterRef.current?.scrollIntoView({ behavior: "smooth" }); //現在標記的盒子裡如果有東西的話,就把視角用平滑的方式滾動到那裡
  };

  //聘請一位傾聽者,去聽整間餐廳客人在講什麼,聽到客人說出特定的話時,就會使用傳送到櫃檯的魔法將客人傳送到櫃檯前面
  useEffect(() => {
    //如果有人說出指令要做的SOP
    const keyboardListener = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        //e.ctrlKey看是否有按著Ctrl鍵,e.key看按下的是哪個鍵,如果是Enter鍵的話
        teleportToCounter(); //就執行傳送到櫃檯的魔法
      }
    };
    //派傾聽者去聽整間餐廳
    window.addEventListener("keydown", keyboardListener); //在整間餐廳(window),聘用一位傾聽者來聽keydown事件,當有按鍵被按下時就執行keyboardListener這個動作
    //在便當店關閉時將傾聽者解雇掉,不然會越來越多人
    return () => {
      window.removeEventListener("keydown", keyboardListener); //在整間餐廳中做"聽keydown事件且執行keyboardListener"這個工作的傾聽者解雇掉(括號內要一模一樣),這裡的return代表這是便當店關閉時要做的工作,而不是要交回什麼東西
    };
  }, []); //空陣列代表這個合約只會這間店每次重新卸載再重建(掛載)時執行一次

  //翻到指定便當頁數的魔法:點下歷史便當的書籤後,就會自動翻到指定便當的那一頁
  const scrollToBendo = (bendoId) => {
    const bendoelement = document.getElementById(`bendo-${bendoId}`); //找對應的便當的id
    if (bendoelement) {
      bendoelement.scrollIntoView({ behavior: "smooth", block: "start" }); //如果有id的話,就將視角用平滑的方式移到那個歷史便當的那一頁,且將那一頁移到視角的最上方
    }
  };

  //剛剛那是內部跟員工講的規定,現在是涉及到外部硬體設施的部分
  return (
    <>
      <div
        className="BendoShop"
        style={{ display: "flex", gap: "20px", padding: "20px" }}
      >
        {/* --- 索引標籤區 (書籤) --- */}
        <div
          className="orderHistory-index"
          style={{
            position: "sticky",
            width: "200px",
            flexShrink: 0, //不讓這個區塊縮小(防止右邊東西太多時被擠扁)
            top: "20vh",
            maxHeight: "60vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <p>歷史便當快速選單</p>
          {orderHistory.map((bendo) => {
            return (
              <button
                key={bendo.id}
                onClick={() => scrollToBendo(bendo.id)}
                style={{ padding: "5px", fontSize: "12px", cursor: "pointer" }}
              >
                {bendo.bendoName}
                {/* 用主菜名當標籤 */}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* 櫃檯區,櫃檯會執行點餐流程和秀出歷史訂單在旁邊讓客人參考 */}
          <div className="Counter" style={{ height: "20vh", padding: "20px" }}>
            <h2>單字便當店櫃檯</h2>
            <input
              type="text"
              placeholder="請點餐"
              ref={counterRef} //將標記加在輸入框這東西上
              value={orderInput} //這輸入框的內容是點單筆記本上的內容
              onChange={(e) => setOrderInput(e.target.value)} //如果輸入框內容有變動就將最新的客人點單內容更新到點單筆記本
              //下面是當客人按下Enter鍵就執行點餐流程
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading)
                  //如果按下的是Enter鍵且不是正在煮飯中的話
                  takeOrder(); //就執行點餐流程
              }}
            />
            {/* 再在櫃檯增加一個點餐按鈕,如果正在煮飯就顯示餐點製作中且不能按下,正常情況下按下就送出客人的點單 */}
            <button onClick={takeOrder} disabled={isLoading}>
              {isLoading ? "餐點製作中..." : "下單"}
            </button>
          </div>

          {/* 櫃檯--歷史訂單顯示區 */}
          <div className="orderHistory-display">
            {/* 將歷史訂單筆記本裡面的清單一筆一筆拿出來抄到上面顯示出來給客人看 */}
            {orderHistory.map((bendo) => {
              //用map遍歷歷史訂單筆記本裡面的每一筆訂單並且傳到bendo這個變數裡面
              return (
                <div
                  key={bendo.id}
                  id={`bendo-${bendo.id}`} //給每個便當一個獨特的id,加上bendo-前綴方便辨識
                  className="bendo-card"
                  style={{
                    flex: 1,
                    height: "100vh",
                    border: "2px dashed #ccc",
                    padding: "20px",
                  }}
                >
                  <h3>
                    單字便當：{bendo.bendoName}
                    <button
                      onClick={() => howToSpeech(bendo.bendoName)}
                      style={{ marginLeft: "10px" }}
                    >
                      🔊
                    </button>
                  </h3>
                  <ul>
                    <li>中文意思：{bendo.chtMeaning}</li>
                    <li>讀音：{bendo.reading}</li>
                    <li>重音：{bendo.accent}</li>
                    <li>
                      日文例句：{bendo.example_ja}
                      <button
                        onClick={() => howToSpeech(bendo.example_ja)}
                        style={{ marginLeft: "10px", fontSize: "12px" }}
                      >
                        🔊
                      </button>
                    </li>
                    <li>中文例句：{bendo.example_zh}</li>
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* 傳送到櫃檯的魔法按鈕 */}
        <button
          onClick={teleportToCounter}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px",
          }}
        >
          傳送到櫃檯
        </button>
      </div>
    </>
  );
}
export default App;
