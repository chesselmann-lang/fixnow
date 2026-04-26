export type UserRole = 'customer' | 'provider'
export type RequestStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type Urgency = 'asap' | 'today' | 'week' | 'normal'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone?: string
  avatar_url?: string
  city?: string
  postal_code?: string
  created_at: string
}

export interface Category {
  id: number
  slug: string
  name: string
  icon: string
  description?: string
  sort_order: number
}

export interface ProviderProfile {
  id: string
  bio?: string
  website?: string
  hourly_rate_min?: number
  hourly_rate_max?: number
  radius_km: number
  rating_avg: number
  rating_count: number
  verified: boolean
  active: boolean
  // joined
  profile?: Profile
  categories?: Category[]
}

export interface ServiceRequest {
  id: string
  customer_id: string
  category_id?: number
  title: string
  description?: string
  status: RequestStatus
  city?: string
  postal_code?: string
  address?: string
  photos?: string[]
  budget_min?: number
  budget_max?: number
  urgency: Urgency
  offer_count: number
  created_at: string
  updated_at: string
  // joined
  customer?: Profile
  category?: Category
  offers?: Offer[]
}

export interface Offer {
  id: string
  request_id: string
  provider_id: string
  price: number
  message?: string
  status: OfferStatus
  available_from?: string
  created_at: string
  // joined
  provider?: ProviderProfile & { profile: Profile }
  request?: ServiceRequest
}

export interface Message {
  id: string
  offer_id: string
  sender_id: string
  content: string
  read_at?: string
  created_at: string
  sender?: Profile
}
