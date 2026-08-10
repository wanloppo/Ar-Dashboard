export type ScreenAction = 'insert' | 'update' | 'delete' | 'query' | 'report' | 'process'

export interface ScreenRecord {
  screen_id: number
  screen_eng_name: string
  screen_tha_name: string
  insert_active: boolean
  update_active: boolean
  delete_active: boolean
  query_active: boolean
  report_active: boolean
  process_active: boolean
  created_at: string | null
}

export interface ScreenPermission {
  screen_eng_name: string
  insert_active: boolean
  update_active: boolean
  delete_active: boolean
  query_active: boolean
  report_active: boolean
  process_active: boolean
}
