// types/index.ts - All TypeScript types for the CMS

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'content_manager' | 'viewer';

export interface AdminProfile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
  permissions: Record<string, boolean>;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value?: string | null;
  value_json?: Record<string, unknown> | null;
  category: 'general' | 'contact' | 'social' | 'seo' | 'header' | 'footer' | 'advanced';
  label?: string | null;
  type: string;
  updated_at: string;
}

export type SiteSettings = Record<string, string | null>;

export interface ThemeSetting {
  id: string;
  name: string;
  is_active: boolean;
  mode: 'light' | 'dark' | 'auto';
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  font_size_base: string;
  border_radius: string;
  shadow_level: string;
  layout_width: string;
  custom_css?: string | null;
  created_at: string;
}

export interface PageBackground {
  id: string;
  page_key: string;
  page_label: string;
  file_path?: string | null;
  file_type?: 'image' | 'video' | null;
  overlay_color?: string | null;
  overlay_opacity?: number | null;
  blur_amount?: number | null;
  brightness?: number | null;
  contrast?: number | null;
  position?: string | null;
  size?: string | null;
  repeat?: string | null;
  animation?: string | null;
  is_active: boolean;
}

export interface Slider {
  id: string;
  name: string;
  position: string;
  is_active: boolean;
  autoplay: boolean;
  autoplay_speed: number;
  show_arrows: boolean;
  show_dots: boolean;
  animation: string;
  items?: SliderItem[];
}

export interface SliderItem {
  id: string;
  slider_id: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  button_text?: string | null;
  button_url?: string | null;
  button_secondary_text?: string | null;
  button_secondary_url?: string | null;
  media_url?: string | null;
  media_type: 'image' | 'video';
  overlay_color?: string | null;
  text_align?: string | null;
  text_color?: string | null;
  animation_in?: string | null;
  sort_order: number;
  is_active: boolean;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  icon?: string | null;
  cover_image_url?: string | null;
  gallery: string[];
  features: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  sort_order: number;
  is_active: boolean;
  children?: ProductCategory[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  website_url?: string | null;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  description?: string | null;
  short_description?: string | null;
  price: number;
  sale_price?: number | null;
  currency: string;
  category_id?: string | null;
  brand_id?: string | null;
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order';
  stock_quantity?: number | null;
  image_url?: string | null;
  gallery: string[];
  tags: string[];
  attributes: Record<string, string>;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
  is_published: boolean;
  is_featured: boolean;
  views_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: ProductCategory | null;
  brand?: Brand | null;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  client_name?: string | null;
  location?: string | null;
  start_date?: string | null;
  completion_date?: string | null;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  cover_image_url?: string | null;
  before_image_url?: string | null;
  after_image_url?: string | null;
  gallery: string[];
  video_url?: string | null;
  service_id?: string | null;
  tags: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  service?: Service | null;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  cover_image_url?: string | null;
  category_id?: string | null;
  author_id?: string | null;
  tags: string[];
  reading_time?: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
  is_published: boolean;
  is_featured: boolean;
  views_count: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  category?: ArticleCategory | null;
  author?: AdminProfile | null;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_title?: string | null;
  client_company?: string | null;
  client_image_url?: string | null;
  content: string;
  rating: number;
  is_published: boolean;
  sort_order: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  icon?: string | null;
  suffix?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  customer_address: string;
  notes?: string | null;
  status: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  total_amount: number;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  admin_reply?: string | null;
  created_at: string;
}

export interface Quote {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  service_id?: string | null;
  details?: string | null;
  budget?: string | null;
  timeline?: string | null;
  status: 'pending' | 'contacted' | 'quoted' | 'accepted' | 'rejected';
  admin_notes?: string | null;
  created_at: string;
  service?: Service | null;
}

export interface Media {
  id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_url: string;
  file_type: 'image' | 'video' | 'document' | 'other';
  mime_type?: string | null;
  file_size?: number | null;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  caption?: string | null;
  folder: string;
  tags: string[];
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string | null;
  user_name?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  entity_label?: string | null;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
  ip_address?: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'contact' | 'quote' | 'system' | 'error';
  title: string;
  message?: string | null;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

// Cart types
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image_url?: string | null;
  quantity: number;
}

// Server action result types
export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
