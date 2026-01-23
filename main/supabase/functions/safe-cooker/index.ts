

//引入 Google Generative AI 駐點服務人員
import { GoogleGenerativeAI } from "@google/generative-ai";


//允許的連線和接收檔案的規則
//origin代表允許的來源，*代表所有來源
//headers代表允許帶有的東西(因為標頭就是內容物的標籤)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

//serve會接住所有請求並傳入內部函式的參數,req是request的縮寫
Deno.serve(async (req: Request) => {
  // 任何request在正式請求前都會先送一張通知單(預檢請求)他沒有東西,但是method是OPTIONS,通常會回給他我們的規則,然後他自己就會判斷要不要正式送請求過來
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200, // 明確指定狀態碼
      headers: corsHeaders 
    })
  }

  try {
    //從正式請求中取得json資料
    const { orderInput } = await req.json()

    if (!orderInput) {
      throw new Error("Missing orderInput")
    }

    // 從supabase保險箱取得 API Key (要在 Supabase 後台設定這些 Secrets)
    const AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY") || Deno.env.get("VITE_AI_API_KEY");
    const PIXABAY_API_KEY = Deno.env.get("PIXABAY_API_KEY") || Deno.env.get("VITE_PIXABAY_API_KEY");

    //安全檢查:如果沒有API就報錯
    if (!AI_API_KEY || !PIXABAY_API_KEY) {
      throw new Error("找不到google ai api key 或 pixabay api key");
    }

    const genAI = new GoogleGenerativeAI(AI_API_KEY);

    // 呼叫 Gemini
    const aiModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction: `
          你是一位精通日文教學的專業廚師。
          當我給你一個日文單字時，請嚴格遵守以下規則：
          1. 輸出格式必須是純 JSON 物件。
          2. JSON 欄位必須固定為：word,wordMapping, reading, meaning, accent, partOfSpeech, moraDetails, example_ja, example_cht, variations。
          3. 請使用繁體中文回覆。
          4. 絕對不要包含任何 Markdown 標籤，如 \`\`\`json 或 \`\`\`。
          5. 只要輸出 JSON 本身，不要有任何前言或後記。
          6. partOfSpeech請提供詳細詞性（例如：N5名詞、い形容詞、五段動詞）。
          7. moraDetails 欄位要求：請依據重音規則將讀音拆分為音拍陣列，每個物件包含：
            - char: string (該音拍的假名，注意拗音如きゃ算一拍)
            - isHigh: boolean (是否為高音)
            - hasDrop: boolean (比較這音拍和下一音拍的高低音有沒有相同,如果不同就標示true,相同或是最後一個音拍就標示false)
          8. wordMapping欄位要求: 將單字拆解，每個片段包含 text (原文) 和 reading (對應假名),例：「悪い」 -> [{"text": "悪", "reading": "わる"}, {"text": "い", "reading": "い"}]
          9. variations欄位要求: 用一個陣列放下這單字的多種讀音跟意思,結構:
            [
              {
                "reading": "常用的讀音A",
                "accent": 2, // 該讀音的重音數字
                "moraDetails": [...], // 該讀音的音拍分析
                "word": "單字本身",
                "wordMapping": [...], // 單字對應這個讀音的切分 (例如 悪+い)
                "meanings": [ // 該讀音下的多種意思
                  {
                    "partOfSpeech": "下一段動詞",
                    "partOfSpeechIdentifier": "true或false,如果是名詞或動詞就標true,其他就標false", 
                    "meaning": "意思1",
                    "meaningInDetail": "更詳細的意思說明,ex:食べます是從食べる而來意思是更加尊敬的意思",
                    "meaningConcept": "這個意思的概念性說明,ex:bin就是你家的垃圾桶的意思,綠色的垃圾集裝箱又是不同說法,記得小心不要弄錯了喔",
                    "example_ja": "例句日文",
                    "example_ja_kana": "例句日文的純假名版本",
                    "example_cht": "例句中文",
                    "example_special": "特殊例句,且有強故事性,只有目標那個字是日文,其他都中文,  ex:(在魔王城外帳篷內,明天就要進攻)A:各位我們一定要<日文>成功<日文>!!!",

                  },
                  {
                    "partOfSpeech": "い形容詞",
                    "partOfSpeechIdentifier": "true或false,如果是名詞或動詞就標true,其他就標false", 
                    "meaning": "意思2",
                    "meaningInDetail": "更詳細的意思說明,ex:食べます是從食べる而來意思是更加尊敬的意思",
                    "meaningConcept": "這個意思的概念性說明,ex:bin就是你家的垃圾桶的意思,綠色的垃圾集裝箱又是不同說法,記得小心不要弄錯了喔",
                    "example_ja": "例句日文",
                    "example_ja_kana": "例句日文的純假名版本",
                    "example_cht": "例句中文",
                    "example_special": "特殊例句,且有強故事性,只有茶的字是日文,其他都中文,  ex:(在魔王城外帳篷內,明天就要進攻)A:各位我們一定要success!!!",
                  }
                ]
              },
              {
                "reading": "次要的讀音B",
                // ... 同上結構
              }
            ]
          
          範例：「食べる」(2型): 
          {
            "word": "食べる",
            "wordMapping": [{"text": "食", "reading": "た"}, {"text": "べ", "reading": "べ"}, {"text": "る", "reading": "る"}],
            "reading": "たべる", 
            "meaning": "吃",
            "accent": 2,
            "partOfSpeech": "下一段動詞",
            "moraDetails": [{"char":"た","isHigh":false,"hasDrop":false},{"char":"べ","isHigh":true,"hasDrop":true},{"char":"る","isHigh":false,"hasDrop":false}],
            "example_ja": "パンを食べる",
            "example_cht": "吃麵包"
            "variations": [...]
          }
      `,
    });

    //拿回結果包裹拿出結果並拆開
    const result = await aiModel.generateContent(orderInput);
    const responseText = result.response.text();
    const bendoMeals = JSON.parse(responseText);

    // 判斷是否需要搜尋圖片 (只要任何一個意思是名詞或動詞就搜尋)
    const shouldSearch = bendoMeals.variations?.some((variation: any) => 
      variation.meanings.some((meaning: any) => meaning.partOfSpeechIdentifier === "true")
    );

    // 如果需要搜尋圖片就去 Pixabay 搜尋
    if (shouldSearch) {
      const wantSearchItem = bendoMeals.word || orderInput;
      if (wantSearchItem) {
        try {
          ////組合要呼叫的網址,encodeURIComponent代表把後面的東西變成安全的網址(因為有時如果有空隔或中文日文再網址會出問題),,lang=ja代表要搜尋的語系是日文,searchType=photo代表我們要搜尋圖片,per_page=3代表只要回傳三張圖片
          const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(wantSearchItem)}&lang=ja&image_type=photo&per_page=3`;
          //用fetch去搜尋圖片
          const pixRes = await fetch(url);
          //因為fetch回傳的東西是json格式,所以要用json()把他轉成物件
          const pixData = await pixRes.json();
          
          ////Pixabay 回傳的陣列叫做 hits,如果有東西就拿第一張圖片的url,並加入variations裡面
          if (pixData.hits && pixData.hits.length > 0) {
            const imageUrl = pixData.hits[0].webformatURL;
            // 寫入 imageUrl
            bendoMeals.variations = bendoMeals.variations?.map((variation: any) => ({
              ...variation,
              imageUrl: imageUrl,
            }));
          }
        } catch (error) {
          console.error("pxiabay圖片搜尋失敗", error);
        }
      }
    }

    //回傳結果給前端
    return new Response(
      JSON.stringify(bendoMeals),
      //記得要加上cors標頭瀏覽器才知道是你才不會擋掉
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )

    //如果有錯誤就回傳錯誤訊息
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        //記得要加上cors標頭瀏覽器才知道是你才不會擋掉
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      },
    )
  }
});

    












    

