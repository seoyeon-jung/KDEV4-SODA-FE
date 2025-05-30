import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Typography,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Popover
} from '@mui/material'
import { Search, Add, ArrowDropDown } from '@mui/icons-material'
import { client } from '../../api/client'
import dayjs from 'dayjs'
import { useUserStore } from '../../stores/userStore'

interface Request {
  requestId: number
  stageId: number
  memberId: number
  memberName: string
  title: string
  content: string
  links: {
    id: number
    urlAddress: string
    urlDescription: string
  }[]
  files: any[]
  status: string
  createdAt: string
  updatedAt: string
  parentId?: number
}

interface RequestGroup {
  parent: Request
  children: Request[]
}

interface Stage {
  id: number
  name: string
}

interface PaymentManagementProps {
  projectId: number
  stages: Stage[]
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({
  projectId,
  stages
}) => {
  const navigate = useNavigate()
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [requestGroups, setRequestGroups] = useState<RequestGroup[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalRequests, setTotalRequests] = useState(0)
  const [stageRequests, setStageRequests] = useState<{ [key: number]: number }>(
    {}
  )
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const { user } = useUserStore()
  const [isClientMember, setIsClientMember] = useState(false)
  const [anchorElStatus, setAnchorElStatus] =
    useState<HTMLButtonElement | null>(null)

  const memoStages = useMemo(() => stages, [stages])

  const fetchRequestCounts = async () => {
    try {
      const totalQueryParams = new URLSearchParams({
        page: '0',
        size: '100'
      })
      if (selectedStatus !== 'ALL') {
        totalQueryParams.append('status', selectedStatus)
      }

      const stagePromises = memoStages.map(stage => {
        const stageQueryParams = new URLSearchParams({
          stageId: stage.id.toString(),
          page: '0',
          size: '100'
        })
        if (selectedStatus !== 'ALL') {
          stageQueryParams.append('status', selectedStatus)
        }
        return client.get(
          `/projects/${projectId}/requests?${stageQueryParams.toString()}`
        )
      })

      const [totalResponse, ...stageResponses] = await Promise.all([
        client.get(
          `/projects/${projectId}/requests?${totalQueryParams.toString()}`
        ),
        ...stagePromises
      ])

      if (totalResponse.data.status === 'success' && totalResponse.data.data) {
        setTotalRequests(totalResponse.data.data.page.totalElements)
      }

      const stageCounts: { [key: number]: number } = {}
      stageResponses.forEach((response, index) => {
        if (response.data.status === 'success' && response.data.data) {
          // 모든 요청(부모/자식 포함) 카운트
          stageCounts[memoStages[index].id] = response.data.data.content.length
        }
      })
      setStageRequests(stageCounts)
    } catch (error) {
      console.error('Failed to fetch request counts:', error)
    }
  }

  const fetchCurrentPageRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: '5'
      })

      if (selectedStatus !== 'ALL') {
        queryParams.append('status', selectedStatus)
      }

      if (selectedStage) {
        queryParams.append('stageId', selectedStage.toString())
      }

      if (searchTerm.trim()) {
        queryParams.append('keyword', searchTerm.trim())
      }

      const response = await client.get(
        `/projects/${projectId}/requests?${queryParams.toString()}`
      )

      if (response.data.status === 'success' && response.data.data) {
        const currentPageRequests = response.data.data.content
        setRequestGroups(
          currentPageRequests.map((request: Request) => ({
            parent: request,
            children: []
          }))
        )
        setTotalPages(response.data.data.page.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      setError('요청 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequestCounts()
  }, [projectId, selectedStatus])

  useEffect(() => {
    fetchCurrentPageRequests()
  }, [projectId, selectedStage, page, selectedStatus, searchTerm])

  useEffect(() => {
    const fetchClientMembers = async () => {
      if (!projectId || !user) return
      try {
        const res = await client.get(`/projects/${projectId}/members`, {
          params: { companyRole: 'CLIENT_COMPANY' }
        })
        if (res.data.status === 'success') {
          const members = res.data.data.content
          const found = members.some((m: any) => m.memberId === user.memberId)
          setIsClientMember(found)
        }
      } catch (e) {
        setIsClientMember(false)
      }
    }
    fetchClientMembers()
  }, [projectId, user])

  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedStatus(event.target.value)
    setPage(0) // 상태가 변경되면 첫 페이지로 이동
  }

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1) // UI는 1부터, 내부는 0부터 시작
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: '#16a34a', bgColor: '#dcfce7' }
      case 'REJECTED':
        return { color: '#dc2626', bgColor: '#fee2e2' }
      case 'PENDING':
        return { color: '#4b5563', bgColor: '#f3f4f6' }
      case 'APPROVING':
        return { color: '#2563eb', bgColor: '#dbeafe' }
      default:
        return { color: '#4b5563', bgColor: '#f3f4f6' }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '승인'
      case 'REJECTED':
        return '거절'
      case 'PENDING':
        return '대기'
      case 'APPROVING':
        return '승인중'
      default:
        return status
    }
  }

  const handleSearch = () => {
    setPage(0)
    fetchCurrentPageRequests()
  }

  const handleStatusClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElStatus(event.currentTarget)
  }

  const handleStatusClose = () => {
    setAnchorElStatus(null)
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          mb: 4,
          mt: 2,
          width: '100%',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            height: '6px',
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'transparent',
            borderRadius: '3px'
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }
        }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            minWidth: 'min-content',
            px: 1,
            py: 1
          }}>
          <Paper
            onClick={() => setSelectedStage(null)}
            sx={{
              p: 2,
              width: 150,
              cursor: 'pointer',
              bgcolor: 'white',
              color: '#666',
              border: '1px solid',
              borderColor: selectedStage === null ? '#FFB800' : '#E0E0E0',
              boxShadow: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: '#FFB800'
              }
            }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                mb: 1,
                color: selectedStage === null ? '#FFB800' : '#666'
              }}>
              전체
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666'
              }}>
              {totalRequests}건
            </Typography>
          </Paper>
          {memoStages.map(stage => (
            <Paper
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              sx={{
                p: 2,
                width: 150,
                cursor: 'pointer',
                bgcolor: 'white',
                color: '#666',
                border: '1px solid',
                borderColor: selectedStage === stage.id ? '#FFB800' : '#E0E0E0',
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#FFB800'
                }
              }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  mb: 1,
                  color: selectedStage === stage.id ? '#FFB800' : '#666'
                }}>
                {stage.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#666'
                }}>
                {stageRequests[stage.id] || 0}건
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          sx={{ flex: 1 }}
        />

        <Button
          variant="contained"
          onClick={handleSearch}
          size="small">
          검색
        </Button>

        {!isClientMember && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              navigate(`/user/projects/${projectId}/requests/create`)
            }
            sx={{
              bgcolor: '#FFB800',
              '&:hover': {
                bgcolor: '#FFB800',
                opacity: 0.8
              }
            }}>
            새로운 요청 추가
          </Button>
        )}
      </Box>

      {error && (
        <Typography
          color="error"
          sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 'none',
          borderRadius: '8px',
          border: '1px solid #E0E0E0',
          overflow: 'hidden'
        }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>단계</TableCell>

              <TableCell>제목</TableCell>
              <TableCell
                align="center"
                sx={{ width: '100px', cursor: 'pointer' }}>
                <Button
                  onClick={handleStatusClick}
                  endIcon={<ArrowDropDown />}
                  sx={{ color: 'inherit', textTransform: 'none' }}>
                  {selectedStatus === 'ALL'
                    ? '상태'
                    : getStatusText(selectedStatus)}
                </Button>
                <Popover
                  open={Boolean(anchorElStatus)}
                  anchorEl={anchorElStatus}
                  onClose={handleStatusClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                  }}>
                  <MenuItem
                    onClick={() => {
                      setSelectedStatus('ALL')
                      setPage(0)
                      handleStatusClose()
                    }}>
                    전체
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setSelectedStatus('PENDING')
                      setPage(0)
                      handleStatusClose()
                    }}>
                    대기중
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setSelectedStatus('APPROVED')
                      setPage(0)
                      handleStatusClose()
                    }}>
                    승인됨
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setSelectedStatus('REJECTED')
                      setPage(0)
                      handleStatusClose()
                    }}>
                    거절됨
                  </MenuItem>
                </Popover>
              </TableCell>
              <TableCell>작성자</TableCell>
              <TableCell>작성일</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : requestGroups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center">
                  승인 대기 중인 요청이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              requestGroups.map(group => (
                <React.Fragment key={group.parent.requestId}>
                  <TableRow
                    hover
                    onClick={() =>
                      navigate(
                        `/user/projects/${projectId}/requests/${group.parent.requestId}`
                      )
                    }
                    sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      {
                        memoStages.find(s => s.id === group.parent.stageId)
                          ?.name
                      }
                    </TableCell>
                    <TableCell>
                      {group.parent.parentId !== -1 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="body2"
                            sx={{ color: '#666', mr: 1 }}>
                            └
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#666' }}>
                            {group.parent.title}
                          </Typography>
                        </Box>
                      ) : (
                        group.parent.title
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          color: getStatusColor(group.parent.status).color,
                          bgcolor: getStatusColor(group.parent.status).bgColor,
                          fontWeight: 600
                        }}>
                        {getStatusText(group.parent.status)}
                      </Box>
                    </TableCell>
                    <TableCell>{group.parent.memberName}</TableCell>
                    <TableCell>
                      {dayjs(group.parent.createdAt).format('YYYY-MM-DD')}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page + 1} // UI는 1부터 시작
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  )
}

export default PaymentManagement
