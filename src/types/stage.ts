export type TaskStatus =
  | 'PENDING'
  | 'WAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  taskOrder: number
  requests: any[]
  createdAt: string
  updatedAt: string
}

export type RequestStatus = '승인 대기중' | '승인됨' | '반려됨'

export interface Request {
  id: number
  title: string
  content: string
  status: RequestStatus
  attachments: RequestAttachment[]
  action?: RequestAction
  createdAt: string
  updatedAt: string
}

export interface RequestAttachment {
  id: number
  type: 'file' | 'link'
  title: string
  url?: string
  fileName?: string
}

export interface RequestAction {
  type: '승인' | '반려'
  actorName: string
  reason?: string
  attachments?: RequestAttachment[]
  createdAt: string
}

export interface Stage {
  id: number
  name: string
  stageOrder: number
  tasks: Task[]
}
