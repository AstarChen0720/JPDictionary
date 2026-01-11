// useState就是一本筆記本用來紀錄東西,而useRef就是用來定位的,他就是一個標記,用來標記你想要標的東西位置或狀態,他會將他標的東西的所有資訊都存在他的裡面叫current的盒子,useEffect就是一份合約,他會讓員工在你訂好的時間下去做某件工作
import { useState, useRef, useEffect } from "react";
import "./App.css";
//從google/generative-ai團隊請GoogleGenerativeAI這位中央廚房在我們餐廳的"駐點服務人員"來讓我們可以跟中央廚房溝通

import { GoogleGenerativeAI } from "@google/generative-ai";
//拿出我們的會員卡,並且讓駐點服務人員根據會員卡上寫的身份(例如普通會員,黃金會員),來訂好能給我們提供的服務內容
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY; //從皮夾內拿會員卡
const genAI = new GoogleGenerativeAI(AI_API_KEY);

//從supabase/supabase-js團隊請createClient這位倉儲駐點人員來幫我們跟倉儲公司溝通
import { createClient } from "@supabase/supabase-js";
//倉庫地址
const supabaseUrl = "https://olyziedvrshemjhpdipz.supabase.co";
//從皮夾內拿supabase倉庫的通行證
const SUPABASE_API_KEY = import.meta.env.VITE_SUPABASE_API_KEY;
//讓倉儲駐點人員根據倉庫地址和通行證準備好服務我們(ex跟他講要我的倉庫地址才知道要去哪個倉庫)
const supabase = createClient(supabaseUrl, SUPABASE_API_KEY);

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
  //拿一筆記本來紀錄supabase通行證
  const [session, setSession] = useState();

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
          2. JSON 欄位必須固定為：word, reading, meaning, accent, example_ja, example_cht。
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
          example_cht: bendoMeals.example_cht, // 湯：中文例句
        };

        //把當前的出餐,抄到歷史訂單筆記本上(寫在最前面),加上prev是保證他是修改最新的訂單筆記本內容,不會改到舊的
        setOrderHistory((prev) => [newBendo, ...prev]);
        //把點單筆記本的這頁撕掉,這樣下個客人的點餐才不會混在一起
        setOrderInput("");
        const bendoInSupabase = await addToSupabase(newBendo); //執行向倉庫增加東西的SOP並寄回正在倉庫內放的東西(包含倉庫貨品id)
        //如果有成功放到倉庫的話(有寄回在貨架上的東西)
        if (bendoInSupabase) {
          //將倉庫貨品id取代筆記本上對應的便當id
          setOrderHistory((prev) => {
            //map會遍歷每一資料後,蒐集回傳的資料組成一個新的陣列回傳出去
            return prev.map((oldBendo) => {
              //如果當前掃到的便當是剛剛做出來的那個
              if (oldBendo.id === newBendo.id) {
                console.log(`便當成功存入倉庫！新ID是: ${bendoInSupabase.id}`);
                //將倉庫貨品id取代掉現在便當上的臨時id(把newBendo的id改成supabese上的id),並回傳
                //將bendo物件展開後舊id改成新id
                return { ...oldBendo, id: bendoInSupabase.id };
                //如不是就回傳原本的便當物件
              } else {
                return oldBendo;
              }
            });
          });
        } else {
          console.error("便當未能成功存入倉庫");
        }
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
          [howToSpeechText]: speechCD.audioContent, //用客人想問的字當作key來放CD
        });
      }
    } catch (error) {
      console.error("念讀音SOP錯誤回報", error);
    }
  };

  //向倉庫增加東西的SOP:addToSupabase(想上傳到倉庫的東西),將你給他的東西上傳到倉庫
  //告訴倉儲駐點人員我要增加什麼東西到倉庫裡面,看他回報有沒有成功,成功回傳倉庫貨品id,失敗印出錯誤內容
  const addToSupabase = async (wantUploadBendo) => {
    //檢查有沒有supabase通行證(有登入的話才可以存檔)
    if (!session) {
      console.error("未登入，無法存檔");
      return null;
    }

    try {
      //supabase.from('bendo_table').insert.select()是一個鏈式指令,袋表一連串連續的指令,前面會影響到後面,有限定只有哪些能用(像是你不能前面說去沙漠,後面說釣魚)
      //下面代表跟倉儲駐點人員說我要在什麼貨架新增什麼東西,然後記得寄出後不只跟我說有沒有成功,還要複製一份他收到的東西的備份(怕運送時摔壞),和確認單(上有倉庫貨品id跟有錯誤原因(如果有錯誤))包在一起給我
      const result = await supabase
        //supabase.from("bendoOrderHistory")代表去倉庫的bendoOrderHistory貨架
        .from("bendoOrderHistory")
        //要放入的東西
        .insert([
          {
            bendoName: wantUploadBendo.bendoName,
            chtMeaning: wantUploadBendo.chtMeaning,
            reading: wantUploadBendo.reading,
            accent: wantUploadBendo.accent,
            example_ja: wantUploadBendo.example_ja,
            example_cht: wantUploadBendo.example_cht,
            user_id: session.user.id, //記錄是誰放的
          },
        ])
        //備註,記得存好後,還要複製一份倉庫架上的東西(有標示倉庫貨品id)的備份給我,
        //預設是成功只會傳data只會有null給我沒有倉庫貨品id,只有失敗才會傳錯誤原因給我,所以才要加上select(),(失敗跟預設一樣data會是null,error會有東西)
        .select();
      //如果駐點人員帶回的東西有錯誤原因就丟出錯誤原因讓catch去接
      if (result.error) {
        throw result.error;
      }
      console.log("倉庫回報：存貨成功！", result.data);
      return result.data[0]; //回傳架上的東西(是一個物件但他在陣列的箱子內所以用data[0](只有一個東西)把他取出)
    } catch (error) {
      //接到錯誤後大喊"錯誤!!"並印出錯誤內容
      console.error("向倉庫增加東西SOP錯誤回報", error);
      return null; //預設回傳undefined,這樣不好判斷有沒有出錯,改回傳null
    }
  };

  //向倉庫查取東西的SOP:fetchFromSupabase(),取回倉庫裡面某貨架上的所有東西(目前只有一個貨架)
  //告訴倉儲駐點人員幫我將倉庫某貨架上所有東西排好寄回來給我
  const fetchFromSupabase = async () => {
    try {
      const rusult = await //去倉庫的bendoOrderHistory貨架
      supabase
        .from("bendoOrderHistory")
        //選擇所有東西("*"),並複製後將每一資料(object)存在data陣列寄回給我們,他每次一定會寄兩盒子,data和error,如果有錯誤data:null,error:有東西,沒錯誤data:有東西,error:null
        .select("*")
        //用created_at來降序(由大到小,預設ascending由小到大)排序,.order(排序依據,排序規則)
        .order("created_at", { ascending: false });

      if (rusult.error) {
        throw rusult.error;
      }

      console.log(`倉庫回報:取貨成功!!, 共搬回了${rusult.data.length}筆貨物`);
      //回傳寄來的貨物陣列(帶有倉庫貨品id)
      return rusult.data;
    } catch (error) {
      console.error("向倉庫查取東西SOP錯誤回報", error);
      return null;
    }
  };

  //將倉庫某東西刪除的SOP:deleteSupabaseItem(想刪除的東西的id),將你給的id的對應的東西從倉庫刪除
  //讓倉儲駐點人員幫我將倉庫某貨架上指定id的東西刪除,成功就同步刪除本地筆記本上的資料,失敗就印出error
  const deleteSupabaseItem = async (targetID) => {
    try {
      const result = await //整句話意思是刪除id欄位等於targetID的那樣東西
      supabase
        .from("bendoOrderHistory")
        //刪除東西:但是你要指定是哪些東西不然保險起見他不會有動作
        .delete()
        //用id欄位來找要刪除的東西,.eq意思是等於,.eq(要比的欄位,要比的值),
        .eq("id", targetID);
      if (result.error) {
        throw result.error;
      }
      //將筆記本上的對應的東西也刪掉
      setOrderHistory((prev) => {
        // filter:濾掉不需要的東西並留下需要的東西,一一取出每個東西當作參數,去跟函數裡的return條件進行比較,他會把所有true的組成一個新陣列回傳,舊陣列.filter((每個東西) => {return 判斷條件}
        // 保留id不等於targetID的東西(刪掉id等於targetID的東西)
        return prev.filter((oldBendo) => oldBendo.id !== targetID);
      });

      console.log(`倉庫回報:刪除成功!!,已刪除id是${targetID}的貨物`);
      //因為他成功data:null,error:null,失敗data:null,error:有東西,所以改回傳true代表成功,順便跟失敗時回傳null分開,方便判斷
      return true;
    } catch (error) {
      console.error("向倉庫刪除東西SOP錯誤回報", error);
      return null;
    }
  };

  //將倉庫某東西修改的SOP:updateSupabaseItem(想修改的東西的id,{欄位名稱:修改後的值,...}(可以一次改多個))
  const updateSupabaseItem = async (targetID, wantUpdateBendo) => {
    try {
      const result = await supabase
        .from("bendoOrderHistory")
        //將他括號內的東西(你要傳入{欄位名稱:新的值})對應著欄位,覆蓋掉現在的東西,你要搭配.eq()來指定要修改哪個東西,不然就會保險起見不執行
        .update(wantUpdateBendo)
        //指定要修改倉庫貨品id=targetID的東西,
        .eq("id", targetID)
        //update()他預設成功data:null,error:null,失敗data:null,error:有東西
        //加上select()來讓他成功時回傳貨架上的東西(已修改)給我們,方便檢查
        .select();

      if (result.error) {
        throw result.error;
      }
      console.log(`倉庫回報:修改成功!!!,已修改id是${targetID}的貨物`);
      return result.data[0];
    } catch (error) {
      console.error("向倉庫修改東西SOP錯誤回報", error);
      return null;
    }
  };

  //傳送到櫃檯的魔法:客人喊出指令後(按按鈕或喊指令),就會瞬間被傳送到櫃檯前面(輸入框被focus)
  const teleportToCounter = () => {
    //將客人傳送到標記的位置(櫃檯前面),且將位置效果是將課人"拉"到櫃檯(不要瞬間傳送會暈XD)
    counterRef.current?.focus(); //現在標記的盒子裡(?代表如果有東西的話)就把他focus起來
    counterRef.current?.scrollIntoView({ behavior: "smooth" }); //現在標記的盒子裡如果有東西的話,就把視角用平滑的方式滾動到那裡
  };

  //翻到指定便當頁數的魔法:點下歷史便當的書籤後,就會自動翻到指定便當的那一頁
  const scrollToBendo = (bendoId) => {
    const bendoelement = document.getElementById(`display-bendo-${bendoId}`); //找對應的便當的id
    if (bendoelement) {
      bendoelement.scrollIntoView({ behavior: "smooth", block: "start" }); //如果有id的話,就將視角用平滑的方式移到那個歷史便當的那一頁,且將那一頁移到視角的最上方
    }
  };

  //登入的魔法:將要登入的人的email和password傳給supabase讓他幫我登入
  const handleLogin = async (email,password) => {
    //{error}是簡寫法,意思是等號右邊的回傳值中的error取出來把他叫做error變數
    const {error} = await supabase.auth.signInWithPassword({email,password});
    //如果失敗就傳出通知
    if(error) 
      alert("登入失敗: " + error.message);
  };

  //註冊的魔法:將要註冊的人的email和password傳給supabase讓他幫我註冊
  const handleSignUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) 
      alert("註冊失敗: " + error.message);
    else 
      alert("註冊成功！請去信箱收信驗證 (如果沒開驗證則直接登入)");
  };

  //登出的魔法:讓supabase幫我登出
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    //如果有錯誤就印出來
    if (error) 
      console.error("登出錯誤", error);
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

  
  useEffect(() => {

  //任務A開店任務:在開店時去看瀏覽器(localstorage)本地有沒有通行證有就抄到筆記本上,要寫成async函數是因為要等supabase回傳結果
    //去看看本地有沒有通行證
    const openShopTodo = async () => {
      const result = await supabase.auth.getSession();
      //取出通行證
      const currentSession = result.data.session;
      //更新到筆記本上
      setSession(currentSession);
    };
    openShopTodo();
  //任務B監視通行證任務:當通行證狀態有變化就更新最新的通行證到筆記本上
    //請一個人當保全去監聽通行證狀態有沒有變化,如果有會回傳什麼變化(event)和最新的通行證(session),然後更新到筆記本上
    //寫成_event是因為我們沒有用到這個參數只是佔位用,(沒用到的參數名前面加上"_"是react的慣例,這樣他就不會跳警告說你有參數沒用到)
    //請保全時他會回傳一個收工單,這步就是要取出收工單,{data:{subscription}}將他回傳的包裹打開取出data裡的subscription(收工單)
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    //叫工頭記得在便當店拆掉時要叫他收工
    return () => subscription.unsubscribe();
  }, []); //空陣列代表他只會在開店時執行一次

  
  useEffect(() => {
  //任務C同步資料任務:如果通行證內容有變化,就去倉庫取回最新的貨物並更新到筆記本上,或清空筆記本(沒有通行證時,就是登出狀態)
    if(session){
      console.log("偵測到會員已登入，開始同步資料...");
      //取回倉庫資料後更新到筆記本上
      fetchFromSupabase().then((data) => {
        //如果有東西就更新到筆記本上
        if (data) {
          setOrderHistory(data);
        } else {
          console.log("同步資料任務回報:獲取會員資料失敗");
        }
      });
    }else{
      // 如果沒通行證(沒登入或登出)就清空筆記本
      setOrderHistory([]);
    }
  }, [session]);//每當session有變化時就重新執行一次,就等同是監視session有沒有變化,有變化就執行一次


  //剛剛那是內部跟員工講的規定,現在是涉及到外部硬體設施的部分
  //如果沒有通行證(沒登入)就顯示登入牆,有通行證(有登入)就顯示便當店內部
  if (!session) {
    return (
      <div
        className="Login-Wall"
        style={{ padding: "50px", textAlign: "center" }}
      >
        <h1>歡迎來到單字便當店 LV5</h1>
        <p>請先出示會員證（登入）以開始點餐</p>

        <div
          style={{
            maxWidth: "300px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* 這裡簡單做，實際可以用 form */}
          <input id="email" type="email" placeholder="Email" />
          <input id="password" type="password" placeholder="Password" />

          <button
            onClick={() => {
              const email = document.getElementById("email").value;
              const password = document.getElementById("password").value;
              handleLogin(email, password);
            }}
          >
            登入
          </button>

          <button
            onClick={() => {
              const email = document.getElementById("email").value;
              const password = document.getElementById("password").value;
              handleSignUp(email, password);
            }}
          >
            註冊新會員
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="BendoShop"
        style={{ display: "flex", gap: "20px", padding: "20px" }}
      >
        {/* 在角落加一個登出按鈕 */}
        <div
          style={{ position: "fixed", top: "10px", left: "10px", zIndex: 1000 }}
        >
          <span>你好, {session.user.email} </span>
          <button onClick={handleLogout}>登出</button>
        </div>

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
                //單字卡本身
                <div
                  key={bendo.id}
                  id={`display-bendo-${bendo.id}`} //給每個便當一個獨特的id,加上display-bendo-前綴方便辨識
                  className="bendo-card"
                  style={{
                    flex: 1,
                    height: "100vh",
                    position: "relative",
                    border: "2px dashed #ccc",
                    padding: "20px",
                  }}
                >
                  <button
                    onClick={() => deleteSupabaseItem(bendo.id)} // 呼叫我們寫好的刪除處理函式
                    style={{
                      position: "absolute", // 【關鍵】絕對定位
                      top: "10px", // 距離上方 10 像素
                      right: "10px", // 距離右方 10 像素
                      background: "#ff4d4f", // 警示紅色
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      padding: "5px 10px",
                      fontSize: "14px",
                    }}
                  >
                    🗑️ 刪除
                  </button>
                  <h3>
                    單字便當：
                    <span
                      //讓這html元素可以被編輯
                      contentEditable={true}
                      //消除React對contentEditable的警告(他怕出錯會有一堆警告)
                      suppressContentEditableWarning={true}
                      //當失去焦點時,就將修改後的內容更新到倉庫,onBlur會傳入他自身報告到他裡面的函數的參數
                      onBlur={(e) => {
                        // 此時 e.target.innerText 就只會拿到你打的單字，不會有「單字便當：」
                        updateSupabaseItem(bendo.id, {
                          bendoName: e.target.innerText,
                        });
                      }}
                    >
                      {bendo.bendoName}
                    </span>
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
                    <li>中文例句：{bendo.example_cht}</li>
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
