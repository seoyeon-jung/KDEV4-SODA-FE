import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material'
import useProjectStore from '../../stores/projectStore'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useTheme } from '@mui/material/styles'
import { LayoutDashboard } from 'lucide-react'
import { companyService } from '../../services/companyService'
import { client } from '../../api/client'
import dayjs from 'dayjs'
import ProjectCreationTrendChart from '../../components/charts/ProjectCreationTrendChart'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import isBetween from 'dayjs/plugin/isBetween'
import CompanyCreationTrendChart from '../../components/charts/CompanyCreationTrendChart'

interface ActiveProject {
  id: number
  title: string
  status: string
  startDate: string
  endDate: string
  weeklyRequestCount: number
  weeklyArticleCount: number
  weeklyActivity: number
  recentActivityDate: string | null
}

dayjs.extend(isBetween)

export default function AdminMain() {
  const navigate = useNavigate()
  const { projects, isLoading, error, fetchAllProjects } = useProjectStore()
  const theme = useTheme()
  const [totalCompanies, setTotalCompanies] = useState<number>(0)
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([])
  const [loadingActiveProjects, setLoadingActiveProjects] = useState(false)
  const [trendTimeUnit, setTrendTimeUnit] = useState<'DAY' | 'WEEK' | 'MONTH'>(
    'DAY'
  )
  const [trendStartDate, setTrendStartDate] = useState(
    dayjs().startOf('week').add(1, 'day')
  )
  const [trendEndDate, setTrendEndDate] = useState(
    dayjs().endOf('week').add(1, 'day')
  )
  const [trendKey, setTrendKey] = useState(0)
  const [companyTrendUnit, setCompanyTrendUnit] = useState<
    'DAY' | 'WEEK' | 'MONTH'
  >('DAY')
  const [companyTrendStartDate, setCompanyTrendStartDate] = useState(
    dayjs().startOf('week').add(1, 'day')
  )
  const [companyTrendEndDate, setCompanyTrendEndDate] = useState(
    dayjs().endOf('week').add(1, 'day')
  )
  const [companyTrendKey, setCompanyTrendKey] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      await fetchAllProjects()
      await fetchCompanies()
      await fetchActiveProjects()
    }
    fetchData()
  }, [fetchAllProjects])

  useEffect(() => {
    if (projects && projects.length > 0) {
      console.log('전체 프로젝트:', projects)
      projects.forEach(p => {
        console.log('프로젝트 정보:', {
          title: p.title,
          endDate: p.endDate,
          formattedEndDate: dayjs(p.endDate).format('YYYY-MM-DD'),
          isAfterToday: dayjs(p.endDate).isAfter(dayjs()),
          status: p.status
        })
      })
    }
  }, [projects])

  const fetchCompanies = async () => {
    try {
      const companies = await companyService.getAllCompanies()
      setTotalCompanies(companies.length)
    } catch (error) {
      console.error('회사 목록을 불러오는데 실패했습니다:', error)
    }
  }

  const fetchActiveProjects = async () => {
    try {
      setLoadingActiveProjects(true)
      const response = await client.get('/projects', {
        params: {
          sort: 'weeklyActivity'
        }
      })
      if (response.data.status === 'success') {
        setActiveProjects(response.data.data.content)
      }
    } catch (error) {
      console.error(
        '활동이 많은 프로젝트 목록을 불러오는데 실패했습니다:',
        error
      )
    } finally {
      setLoadingActiveProjects(false)
    }
  }

  const handleProjectClick = (projectId: number) => {
    navigate(`/user/projects/${projectId}`)
  }

  const handleProjectManageClick = (projectId: number) => {
    navigate(`/admin/projects/${projectId}`)
  }

  const handleViewMoreProjects = () => {
    navigate('/admin/projects')
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return '진행 중'
      case 'CONTRACT':
        return '계약 전'
      case 'COMPLETED':
        return '완료'
      case 'MAINTENANCE':
        return '하자보수'
      case 'STOPPED':
        return '중단'
      default:
        return '대기'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return theme.palette.success.main
      case 'CONTRACT':
        return theme.palette.warning.main
      case 'COMPLETED':
        return theme.palette.info.main
      case 'MAINTENANCE':
        return theme.palette.error.main
      case 'STOPPED':
        return theme.palette.error.dark
      default:
        return theme.palette.success.light
    }
  }

  const handleTrendSearch = () => {
    setTrendKey(prev => prev + 1)
  }

  const handleCompanyTrendSearch = () => setCompanyTrendKey(prev => prev + 1)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={fetchAllProjects}
      />
    )
  }

  // projects가 배열인지 확인
  if (!Array.isArray(projects)) {
    return (
      <ErrorMessage
        message="프로젝트 데이터 형식이 올바르지 않습니다."
        onRetry={fetchAllProjects}
      />
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        maxWidth: 1400,
        mx: 'auto',
        py: 4
      }}>
      {/* 프로젝트 섹션 */}
      <Box>
        {/* 프로젝트 현황 카드들 */}
        <Grid
          container
          spacing={3}>
          <Grid
            item
            xs>
            <Card
              onClick={() => navigate('/admin/projects?status=CONTRACT')}
              sx={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: '4px solid #64748B',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transform: 'scale(1.02)'
                }
              }}>
              <CardContent>
                <Typography
                  sx={{ fontSize: '1.25rem', color: '#1a1a1a', mb: 1 }}>
                  계약
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#64748B'
                  }}>
                  {projects.filter(p => p.status === 'CONTRACT').length}건
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs>
            <Card
              onClick={() => navigate('/admin/projects?status=IN_PROGRESS')}
              sx={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: '4px solid #FFB800',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transform: 'scale(1.02)'
                }
              }}>
              <CardContent>
                <Typography
                  sx={{ fontSize: '1.25rem', color: '#1a1a1a', mb: 1 }}>
                  진행중
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#FFB800'
                  }}>
                  {projects.filter(p => p.status === 'IN_PROGRESS').length}건
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs>
            <Card
              onClick={() => navigate('/admin/projects?status=DELIVERED')}
              sx={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: '4px solid #22C55E',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transform: 'scale(1.02)'
                }
              }}>
              <CardContent>
                <Typography
                  sx={{ fontSize: '1.25rem', color: '#1a1a1a', mb: 1 }}>
                  납품완료
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#22C55E'
                  }}>
                  {projects.filter(p => p.status === 'DELIVERED').length}건
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs>
            <Card
              onClick={() => navigate('/admin/projects?status=MAINTENANCE')}
              sx={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: '4px solid #8B5CF6',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transform: 'scale(1.02)'
                }
              }}>
              <CardContent>
                <Typography
                  sx={{ fontSize: '1.25rem', color: '#1a1a1a', mb: 1 }}>
                  하자보수
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#8B5CF6'
                  }}>
                  {projects.filter(p => p.status === 'MAINTENANCE').length}건
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            xs>
            <Card
              onClick={() => navigate('/admin/projects?status=ON_HOLD')}
              sx={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: '4px solid #EF4444',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transform: 'scale(1.02)'
                }
              }}>
              <CardContent>
                <Typography
                  sx={{ fontSize: '1.25rem', color: '#1a1a1a', mb: 1 }}>
                  일시중단
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#EF4444'
                  }}>
                  {projects.filter(p => p.status === 'ON_HOLD').length}건
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 마감 임박 프로젝트와 최근 활동 프로젝트 섹션 */}
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 마감 임박 프로젝트 */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid #e5e7eb',
              borderRadius: 2,
              bgcolor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
              }}>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#1a1a1a'
                }}>
                마감 임박 프로젝트
              </Typography>
              <Button
                variant="outlined"
                onClick={handleViewMoreProjects}
                size="small"
                sx={{
                  borderRadius: 2,
                  borderColor: '#e5e7eb',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#666',
                    bgcolor: 'transparent'
                  }
                }}>
                더보기
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        borderBottom: '2px solid #e5e7eb'
                      }}>
                      프로젝트
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        borderBottom: '2px solid #e5e7eb'
                      }}>
                      마감일
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        borderBottom: '2px solid #e5e7eb'
                      }}>
                      대시보드
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects
                    .filter(p => p.status === 'IN_PROGRESS')
                    .map(p => ({
                      ...p,
                      daysUntilEnd: dayjs(p.endDate)
                        .startOf('day')
                        .diff(dayjs().startOf('day'), 'day')
                    }))
                    .sort((a, b) => a.daysUntilEnd - b.daysUntilEnd)
                    .slice(0, 3)
                    .map(project => {
                      const daysUntilEnd = project.daysUntilEnd
                      const isOverdue = daysUntilEnd < 0
                      const isUrgent = daysUntilEnd <= 7 && !isOverdue

                      return (
                        <TableRow
                          key={project.id}
                          hover>
                          <TableCell sx={{ maxWidth: '200px' }}>
                            <Typography
                              onClick={() =>
                                handleProjectManageClick(project.id)
                              }
                              sx={{
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                color: '#1a1a1a',
                                '&:hover': {
                                  color: '#FBBF24',
                                  textDecoration: 'underline'
                                },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {project.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                sx={{
                                  fontSize: '0.875rem',
                                  color: isOverdue
                                    ? '#EF4444'
                                    : isUrgent
                                      ? '#EF4444'
                                      : '#4b5563',
                                  fontWeight: isOverdue || isUrgent ? 600 : 400,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5
                                }}>
                                {dayjs(project.endDate).format(
                                  'YYYY년 M월 D일'
                                )}
                                <Typography
                                  component="span"
                                  sx={{
                                    fontSize: '0.938rem',
                                    color: isOverdue
                                      ? '#EF4444'
                                      : isUrgent
                                        ? '#EF4444'
                                        : '#B45309',
                                    fontWeight: 600
                                  }}>
                                  ({isOverdue ? 'D+' : 'D-'}
                                  {Math.abs(daysUntilEnd)})
                                </Typography>
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<LayoutDashboard size={14} />}
                                onClick={() => handleProjectClick(project.id)}
                                sx={{
                                  color: '#1E293B',
                                  bgcolor: 'white',
                                  border: '1px solid #E2E8F0',
                                  '&:hover': {
                                    bgcolor: '#FFF8E6'
                                  },
                                  fontSize: '0.875rem',
                                  py: 0.5,
                                  px: 1.5
                                }}>
                                대시보드
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            {/* 최근 활동이 많은 프로젝트 */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                bgcolor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3
                }}>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#1a1a1a'
                  }}>
                  최근 활동이 많은 프로젝트
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleViewMoreProjects}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    borderColor: '#e5e7eb',
                    color: '#666',
                    '&:hover': {
                      borderColor: '#666',
                      bgcolor: 'transparent'
                    }
                  }}>
                  더보기
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1a1a1a',
                          borderBottom: '2px solid #e5e7eb'
                        }}>
                        프로젝트
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1a1a1a',
                          borderBottom: '2px solid #e5e7eb'
                        }}>
                        승인요청
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1a1a1a',
                          borderBottom: '2px solid #e5e7eb'
                        }}>
                        질문
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1a1a1a',
                          borderBottom: '2px solid #e5e7eb'
                        }}>
                        마지막 활동
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1a1a1a',
                          borderBottom: '2px solid #e5e7eb'
                        }}>
                        대시보드
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingActiveProjects ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center">
                          <LoadingSpinner />
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeProjects.slice(0, 3).map(project => (
                        <TableRow
                          key={project.id}
                          hover>
                          <TableCell sx={{ maxWidth: '250px' }}>
                            <Typography
                              onClick={() =>
                                handleProjectManageClick(project.id)
                              }
                              sx={{
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                color: '#1a1a1a',
                                '&:hover': {
                                  color: '#FBBF24',
                                  textDecoration: 'underline'
                                },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                              {project.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                fontSize: '0.813rem',
                                color: theme.palette.success.main,
                                fontWeight: 500
                              }}>
                              {project.weeklyRequestCount}건
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                fontSize: '0.813rem',
                                color: theme.palette.success.main,
                                fontWeight: 500
                              }}>
                              {project.weeklyArticleCount}건
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontSize: '0.875rem',
                                color: '#4b5563'
                              }}>
                              {project.recentActivityDate
                                ? dayjs(project.recentActivityDate).format(
                                    'YYYY년 M월 D일'
                                  )
                                : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<LayoutDashboard size={14} />}
                              onClick={() => handleProjectClick(project.id)}
                              sx={{
                                color: '#1E293B',
                                bgcolor: 'white',
                                border: '1px solid #E2E8F0',
                                '&:hover': {
                                  bgcolor: '#FFF8E6'
                                },
                                fontSize: '0.875rem',
                                py: 0.5,
                                px: 1.5
                              }}>
                              대시보드
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>

        {/* 프로젝트 생성 추이 그래프 */}
        <Grid
          container
          spacing={3}
          sx={{ mt: 2 }}>
          <Grid
            item
            xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                bgcolor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  mb: 2
                }}>
                프로젝트 생성 추이
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                  flexWrap: 'wrap'
                }}>
                <DatePicker
                  label="시작일"
                  value={trendStartDate}
                  onChange={v => v && setTrendStartDate(v)}
                  format="YYYY-MM-DD"
                  sx={{
                    minWidth: 110,
                    '& .MuiInputBase-root': {
                      fontSize: '0.95rem',
                      py: 0.5,
                      height: 36
                    }
                  }}
                />
                <DatePicker
                  label="종료일"
                  value={trendEndDate}
                  onChange={v => v && setTrendEndDate(v)}
                  format="YYYY-MM-DD"
                  sx={{
                    minWidth: 110,
                    '& .MuiInputBase-root': {
                      fontSize: '0.95rem',
                      py: 0.5,
                      height: 36
                    }
                  }}
                />
                <Button
                  variant={trendTimeUnit === 'DAY' ? 'contained' : 'outlined'}
                  onClick={() => setTrendTimeUnit('DAY')}
                  sx={{ minWidth: 80 }}>
                  일간
                </Button>
                <Button
                  variant={trendTimeUnit === 'WEEK' ? 'contained' : 'outlined'}
                  onClick={() => setTrendTimeUnit('WEEK')}
                  sx={{ minWidth: 80 }}>
                  주간
                </Button>
                <Button
                  variant={trendTimeUnit === 'MONTH' ? 'contained' : 'outlined'}
                  onClick={() => setTrendTimeUnit('MONTH')}
                  sx={{ minWidth: 80 }}>
                  월간
                </Button>
                <Button
                  variant="contained"
                  onClick={handleTrendSearch}
                  sx={{ ml: 2 }}>
                  조회
                </Button>
              </Box>
              <ProjectCreationTrendChart
                key={trendKey}
                startDate={trendStartDate.format('YYYY-MM-DD')}
                endDate={trendEndDate.format('YYYY-MM-DD')}
                timeUnit={trendTimeUnit}
              />
            </Paper>
          </Grid>
        </Grid>
      

      {/* 회사 섹션 */}
      <Box>
        {/* 회사 생성 추이 */}
        <Grid
          container
          spacing={3}
          sx={{ mt: 2 }}>
          <Grid
            item
            xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                bgcolor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  mb: 2
                }}>
                회사 등록 추이
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                  flexWrap: 'wrap'
                }}>
                <DatePicker
                  label="시작일"
                  value={companyTrendStartDate}
                  onChange={v => v && setCompanyTrendStartDate(v)}
                  format="YYYY-MM-DD"
                  sx={{
                    minWidth: 110,
                    '& .MuiInputBase-root': {
                      fontSize: '0.95rem',
                      py: 0.5,
                      height: 36
                    }
                  }}
                />
                <DatePicker
                  label="종료일"
                  value={companyTrendEndDate}
                  onChange={v => v && setCompanyTrendEndDate(v)}
                  format="YYYY-MM-DD"
                  sx={{
                    minWidth: 110,
                    '& .MuiInputBase-root': {
                      fontSize: '0.95rem',
                      py: 0.5,
                      height: 36
                    }
                  }}
                />
                <Button
                  variant={
                    companyTrendUnit === 'DAY' ? 'contained' : 'outlined'
                  }
                  onClick={() => setCompanyTrendUnit('DAY')}
                  sx={{ minWidth: 80 }}>
                  일간
                </Button>
                <Button
                  variant={
                    companyTrendUnit === 'WEEK' ? 'contained' : 'outlined'
                  }
                  onClick={() => setCompanyTrendUnit('WEEK')}
                  sx={{ minWidth: 80 }}>
                  주간
                </Button>
                <Button
                  variant={
                    companyTrendUnit === 'MONTH' ? 'contained' : 'outlined'
                  }
                  onClick={() => setCompanyTrendUnit('MONTH')}
                  sx={{ minWidth: 80 }}>
                  월간
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCompanyTrendSearch}
                  sx={{ ml: 2 }}>
                  조회
                </Button>
              </Box>
              <CompanyCreationTrendChart
                key={companyTrendKey}
                startDate={companyTrendStartDate.format('YYYY-MM-DD')}
                endDate={companyTrendEndDate.format('YYYY-MM-DD')}
                unit={companyTrendUnit}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
