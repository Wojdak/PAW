type ISOString = string
export interface Notification {
  title: string,
  message: string,
  date: ISOString,
  priority: 'low'|'medium'|'high',
  read: boolean
}