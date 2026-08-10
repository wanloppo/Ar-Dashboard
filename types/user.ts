export interface UserRecord {
  user_id: number
  username: string
  full_name: string
  email: string | null
  role: string
  is_active: boolean
  created_at: string | null
}

export interface UserPayload {
  username: string
  full_name: string
  email?: string | null
  role: string
  password?: string
  is_active: boolean
}
