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

export default function AdminMain() {
  const navigate = useNavigate()
  const { projects, isLoading, error, fetchAllProjects } = useProjectStore()
  const theme = useTheme()
  const [totalCompanies, setTotalCompanies] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      await fetchAllProjects()
      await fetchCompanies()
    }
    fetchData()
  }, [fetchAllProjects])

  const fetchCompanies = async () => {
    try {
      const companies = await companyService.getAllCompanies()
      setTotalCompanies(companies.length)
    } catch (error) {
      console.error('회사 목록을 불러오는데 실패했습니다:', error)
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 1400, mx: 'auto', py: 4 }}>
      {/* 프로젝트 섹션 */}
      <Box>
        <Typography variant="h5" sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a', mb: 3 }}>
          프로젝트 현황
        </Typography>

        {/* 프로젝트 현황 카드 */}
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Card sx={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent>
                <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mb: 1 }}>
                  계약 전 프로젝트 (더미데이터)
                </Typography>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 700, color: theme.palette.primary.main }}>
                  3
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent>
                <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mb: 1 }}>
                  개발 중인 프로젝트 (더미데이터)
                </Typography>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 700, color: theme.palette.primary.main }}>
                  5
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent>
                <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mb: 1 }}>
                  하자보수 중인 프로젝트 (더미데이터)
                </Typography>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 700, color: theme.palette.info.main }}>
                  2
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 프로젝트 생성 추이 */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
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
                  mb: 3
                }}>
                최근 3개월간 프로젝트 생성 추이 (더미데이터)
              </Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
                {/* 그래프 영역 */}
                <Box sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                  {/* 가로 그리드 라인 */}
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <Box
                      key={num}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: `${(num / 5) * 100}%`,
                        borderBottom: '1px dashed',
                        borderColor: 'divider',
                        zIndex: 0
                      }}
                    />
                  ))}

                  {/* 막대 그래프 */}
                  {[
                    { week: '1월1주', count: 2 },
                    { week: '1월2주', count: 3 },
                    { week: '1월3주', count: 2 },
                    { week: '1월4주', count: 4 },
                    { week: '2월1주', count: 3 },
                    { week: '2월2주', count: 5 },
                    { week: '2월3주', count: 4 },
                    { week: '2월4주', count: 3 },
                    { week: '3월1주', count: 4 },
                    { week: '3월2주', count: 3 },
                    { week: '3월3주', count: 2 },
                    { week: '3월4주', count: 3 }
                  ].map((data, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        flex: 1,
                        mx: 1.5,
                        height: `${(data.count / 5) * 100}%`,
                        bgcolor: '#94a3b8',
                        borderRadius: '2px 2px 0 0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#64748b',
                          transform: 'translateY(-4px)',
                          '& .count-tooltip': {
                            opacity: 1,
                            visibility: 'visible'
                          }
                        }
                      }}>
                      <Box
                        className="count-tooltip"
                        sx={{
                          position: 'absolute',
                          top: -25,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: 'rgba(0, 0, 0, 0.8)',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          opacity: 0,
                          visibility: 'hidden',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}>
                        {data.count}개
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* X축 */}
                <Box sx={{ height: 60, display: 'flex', alignItems: 'flex-start', mt: 2 }}>
                  <Box sx={{ flex: 1, display: 'flex' }}>
                    {['1월1주', '1월2주', '1월3주', '1월4주', '2월1주', '2월2주', '2월3주', '2월4주', '3월1주', '3월2주', '3월3주', '3월4주'].map(
                      (week, index) => (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            textAlign: 'center',
                            position: 'relative',
                            px: 1.5
                          }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              whiteSpace: 'nowrap',
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: '0.75rem'
                            }}>
                            {week}
                          </Typography>
                        </Box>
                      )
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* 프로젝트 목록 */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* 진행중인 프로젝트 */}
          <Grid item xs={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                bgcolor: '#fff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#1a1a1a'
          }}>
          진행중인 프로젝트
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
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', borderBottom: '2px solid #e5e7eb' }}>프로젝트명</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', borderBottom: '2px solid #e5e7eb' }}>개발사</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', borderBottom: '2px solid #e5e7eb' }}>고객사</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', borderBottom: '2px solid #e5e7eb' }}>상태</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', borderBottom: '2px solid #e5e7eb' }}>대시보드 바로가기</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                    {projects
                      .slice(0, 3)
                      .map(project => (
                      <TableRow key={project.id} hover>
                  <TableCell>
                    <Typography
                      onClick={() => handleProjectManageClick(project.id)}
                      sx={{
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        color: theme.palette.primary.main,
                        '&:hover': {
                          color: theme.palette.primary.dark,
                          textDecoration: 'underline'
                        }
                      }}>
                      {project.title}
                    </Typography>
                  </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#4b5563' }}>{project.devCompanyName}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#4b5563' }}>{project.clientCompanyName}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              fontSize: '0.813rem',
                              color: '#64748b',
                              fontWeight: 500
                            }}>
                            <Typography
                              sx={{
                                fontSize: '0.813rem',
                                fontWeight: 500,
                                color: project.status === '진행 중' 
                                  ? theme.palette.success.main 
                                  : project.status === '완료' 
                                    ? theme.palette.info.main
                                    : project.status === '중단'
                                      ? theme.palette.error.main
                                      : theme.palette.success.light
                              }}>
                              {project.status || '대기'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<LayoutDashboard size={16} />}
                            onClick={() => handleProjectManageClick(project.id)}
                            sx={{
                              minWidth: 'auto',
                              px: 1.5,
                              py: 0.5,
                              fontSize: '0.75rem',
                              backgroundColor: '#FBBF24',
                              '&:hover': {
                                backgroundColor: '#FCD34D'
                              },
                              color: '#ffffff'
                            }}>
                            대시보드
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* 최근 활동이 많은 프로젝트 */}
          <Grid item xs={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                bgcolor: '#fff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#1a1a1a'
                  }}>
                  최근 활동이 많은 프로젝트 (더미데이터)
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
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', borderBottom: '2px solid #e5e7eb' }}>프로젝트명</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', borderBottom: '2px solid #e5e7eb' }}>승인요청 수</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', borderBottom: '2px solid #e5e7eb' }}>질문 수</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', borderBottom: '2px solid #e5e7eb' }}>마지막 활동</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', borderBottom: '2px solid #e5e7eb' }}>대시보드 바로가기</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { 
                        id: 1,
                        title: '프로젝트 A', 
                        requestCount: 15,
                        questionCount: 9,
                        lastActivity: '2024-03-20',
                        devCompanyName: '개발사 A',
                        clientCompanyName: '고객사 A',
                        status: '진행 중'
                      },
                      { 
                        id: 2,
                        title: '프로젝트 B', 
                        requestCount: 12,
                        questionCount: 6,
                        lastActivity: '2024-03-19',
                        devCompanyName: '개발사 B',
                        clientCompanyName: '고객사 B',
                        status: '진행 중'
                      },
                      { 
                        id: 3,
                        title: '프로젝트 C', 
                        requestCount: 8,
                        questionCount: 7,
                        lastActivity: '2024-03-18',
                        devCompanyName: '개발사 C',
                        clientCompanyName: '고객사 C',
                        status: '진행 중'
                      }
                    ].map((project, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography
                            onClick={() => handleProjectManageClick(project.id)}
                            sx={{
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              color: theme.palette.primary.main,
                              '&:hover': {
                                color: theme.palette.primary.dark,
                                textDecoration: 'underline'
                              }
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
                            {project.requestCount}건
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              fontSize: '0.813rem',
                              color: theme.palette.success.main,
                              fontWeight: 500
                            }}>
                            {project.questionCount}건
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', color: '#4b5563' }}>{project.lastActivity}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<LayoutDashboard size={16} />}
                            onClick={() => handleProjectClick(project.id)}
                            sx={{
                              minWidth: 'auto',
                              px: 1.5,
                              py: 0.5,
                              fontSize: '0.75rem',
                              backgroundColor: '#FBBF24',
                              '&:hover': {
                                backgroundColor: '#FCD34D'
                              },
                              color: '#ffffff'
                            }}>
                            대시보드
                          </Button>
                        </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 회사 섹션 */}
      <Box>
        <Typography variant="h5" sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a', mb: 3 }}>
          회사 현황
        </Typography>

        {/* 회사 현황 카드 */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}>
              <CardContent>
                <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mb: 1 }}>
                  전체 등록된 회사
                </Typography>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 700, color: theme.palette.primary.main }}>
                  {totalCompanies}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 회사 생성 추이 */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
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
                  mb: 3
                }}>
                최근 3개월간 회사 생성 추이 (더미데이터)
              </Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
                {/* 그래프 영역 */}
                <Box sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                  {/* 가로 그리드 라인 */}
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <Box
                      key={num}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: `${(num / 5) * 100}%`,
                        borderBottom: '1px dashed',
            borderColor: 'divider',
                        zIndex: 0
                      }}
                    />
                  ))}

                  {/* 막대 그래프 */}
                  {[
                    { week: '1월1주', count: 1 },
                    { week: '1월2주', count: 2 },
                    { week: '1월3주', count: 1 },
                    { week: '1월4주', count: 2 },
                    { week: '2월1주', count: 3 },
                    { week: '2월2주', count: 2 },
                    { week: '2월3주', count: 3 },
                    { week: '2월4주', count: 2 },
                    { week: '3월1주', count: 1 },
                    { week: '3월2주', count: 1 },
                    { week: '3월3주', count: 2 },
                    { week: '3월4주', count: 1 }
                  ].map((data, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        flex: 1,
                        mx: 1.5,
                        height: `${(data.count / 5) * 100}%`,
                        bgcolor: '#94a3b8',
                        borderRadius: '2px 2px 0 0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#64748b',
                          transform: 'translateY(-4px)',
                          '& .count-tooltip': {
                            opacity: 1,
                            visibility: 'visible'
                          }
                        }
                      }}>
                      <Box
                        className="count-tooltip"
                        sx={{
                          position: 'absolute',
                          top: -25,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: 'rgba(0, 0, 0, 0.8)',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          opacity: 0,
                          visibility: 'hidden',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}>
                        {data.count}개
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* X축 */}
                <Box sx={{ height: 60, display: 'flex', alignItems: 'flex-start', mt: 2 }}>
                  <Box sx={{ flex: 1, display: 'flex' }}>
                    {['1월1주', '1월2주', '1월3주', '1월4주', '2월1주', '2월2주', '2월3주', '2월4주', '3월1주', '3월2주', '3월3주', '3월4주'].map(
                      (week, index) => (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            textAlign: 'center',
                            position: 'relative',
                            px: 1.5
                          }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              whiteSpace: 'nowrap',
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: '0.75rem'
                            }}>
                            {week}
                          </Typography>
                        </Box>
                      )
                    )}
                  </Box>
                </Box>
              </Box>
        </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
