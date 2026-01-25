//從supabase/supabase-js團隊請createClient這位倉儲駐點人員來幫我們跟倉儲公司溝通
import { createClient } from "@supabase/supabase-js";

//引入為了讓 Supabase 可以在 Chrome Extension 環境下運作的「轉接頭」
import storageAdapter from "./storageAdapter.js";


//倉庫地址
const supabaseUrl = "https://olyziedvrshemjhpdipz.supabase.co";
//從皮夾內拿supabase倉庫的通行證
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seXppZWR2cnNoZW1qaHBkaXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTEwNjAsImV4cCI6MjA4MzQyNzA2MH0.AyxLPzxbPH5wJOAoSMYyUPZKN8-7p9uFVYNPNuO394c";
//讓倉儲駐點人員根據倉庫地址和通行證準備好服務我們(ex跟他講要我的倉庫地址才知道要去哪個倉庫)

const supabase = createClient(supabaseUrl, SUPABASE_API_KEY, {
  auth: {
    // 這裡就是關鍵：告訴 Supabase 不要用 localStorage，改用我們的轉接頭
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Extension 不需要偵測網址變更
  },
});

//匯出這個已經準備好的supabase倉儲駐點人員讓別的地方可以用
export default supabase;