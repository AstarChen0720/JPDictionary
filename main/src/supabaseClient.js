//從supabase/supabase-js團隊請createClient這位倉儲駐點人員來幫我們跟倉儲公司溝通
import { createClient } from "@supabase/supabase-js";
//倉庫地址
const supabaseUrl = "https://olyziedvrshemjhpdipz.supabase.co";
//從皮夾內拿supabase倉庫的通行證
const SUPABASE_API_KEY = import.meta.env.VITE_SUPABASE_API_KEY;
//讓倉儲駐點人員根據倉庫地址和通行證準備好服務我們(ex跟他講要我的倉庫地址才知道要去哪個倉庫)
const supabase = createClient(supabaseUrl, SUPABASE_API_KEY);

//匯出這個已經準備好的supabase倉儲駐點人員讓別的地方可以用
export default supabase;