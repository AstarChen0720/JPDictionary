// useState就是一本筆記本用來紀錄東西,而useRef就是用來定位的,他就是一個標記,用來標記你想要標的東西位置或狀態,他會將他標的東西的所有資訊都存在他的裡面叫current的盒子,useEffect就是一份合約,他會讓員工在你訂好的時間下去做某件工作
import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  //先拿一本筆記本用來紀錄客人當下點了什麼(他說了什麼)--客人點單筆記本
  const [orderInput, setOrderInput] = useState("");

  //再拿一本筆記本來紀錄客人的訂單紀錄(不是記客人點餐時講了什麼而是實際的出餐內容訂單)--歷史訂單筆記本
  const [orderHistory, setOrderHistory] = useState([]);

  //拿一個標記來標記輸入框的位置
  const counterRef = useRef(null);

  //點餐流程:當客人按下"送出訂單"按鈕後,依照當前點單筆記本的內容,拿出對應的"紙板便當"(因為目前沒有廚師)給客人,並且把詳細的訂單內容(不是客人講的話,而是實際的出餐內容)抄到歷史訂單筆記本後,把這頁撕掉丟垃圾桶
  const takeOrder = () => {
    //檢查如果點單不是空的再去做便當
    if (orderInput !== "") {
      //做出對應的便當
      const newBendo = {
        id: Date.now(),
        mainDish: `${orderInput}的主菜`,
        side1: `${orderInput}的配菜1`,
        side2: `${orderInput}的配菜2`,
        rice: `${orderInput}的飯`,
        soup: `${orderInput}的湯`,
      };
      //把當前的出餐,抄到歷史訂單筆記本上(寫在最前面)
      setOrderHistory([newBendo, ...orderHistory]);
      //把點單筆記本的這頁撕掉,這樣下個客人的點餐才不會混在一起
      setOrderInput("");
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
    const keyboardListener = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        //e.ctrlKey看是否有按著Ctrl鍵,e.key看按下的是哪個鍵,如果是Enter鍵的話
        teleportToCounter(); //就執行傳送到櫃檯的魔法
      }
    };
    //派傾聽者去聽整間餐廳
    window.addEventListener("keydown", keyboardListener); //在整間餐廳(window),聘用一位傾聽者來聽keydown事件,當有按鍵被按下時就執行keyboardListener這個動作
    //在工頭要重新指派工作(重新渲染)前,先把現在的傾聽者解雇掉,不然會越來越多人
    return () => {
    window.removeEventListener("keydown", keyboardListener); //在整間餐廳中做"聽keydown事件且執行keyboardListener"這個工作的傾聽者解雇掉(括號內要一模一樣)
    };
  }, []); //空陣列代表這個合約只會在工頭每次指派工作(渲染)時執行一次

  //剛剛那是內部跟員工講的規定,現在是涉及到外部硬體設施的部分
  return (
    <>
      <div className="BendoShop">
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
              if (e.key === "Enter")
                //如果按下的是Enter鍵
                takeOrder(); //就執行點餐流程
            }}
          />
          {/* 再在櫃檯增加一個點餐按鈕,如果按下就送出客人的點單 */}
          <button onClick={takeOrder}>下單</button>
        </div>
        {/* 櫃檯--歷史訂單顯示區 */}
        <div className="orderHistory-display">
          {/* 將歷史訂單筆記本裡面的清單一筆一筆拿出來抄到上面顯示出來給客人看 */}
          {orderHistory.map((bendo) => {
            //用map遍歷歷史訂單筆記本裡面的每一筆訂單並且傳到bendo這個變數裡面
            return (
              <div
                key={bendo.id}
                className="bendo-card"
                style={{
                  height: "100vh",
                  border: "2px dashed #ccc",
                  padding: "20px",
                }}
              >
                <h3>單字便當：{bendo.mainDish}</h3>
                <ul>
                  <li>主菜：{bendo.mainDish}</li>
                  <li>配菜1：{bendo.side1}</li>
                  <li>配菜2：{bendo.side2}</li>
                  <li>飯：{bendo.rice}</li>
                  <li>湯：{bendo.soup}</li>
                </ul>
              </div>
            );
          })}
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
