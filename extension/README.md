1. 選取文字右鍵選單有個選項叫"用JPDictionary查詢XX"
   1. 用background處理,他收到有案按鈕後,叫content-script找整句話
2. 選取後會自動抓這字的父元素(也就是整段文字),並組合成一句話例如:"我要查詢XXXXXXXXXX中的XX"並請safe-cooker處理,(要這樣是為了要提高準確性)
   1. content-script收到指令後取找整句話並拼好
3. 這時如果沒有登入就會先跳登入介面,登入後才送出<---目前在這
   1. 製作轉接頭：讓 Supabase 懂得將 Token 存在 Chrome 的 storage.local 裡。
   2. 設定 Client：建立 Extension 專用的 Supabase Client。
   3. 做登入畫面：修改 Popup 讓使用者能登入。
   4. 最後才是連線：讓 Background 使用登入後的 Token 去呼叫廚房。
4. 拿到送回的菜,組合成便當,新增(create)到supabase讓我網頁端也可以同步資料(上面都在background,他呼叫api比 較不會那麼嚴格)
5. 然後顯示(content-script)