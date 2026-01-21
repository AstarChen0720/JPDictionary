// useState就是一本筆記本用來紀錄東西,而useRef就是用來定位的,他就是一個標記,用來標記你想要標的東西位置或狀態,他會將他標的東西的所有資訊都存在他的裡面叫current的盒子,盒子內的東西改變不會影響渲染,useEffect就是一份合約,他會讓員工在你訂好的時間下去做某件工作
import { useState, useRef, useEffect } from "react";
import "./App.css";

//引入已經準備好服務我們的supabase倉儲駐點服務人員
import supabase from "./supabaseClient.js";

//引入登入牆組件,讓我可以像是寫在同一個檔案一樣使用
import LoginWall from "./components/LoginWall.jsx";

//引入便當卡顯示組件
import BendoCard from "./components/BendoCard.jsx";

//引入倉庫管理組件
import BendoWarehouse from "./components/BendoWarehouse.jsx";

//引入便當廚房組件
import BendoKitchen from "./components/BendoKitchen.jsx";

//引入便當音訊組件
import BendoAudio from "./components/BendoAudio.jsx";

//引入便當書籤組件
import BendoIndex from "./components/BendoIndex.jsx";
//引入歷史便當儲藏室組件

import HistoryRoom from "./HistoryRoom.jsx";

//引入便當塊組件
import BendoBlock from "./components/BendoBlock.jsx";

function App() {
  //先拿一本筆記本用來紀錄客人當下點了什麼(他說了什麼)--客人點單筆記本
  const [orderInput, setOrderInput] = useState("");

  //拿一個標記來標記輸入框的位置
  const counterRef = useRef(null);

  //拿一個筆記本來紀錄登入狀態
  const [isLogin, setIsLogin] = useState(true); //預設為true讓他一開始就是訪客模式,直到你點登入或註冊按鈕才會顯示登入牆

  //拿一個筆記本來紀錄現在顯示的頁面
  const [currentPage, setCurrentPage] = useState("shop"); //預設顯示店內頁面

  //拿一個筆記本來紀錄現在要不要顯示懸浮櫃檯
  //const [showSticky, setShowSticky] = useState(false);

  //引入倉庫管理組件那裡將所有可以拿的功能和資料都拿出來使用
  //{}是簡寫，代表拿出BendoWarehouse()這函數傳回的對應名稱的東西
  const {
    session, //沒有setSession是因為這個通行證的變化想要就全權交給BendoWarehouse去處理就好,其他地方不要去改他
    orderHistory,
    setOrderHistory,
    addBendo,
    deleteBendo,
    updateBendo,
  } = BendoWarehouse();

  //拿出便當廚房組件的所有資料和功能來使用
  const { isCooking, cookingSOP } = BendoKitchen();

  //點餐SOP(新):當客人按下"送出訂單"按鈕後,
  // 依照當前點單筆記本的內容,跟廚房區說我要什麼便當
  // 等廚房區把便當做好送回來後,
  // 將便當抄到歷史訂單筆記本,再把點單筆記本的這頁撕掉丟垃圾桶
  // 最後執行向倉庫增加東西的SOP將便當存到倉庫
  const takeOrder = async () => {
    //async如果有等的步驟,就先去做別的事
    //檢查如果點單不是空的再去做便當
    if (orderInput !== "") {
      //叫廚房區做菜SOP並等他做好菜送回來
      const newBendo = await cookingSOP(orderInput);
      //如果有成功做出便當的話
      if (newBendo) {
        //把便當,抄到歷史訂單筆記本上(寫在最前面)
        //加上prev是保證他是修改最新的訂單筆記本內容,不會改到舊的
        setOrderHistory((prev) => [newBendo, ...prev]);
        //把點單筆記本的這頁撕掉,這樣下個客人的點餐才不會混在一起
        setOrderInput("");
        //執行向倉庫增加東西的SOP
        addBendo(newBendo);

        //將視角跳到剛剛新增的便當那裡
        //因為setState不會馬上更新,所以等他一下(100毫秒)再施展魔法
        setTimeout(() => {
          //翻到指定便當頁數的魔法
          scrollToBendo(newBendo.id);
        }, 100);
      }
    }
  };

  //念讀音SOP:當客人問如何念時,將想念的字傳給howToSpeech去處理
  //拿出便當音訊組件的所有資料和功能來使用(拿出howToSpeech這個念讀音的功能)
  const { howToSpeech } = BendoAudio();

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

  //登出的魔法:讓supabase幫我登出
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    //如果有錯誤就印出來
    if (error) console.error("登出錯誤", error);
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

  //如果現在頁面是history就顯示歷史儲藏室
  if (currentPage === "history") {
    return (
      <HistoryRoom
        orderHistory={orderHistory}
        onBack={() => setCurrentPage("shop")}
        deleteBendo={deleteBendo}
        howToSpeech={howToSpeech}
      />
    );
  }

  // //監視櫃檯位置的任務
  // //聘請一位監視者,監視櫃檯完全離開或一進入次線範圍就回報
  // useEffect(() => {
  //   //聘請監視者,這位監視者只會在他監視的東西進入或離開是線時觸發(執行他的第一個值內的函式)
  //   //IntersectionObserver(如果事情發生了要做的工作, 監視的條件(像是要離開多少才算離開視線範圍...))
  //   const counterObserver = new IntersectionObserver(
  //     //解構賦值,接收IntersectionObserver自動用陣列傳入第一個參數的目標狀態陣列(只有一個目標所以陣列內只有一個東西)
  //     //[name]取出陣列第一個東西並命名為name
  //     ([entry]) => {
  //       //如果櫃檯不在視線範圍內的話就顯示懸浮櫃檯(setShowSticky(true))
  //       //entry.isIntersecting,如果被監視的東西有在視線範圍內的話是true,不在是false
  //       setShowSticky(!entry.isIntersecting);
  //     },
  //     //被監視剛進入或完全離開視線範圍才觸發
  //     { threshold: 0 },
  //   );
  //   //如果輸入框有被標記(有正常顯示)
  //   if (counterRef.current) {
  //     //監視被標記的輸入框這個東西(櫃檯),用Ref.currnt來看盒子狀態
  //     counterObserver.observe(counterRef.current);
  //   }
  //   //留紙條跟工頭說關店時記得要叫他收工,return必須是一個函式
  //   return () => counterObserver.disconnect();
  // }, []);

  //剛剛那是內部跟員工講的規定,現在是涉及到外部硬體設施的部分
  //如果沒有通行證(沒登入)就顯示登入牆,有通行證(有登入)就顯示便當店內部
  if (!isLogin && !session) {
    return <LoginWall setIsLogin={setIsLogin} />;
  }

  return (
    <div
      className="BendoShop"
      style={{ display: "flex", gap: "20px", padding: "20px" }}
    >
      {/* 懸浮櫃檯區 因為會擋到單字先關掉*/}
      {/* 本來想寫if但是jsx中的js不能寫if,故改用&&,因為程式是由左向右執行的所以showSticky為true時才會顯示這個懸浮櫃檯 */}
      {/* {showSticky && (
        <div
          className="StickyBar"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderBottom: "2px solid #ccc",
            padding: "10px 20px",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <input
            type="text"
            placeholder="在懸浮櫃檯點餐..."
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isCooking) takeOrder();
            }}
          />
          <button onClick={takeOrder} disabled={isCooking}>
            {isCooking ? "煮飯中..." : "下單"}
          </button>
        </div>
      )} */}
      {/* --- 會員資訊索和引標籤區 (書籤) --- */}
      <BendoIndex
        orderHistory={orderHistory}
        scrollToBendo={scrollToBendo}
        session={session}
        handleLogout={handleLogout}
        setIsLogin={setIsLogin}
        deleteBendo={deleteBendo}
        setOrderHistory={setOrderHistory}
        goToHistoryRoom={() => setCurrentPage("history")} //前往歷史儲藏室的按鈕
      />
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
              if (e.key === "Enter" && !isCooking)
                //如果按下的是Enter鍵且不是正在煮飯中的話
                takeOrder(); //就執行點餐流程
            }}
          />
          {/* 再在櫃檯增加一個點餐按鈕,如果正在煮飯就顯示餐點製作中且不能按下,正常情況下按下就送出客人的點單 */}
          <button onClick={takeOrder} disabled={isCooking}>
            {isCooking ? "餐點製作中..." : "下單"}
          </button>
        </div>
        {/* 櫃檯--便當顯示區,為何不把.map也搬進去?因為orderHistory很長,且其他人可能也會用到,所以不搬過去才可以都跟同一人拿存取權,比較不亂,其他功能同理 */}
        <div className="bendo-display">
          {orderHistory.map((bendo) => {
            return (
              <BendoCard
                bendo={bendo}
                howToSpeech={howToSpeech}
                deleteSupabaseItem={deleteBendo}
                updateSupabaseItem={updateBendo}
              />
            );
          })}
        </div>

        {/* 傳送到最上的魔法按鈕 */}
        <button
          //top 0 代表滾到最上面(X軸0點)
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px",
          }}
        >
          回到最上
        </button>
      </div>
    </div>
  );
}
export default App;
