import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Box, Tabs, Tab } from '@mui/material'
import {
  Project,
  Stage,
  ProjectStatus,
  StageStatus,
  Task
} from '../../../types/project'
import ProjectHeader from '../../../components/projects/ProjectHeader'
import ProjectArticle from '../../../components/projects/ProjectArticle'
import PaymentManagement from '../../../components/projects/PaymentManagement'
import { projectService } from '../../../services/projectService'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorMessage from '../../../components/common/ErrorMessage'
import { client } from '../../../api/client'
import { useToast } from '../../../contexts/ToastContext'

interface ProjectWithProgress extends Project {
  progress: number
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto'
      }}
      {...other}>
      {value === index && (
        <Box
          sx={{
            p: 3,
            height: '100%',
            '&::-webkit-scrollbar': {
              width: '8px',
              backgroundColor: '#f5f5f5'
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
              '&:hover': {
                background: '#555'
              }
            }
          }}>
          {children}
        </Box>
      )}
    </div>
  )
}

interface ApiStage {
  id: number
  name: string
  stageOrder: number
  requestCount: number
}

const UserProject: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialTab = queryParams.get('tab') === 'articles' ? 1 : 0

  const [project, setProject] = useState<ProjectWithProgress | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(initialTab)
  const { showToast } = useToast()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const fromArticles = location.pathname.includes('/articles/')
    if (fromArticles) {
      setTabValue(1)
      params.set('tab', 'articles')
      navigate(`/user/projects/${id}?${params.toString()}`, { replace: true })
    }
  }, [location.pathname, navigate, id])

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return

    try {
      setLoading(true)

      const response = await client.patch(`/projects/${project.id}/status`, {
        status: newStatus
      })

      if (response.data.status === 'success') {
        setProject(prev => (prev ? { ...prev, status: newStatus } : null))
        showToast('프로젝트 상태가 변경되었습니다.', 'success')
      } else {
        throw new Error('상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('프로젝트 상태 변경 실패:', error)
      showToast('프로젝트 상태 변경에 실패했습니다.', 'error')

      if (project) {
        setProject(prev => (prev ? { ...prev, status: project.status } : null))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    const newTab = newValue === 1 ? 'articles' : 'payments'
    const params = new URLSearchParams(location.search)
    params.set('tab', newTab)
    navigate(`?${params.toString()}`, { replace: true })
  }

  const handleStageEdit = async (stageId: number, newTitle: string) => {
    try {
      await client.put(`/stages/${stageId}`, { name: newTitle })
      setStages(prev =>
        prev.map(stage =>
          stage.id === stageId
            ? { ...stage, title: newTitle, name: newTitle }
            : stage
        )
      )
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  const handleStageDelete = async (stageId: number) => {
    try {
      await client.delete(`/stages/${stageId}`)
      setStages(prev => prev.filter(stage => stage.id !== stageId))
    } catch (error) {
      console.error('Failed to delete stage:', error)
    }
  }

  const handleTaskEdit = async (
    taskId: number,
    title: string,
    content: string
  ) => {
    try {
      await client.put(`/tasks/${taskId}`, { title, content })
      setStages(prev =>
        prev.map(stage => ({
          ...stage,
          tasks: stage.tasks.map(task =>
            task.id === taskId ? { ...task, title, description: content } : task
          )
        }))
      )
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) return
        const [projectData, stagesData] = await Promise.all([
          projectService.getProjectById(parseInt(id)),
          projectService.getProjectStages(parseInt(id))
        ])
        console.log('Project Data:', projectData)
        console.log('Stages Data:', stagesData)
        setProject({
          ...projectData,
          progress: 0
        })
        const convertedStages = (stagesData as unknown as ApiStage[]).map(
          stage => ({
            id: stage.id,
            title: stage.name,
            name: stage.name,
            stageOrder: stage.stageOrder,
            order: stage.stageOrder,
            status: '대기' as StageStatus,
            tasks: []
          })
        )
        console.log('Converted Stages:', convertedStages)
        setStages(convertedStages)
      } catch (err) {
        console.error('Error fetching project data:', err)
        setError('프로젝트 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (error)
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  if (!project) return <ErrorMessage message="프로젝트가 존재하지 않습니다." />

  return (
    <Box sx={{ p: 3 }}>
      <ProjectHeader
        project={project}
        onStatusChange={handleStatusChange}
        stages={stages}
        onStageEdit={handleStageEdit}
        onStageDelete={handleStageDelete}
        onTaskEdit={handleTaskEdit}
        onStagesChange={setStages}
      />

      <Box
        sx={{
          width: '100%',
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)'
        }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: '1px solid #E0E0E0',
            '& .MuiTab-root': {
              fontSize: '1.25rem',
              fontWeight: 'bold',
              py: 3,
              minHeight: '64px',
              color: '#666',
              '&.Mui-selected': {
                color: '#FFB800'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#FFB800',
              height: '3px'
            }
          }}>
          <Tab
            label="승인 관리"
            sx={{
              flex: 1,
              maxWidth: 'none'
            }}
          />
          <Tab
            label="질문 관리"
            sx={{
              flex: 1,
              maxWidth: 'none'
            }}
          />
        </Tabs>

        <Box
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden'
          }}>
          <TabPanel
            value={tabValue}
            index={0}>
            <PaymentManagement
              projectId={project.id}
              stages={stages}
            />
          </TabPanel>

          <TabPanel
            value={tabValue}
            index={1}>
            <ProjectArticle
              projectId={project.id}
              stages={stages}
            />
          </TabPanel>
        </Box>
      </Box>
    </Box>
  )
}

export default UserProject
