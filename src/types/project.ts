export interface Project {
  id: number
  title: string
  description: string
  devCompanyName: string
  clientCompanyName: string
  projectName: string
  startDate: string
  endDate: string
  status: ProjectStatus
  clientCompanyManagers: string[]
  clientCompanyMembers: string[]
  devCompanyManagers: string[]
  devCompanyMembers: string[]
}

export type ProjectStatus = '대기' | '진행 중' | '완료' | '중단'

export interface ProjectMember {
  id: number
  name: string
  email: string
  role: string
  companyId: number
  companyName: string
  position?: string
}

export type StageStatus = '대기' | '진행중' | '완료'
export type TaskStatus = '대기' | '진행중' | '완료'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  order: number
  stageId: number
  createdAt: string
  updatedAt: string
  requests: any[]
}

export interface Stage {
  stageOrder: any | number
  name: any | string
  id: number
  title: string
  order: number
  status: StageStatus
  startDate?: string
  endDate?: string
  tasks: Task[]
}

export interface ProjectWithProgress extends Project {
  progress: number
  stages: Stage[]
}
