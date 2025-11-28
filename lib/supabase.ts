/// <reference types="vite/client" />
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// 这里的环境变量需要在 .env 文件或 Vercel 后台配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // 暂时注释掉报错，防止没配置时页面直接白屏，方便你调试 UI
  // throw new Error('缺少 Supabase 环境变量')
  console.warn('请检查 .env 文件是否配置了 VITE_SUPABASE_URL')
}

// 如果没有 key，就给个空字符串防止 crash，但在控制台会有警告
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)