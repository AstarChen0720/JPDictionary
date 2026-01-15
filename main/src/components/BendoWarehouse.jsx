// 管理所有有關倉庫（supabase）的事情的元件

import {useState,useEffect } from "react";

//引入已經準備好服務我們的supabase駐點人員
import supabase from "../supabaseClient.js";




//將所有有關倉庫的功能和任務背後的邏輯集中在這裡，這樣如果要使用直接調用就好且不用看到裡面的細節
function BendoWarehouse(){

    //拿一筆記本來紀錄supabase通行證
    const [session, setSession] = useState(null);

    //再拿一本筆記本來紀錄客人點的菜(不是記客人點餐時講了什麼而是實際的出餐內容訂單)--歷史訂單筆記本
    const [orderHistory, setOrderHistory] = useState([]);


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
      //下面代表跟倉儲駐點人員說我要在什麼貨架新增什麼東西,然後記得寄出後要複製一份他收到的東西的備份回來(讓成功時data也要有東西)
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
        //備註,記得存好後,還要複製一份倉庫架上的東西(有標示倉庫貨品id)的備份給我
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
    //請一個人當保全去監聽通行證狀態有沒有變化,如果有變化會回傳什麼變化(event)和最新的通行證(session),然後更新到筆記本上
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

    //筆記本:把資料或函式return出去讓外面可以用（代表我可以讓外面用的部分）
  return {
    session,//因爲通行證的更新全部都由任務Ｂ完成,所以外面不會用到更新通行證的功能,只需要把最新的通行證拿出去給外面用就好
    orderHistory,
    setOrderHistory,
    addToSupabase,
    fetchFromSupabase,
    deleteSupabaseItem,
    updateSupabaseItem,
  }

}

export default BendoWarehouse;