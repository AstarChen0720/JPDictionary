// 管理所有有關倉庫（supabase）的事情的元件

import {useState,useEffect,useRef} from "react";

//引入已經準備好服務我們的supabase駐點人員
import supabase from "../supabaseClient.js";

// 定義本地儲物箱的標籤名稱(Key),一定要有
const LOCAL_STORAGE_KEY = "bendo_localstorage";


//將所有有關倉庫的功能和任務背後的邏輯集中在這裡，這樣如果要使用直接調用就好且不用看到裡面的細節
function BendoWarehouse() {
  //拿一筆記本來紀錄supabase通行證
  const [session, setSession] = useState(null);

  //再拿一本筆記本來紀錄客人點的菜(不是記客人點餐時講了什麼而是實際的出餐內容訂單)--歷史訂單筆記本
  const [orderHistory, setOrderHistory] = useState([]);

  //拿一個標記來標記已經同步過的人的ID
  const syncedUserId = useRef(null);

  //增加便當(通用)
  const addBendo = async (newBendo) => {
    if (session){
      return await addToSupabase(newBendo);
    } else {
      return addToLocalStorage(newBendo);
    }
  }
  //查取便當(通用)
  const fetchBendo = async () => {
    if (session){
      return await fetchFromSupabase();
    } else {
      return fetchFromLocalStorage();
    }
  }
  //刪除便當(通用)
  const deleteBendo = async (targetID) => {
    if (session){
      return await deleteSupabaseItem(targetID);
    }else {
      return deleteLocalStorageItem(targetID);
    }
  }
  //修改便當(通用)
  const updateBendo = async (targetID, wantUpdateBendo) => {
    if (session){
      return await updateSupabaseItem(targetID, wantUpdateBendo);
    }else{
      return updateLocalStorageItem(targetID, wantUpdateBendo);
    }
  }







  // 本地儲存幫手1: 從箱子東西拿出來
  const getLocalData = () => {
    // 從本地儲物箱取出東西
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    // 有資料就拆箱，沒資料就給空陣列
    return data ? JSON.parse(data) : [];
  };

  // 本地儲存幫手2: 放進東西進箱子
  const setLocalData = (data) => {
    // 裝箱後放進本地儲物箱,setItem(標籤名稱,裝箱後的東西)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };
  
  //向本地儲物箱增加東西的SOP:addToLocalStorage(想放進儲物箱的東西),將你給他的東西放進瀏覽器的本地儲物箱
  //本地儲物箱雖然是在本地但是仍要裝箱存放(東西才不會被壓壞),所以取出或放入都要拆裝箱
  const addToLocalStorage = (wantSaveBendo) => {
    try {
      console.log("正在將便當存入本地儲物箱localStorage...");
      //先拿出本地儲物箱東西
      const localBendo = getLocalData();
      //將新東西放進陣列中
      const newLocalBendo = [ wantSaveBendo, ...localBendo];
      //放回儲物箱
      setLocalData(newLocalBendo);
      //回傳新增好的資料讓外面知道
      return newLocalBendo;
    } catch (error) {
      //localStorage如果出錯會自動跳到這裡,不用我throw
      console.error("向本地儲物箱增加東西SOP錯誤回報", error);
    }
  };

  //向本地儲物箱查取東西的SOP:fetchFromLocalStorage()
  //取回瀏覽器本地儲物箱裡面的所有東西
  const fetchFromLocalStorage = () => {
    try {
      console.log("正在從本地儲物箱localStorage取貨...");
      //先從本地儲物箱取出現有的東西
      const localBendo = getLocalData();
      //回傳取出的東西讓外面使用
      return localBendo;
    } catch (error) {
      //localStorage如果出錯會自動跳到這裡,不用我throw
      console.error("向本地儲物箱查取東西SOP錯誤回報", error);
    }
  };

  //將本地儲物箱某東西刪除的SOP:deleteLocalStorageItem(想刪除的東西的id)
  //將你給的id的對應的東西從本地儲物箱刪除
  const deleteLocalStorageItem = (targetID) => {
    try {
      console.log("正在刪除本地儲物箱localStorage的便當...");
      //先從本地儲物箱取出現有的東西
      const localBendo = getLocalData();
      //刪除指定id的東西
      // filter:濾掉不需要的東西並留下需要的東西,一一取出每個東西當作參數,去跟函數裡的return條件進行比較,他會把所有true的組成一個新陣列回傳,舊陣列.filter((每個東西) => {return 判斷條件}
      const newLocalBendo = localBendo.filter(
        (oldBendo) => oldBendo.id !== targetID,
      );

      //裝箱後放回本地儲物箱
      setLocalData(newLocalBendo);

      //同步刪除筆記本上的資料(直接將刪完的陣列更新到筆記本上)
      setOrderHistory(newLocalBendo);
    } catch (error) {
      //localStorage如果出錯會自動跳到這裡,不用我throw
      console.error("將本地儲物箱某東西刪除的SOP錯誤回報", error);
    }
  };

  //將本地儲物箱某東西修改的SOP:updateLocalStorageItem(想修改的東西的id,{欄位名稱:修改後的值,...}(可以一次改多個))
  const updateLocalStorageItem = (targetID, wantUpdateBendo) => {
    try {
      //拿出來改好後放回
      console.log("正在修改本地儲物箱localStorage的便當...");
      //先從本地儲物箱取出現有的東西
      const localBendo = getLocalData();

      //找到並修改資料後放進新陣列
      const newLocalBendo = localBendo.map((localBendo) => {
        //如果當前掃到的便當是要修改的那個
        if (localBendo.id === targetID) {
          //將localBendo這一項倒出來,如後面有跟前面一樣值就會被取代
          return { ...localBendo, ...wantUpdateBendo };
        }
        //不是就回傳原本的便當
        return localBendo;
      });
      //裝箱後放回本地儲物箱
      setLocalData(newLocalBendo);
      //同步更新筆記本上的資料(直接將修改完的陣列更新到筆記本上)
      setOrderHistory(newLocalBendo);
      //回傳修改好的資料讓外面知道
      return newLocalBendo;
    } catch (error) {
      //localStorage如果出錯會自動跳到這裡,不用我throw
      console.error("將本地儲物箱某東西修改的SOP錯誤回報", error);
    }
  };

  //向倉庫增加東西的SOP:addToSupabase(想上傳到倉庫的東西),將你給他的東西上傳到倉庫,如果有存成功就把筆記本上id改成倉庫貨品id
  //告訴倉儲駐點人員我要增加什麼東西到倉庫裡面,看他回報有沒有成功,成功把筆記本上id改成倉庫貨品id,失敗印出錯誤內容
  const addToSupabase = async (wantSaveBendo) => {
    //檢查有沒有supabase通行證(有登入的話才可以存檔)
    if (!session) {
      console.error("未登入，無法存檔");
      return null;
    }

    try {
      //supabase.from('bendo_table').insert.select()是一個鏈式指令,袋表一連串連續的指令,前面會影響到後面,有限定只有哪些能用(像是你不能前面說去沙漠,後面說釣魚)
      //下面代表跟倉儲駐點人員說我要在什麼貨架新增什麼東西,然後記得寄出後要複製一份他收到的東西的備份回來(讓成功時data也要有東西)
      console.log("正在將便當存入supabase倉庫...");
      const result = await supabase
        //supabase.from("bendoOrderHistory")代表去倉庫的bendoOrderHistory貨架
        .from("bendoOrderHistory")
        //要放入的東西
        .insert([
          {
            bendoName: wantSaveBendo.bendoName,
            chtMeaning: wantSaveBendo.chtMeaning,
            reading: wantSaveBendo.reading,
            accent: wantSaveBendo.accent,
            example_ja: wantSaveBendo.example_ja,
            example_cht: wantSaveBendo.example_cht,
            user_id: session.user.id, //記錄是誰放的
            moraDetails: wantSaveBendo.moraDetails, //新增音拍詳細資料
            partOfSpeech: wantSaveBendo.partOfSpeech, //新增詞性
            wordMapping: wantSaveBendo.wordMapping, //新增單字拆解後對應的假名
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
      //將倉庫貨品id取代筆記本上對應的便當id
      setOrderHistory((prev) => {
        //map會遍歷每一資料後,蒐集回傳的資料組成一個新的陣列回傳出去
        return prev.map((oldBendo) => {
          //如果當前掃到的便當是剛剛做出來的那個,wantSaveBendo就是newBendo(看App.jsx的takeOrder())
          if (oldBendo.id === wantSaveBendo.id) {
            console.log(`便當成功存入倉庫！新ID是: ${result.data[0].id}`);
            //將倉庫貨品id取代掉現在便當上的臨時id(把newBendo的id改成supabese上的id),並回傳
            //將bendo物件展開後舊id改成新id
            return { ...oldBendo, id: result.data[0].id };
            //如不是就回傳原本的便當物件
          } else {
            return oldBendo;
          }
        });
      });
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
      console.log("正在從supabase倉庫取貨...");
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
      console.log("正在從supabase倉庫刪除貨物...");
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
      console.log("正在從supabase倉庫修改貨物...");
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

      // 同步更新筆記本的資料(其實應該不用但保險起見)
      setOrderHistory((prev) => {
        return prev.map((oldBendo) => {
          if (oldBendo.id === targetID) {
            // 將原本的便當展開，並覆蓋上修改後的內容
            return { ...oldBendo, ...result.data[0] };
          }
          return oldBendo;
        });
      });

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    //叫工頭記得在便當店拆掉時要叫他收工
    return () => subscription.unsubscribe();
  }, []); //空陣列代表他只會在開店時執行一次

  //任務C同步資料任務:如果通行證內容有變化,就檢查有沒有登入,
  //有登入,先檢查本地資料,有就先上傳後下載最新資料,沒有就直接下載最新資料
  //沒登入,直接清空本地資料和筆記本資料
  useEffect(() => {
    const syncData = async () => {
      if (session) {
        // 如果現在這個人的 ID 跟我剛剛同步過的人一樣，就直接跳過
        if (syncedUserId.current === session.user.id) {
          console.log("偵測到此會員剛剛已有完成同步，略過本次同步");
          return;
        }

        //紀錄下這人的ID,代表他已經同步過了
        syncedUserId.current = session.user.id;
        console.log("偵測到會員已登入，正在檢查是否有本地資料要同步...");
        //檢查本地有沒有資料
        const localBendo = getLocalData();
        //先刪,如果失敗再放回去,這樣本地資料刪除就不用等要上傳完
        //避免如果有人網速很慢,快入登出再登入會重複上傳
        localStorage.removeItem(LOCAL_STORAGE_KEY);

        if (localBendo.length > 0) {
          console.log(
            `發現有${localBendo.length}筆本地資料，正在同步到倉庫...`,
          );
          //有資料就上傳到supabase,並抓他有沒有錯誤
          //要直接整理資料後呼叫supabase上傳,因為addToSupabase無法傳多筆資料
          //整理好要上傳的資料陣列
          const readyToUpload = localBendo.map((bendo) => ({
            bendoName: bendo.bendoName,
            chtMeaning: bendo.chtMeaning,
            reading: bendo.reading,
            accent: bendo.accent,
            example_ja: bendo.example_ja,
            example_cht: bendo.example_cht,
            user_id: session.user.id,
            moraDetails: bendo.moraDetails,
            partOfSpeech: bendo.partOfSpeech,
            wordMapping: bendo.wordMapping,
          }));
          //直接呼叫supabase上傳,並抓他有沒有錯誤
          const { error } = await supabase
            .from("bendoOrderHistory")
            .insert(readyToUpload);

          //上傳成功
          if (!error) {
            console.log("本地資料上傳到倉庫成功，正在清除本地資料...");
          }
          //失敗就印出錯誤內容並放回本地資料
          if (error) {
            console.error("本地資料上傳到倉庫時發生錯誤:", error);
            setLocalData(localBendo); //放回本地資料
          }
        }
        //不管有沒有本地資料,最後都去抓supabase最新資料
        console.log("正在從倉庫下載最新資料...");
        const supabaseBendo = await fetchFromSupabase();
        //如果有資料就更新筆記本
        if (supabaseBendo) {
          setOrderHistory(supabaseBendo);
        }
      } else {
        //沒登入(或登出)就重設同步過的狀態(這樣才不會同一人再登入無法同步),且清空資料
        syncedUserId.current = null;
        //刪除本地資料
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        //清空筆記本資料
        setOrderHistory([]);  
        console.log("沒有登入，清空歷史訂單...");
      }
    };
    syncData();
  }, [session?.user?.id]); //每當session內的用戶id有變化時才重新執行一次,因為如果看整個session的話太敏感,切畫面再切回都會讓session整體有變化,這樣會一直同步,
  //執行的太快就會重複上傳資料,現在這樣只要用戶id有變化時才重執行,就不會有這個問題了
  //警告不要理他

  //筆記本:把資料或函式return出去讓外面可以用（代表我可以讓外面用的部分）
  return {
    session, //因爲通行證的更新全部都由任務Ｂ完成,所以外面不會用到更新通行證的功能,只需要把最新的通行證拿出去給外面用就好
    orderHistory,
    setOrderHistory,
    addBendo,
    fetchBendo,
    deleteBendo,
    updateBendo,
  };
}

export default BendoWarehouse;