// ============================================================
//  DEVSHOP_SERVICES — supabase-config.js
//  ضع هذا الملف بجانب index.html
//  لا تشارك هذا الملف على GitHub بدون .gitignore
// ============================================================

// 1) روح على https://supabase.com وأنشئ مشروع جديد
// 2) من Settings > API انسخ URL و anon key وضعهم هنا

const SUPABASE_URL  = 'https://ldrrkdaznmiomqdoxaom.supabase.co';  // ← غيّر هذا
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkcnJrZGF6bm1pb21xZG94YW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MTY5NjksImV4cCI6MjA5MDk5Mjk2OX0.jrZ9box4sp46-o1jbk_Atr8VrodQ7v_sccpPw-rB2NY';                // ← غيّر هذا

// ============================================================
//  IDs الأدمن على ديسكورد (provider_id من Supabase Auth)
//  هذي هي IDs الفريق الموجودة في الموقع
// ============================================================
window.ADMIN_IDS = [
  '1447629348407345274',  // QPB · مدير السيرفرات
  '1232861476369203422',  // OMAR · مدير السيرفرات والمواقع
  '556881765428363279',   // mydro.dev · مدير البوتات
  '1447321911204773899',  // ERStorm · مدير التصاميم
];

// ============================================================
//  تهيئة Supabase Client
//  يتم استدعاؤه تلقائياً بعد تحميل مكتبة Supabase من CDN
// ============================================================
(function initSupabase() {
  // تحقق إن مكتبة Supabase محملة
  if (typeof window.supabase === 'undefined') {
    console.warn('[DEVSHOP] مكتبة Supabase غير محملة — تأكد من CDN في index.html');
    return;
  }

  if (SUPABASE_URL === 'https://YOUR_PROJECT.supabase.co') {
    console.warn('[DEVSHOP] لم يتم إعداد Supabase بعد — الموقع يعمل بدون قاعدة بيانات');
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('[DEVSHOP] ✓ Supabase client initialized');
})();

// ============================================================
//  هيكل جداول Supabase المطلوبة (SQL — شغّله في SQL Editor)
// ============================================================
/*
-- جدول الطلبات
CREATE TABLE orders (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service     text NOT NULL,
  user_id     uuid REFERENCES auth.users(id),
  status      text DEFAULT 'pending',
  created_at  timestamptz DEFAULT now()
);

-- جدول التقييمات
CREATE TABLE reviews (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  service     text,
  text        text NOT NULL,
  stars       int CHECK (stars BETWEEN 1 AND 5),
  created_at  timestamptz DEFAULT now()
);

-- جدول الخدمات (اختياري — لإدارتها من لوحة التحكم)
CREATE TABLE services (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  description text,
  price       text,
  status      text DEFAULT 'open',  -- open / busy / closed
  created_at  timestamptz DEFAULT now()
);

-- Row Level Security (RLS) — مهم للحماية
ALTER TABLE orders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
CREATE POLICY "public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "public read services" ON services FOR SELECT USING (true);

-- السماح للمسجلين بالإضافة
CREATE POLICY "auth insert orders"  ON orders  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth insert reviews" ON reviews FOR INSERT WITH CHECK (true);
*/
