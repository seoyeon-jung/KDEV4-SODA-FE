import React, { useEffect, useState } from 'react'
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
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid
} from '@mui/material'
import { Database } from 'lucide-react'
import { logService } from '../../services/logService'
import type { Log } from '../../types/log'
import { formatDate } from '../../utils/dateUtils'

interface DiffValue {
  before: any;
  after: any;
}

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? '예' : '아니오'
  if (Array.isArray(value)) {
    if (value.length === 0) return '없음'
    return value.map(item => formatValue(item)).join(', ')
  }
  if (typeof value === 'object') {
    if (Object.keys(value).length === 0) return '없음'
    return JSON.stringify(value, null, 2)
  }
  return value.toString()
}

const formatFieldName = (name: string): string => {
  const fieldNames: { [key: string]: string } = {
    title: '제목',
    content: '내용',
    priority: '우선순위',
    memberName: '작성자',
    stageName: '단계',
    fileList: '파일 목록',
    linkList: '링크 목록',
    parentArticleId: '부모 게시글 ID',
    deadLine: '마감일',
    urlAddress: 'URL 주소',
    urlDescription: 'URL 설명'
  }
  return fieldNames[name] || name
}

const formatStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'PENDING': '대기중',
    'APPROVED': '승인됨',
    'REJECTED': '거절됨'
  }
  return statusMap[status] || status
}

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error)
    return '-'
  }
}

const formatLinks = (links: any[] | null | undefined): string => {
  if (!links || !Array.isArray(links) || links.length === 0) return '없음'
  return links.map(link => `- ${link.urlDescription}: ${link.urlAddress}`).join('\n')
}

const formatFiles = (files: any[]): string => {
  if (!files || files.length === 0) return '없음'
  return files.map(file => `- ${file.name}`).join('\n')
}

const formatRequestData = (data: any): JSX.Element => {
  const groupData = (entries: [string, any][]) => {
    const groups: { [key: string]: string[] } = {
      ids: [],      // ID 관련 정보
      status: [],   // 상태 정보
      content: [],  // 내용 정보
      links: [],    // 링크 관련
      files: [],    // 파일 관련
      dates: []     // 날짜 관련
    }

    entries.forEach(([key, value]) => {
      const fieldName = formatFieldName(key)
      let formattedValue = ''

      if (typeof value === 'object' && value !== null && 'before' in value && 'after' in value) {
        const diffValue = value as DiffValue
        if (key === 'status') {
          formattedValue = `${fieldName}: ${formatStatus(diffValue.before as string)} → ${formatStatus(diffValue.after as string)}`
        } else if (key === 'createdAt' || key === 'updatedAt') {
          formattedValue = `${fieldName}: ${formatDateTime(diffValue.before as string)} → ${formatDateTime(diffValue.after as string)}`
        } else if (key === 'links') {
          formattedValue = `${fieldName}:\n  변경 전:\n    ${formatLinks(diffValue.before as any[]).replace(/\n/g, '\n    ')}\n  변경 후:\n    ${formatLinks(diffValue.after as any[]).replace(/\n/g, '\n    ')}`
        } else if (key === 'files') {
          formattedValue = `${fieldName}:\n  변경 전:\n    ${formatFiles(diffValue.before as any[]).replace(/\n/g, '\n    ')}\n  변경 후:\n    ${formatFiles(diffValue.after as any[]).replace(/\n/g, '\n    ')}`
        } else if (typeof diffValue.before === 'object' && diffValue.before !== null) {
          const beforeValue = 'id' in diffValue.before ? diffValue.before.id : 
                            'name' in diffValue.before ? diffValue.before.name : 
                            'title' in diffValue.before ? diffValue.before.title : 
                            'content' in diffValue.before ? diffValue.before.content : 
                            JSON.stringify(diffValue.before)
          const afterValue = 'id' in diffValue.after ? diffValue.after.id : 
                           'name' in diffValue.after ? diffValue.after.name : 
                           'title' in diffValue.after ? diffValue.after.title : 
                           'content' in diffValue.after ? diffValue.after.content : 
                           JSON.stringify(diffValue.after)
          formattedValue = `${fieldName}: ${beforeValue} → ${afterValue}`
        } else {
          formattedValue = `${fieldName}: ${diffValue.before} → ${diffValue.after}`
        }
      } else {
        if (key === 'status') {
          formattedValue = `${fieldName}: ${formatStatus(value as string)}`
        } else if (key === 'createdAt' || key === 'updatedAt') {
          formattedValue = `${fieldName}: ${formatDateTime(value as string)}`
        } else if (key === 'links') {
          formattedValue = `${fieldName}:\n    ${formatLinks(value as any[]).replace(/\n/g, '\n    ')}`
        } else if (key === 'files') {
          formattedValue = `${fieldName}:\n    ${formatFiles(value as any[]).replace(/\n/g, '\n    ')}`
        } else if (typeof value === 'object' && value !== null) {
          if ('id' in value) formattedValue = `${fieldName}: ${value.id}`
          else if ('name' in value) formattedValue = `${fieldName}: ${value.name}`
          else if ('title' in value) formattedValue = `${fieldName}: ${value.title}`
          else if ('content' in value) formattedValue = `${fieldName}: ${value.content}`
          else formattedValue = `${fieldName}: ${JSON.stringify(value)}`
        } else {
          formattedValue = `${fieldName}: ${value}`
        }
      }

      // 데이터 분류
      if (key.toLowerCase().includes('id')) {
        groups.ids.push(formattedValue)
      } else if (key === 'status') {
        groups.status.push(formattedValue)
      } else if (key === 'links') {
        groups.links.push(formattedValue)
      } else if (key === 'files') {
        groups.files.push(formattedValue)
      } else if (key === 'createdAt' || key === 'updatedAt') {
        groups.dates.push(formattedValue)
      } else {
        // ID, status, links, files, dates를 제외한 모든 정보는 내용 정보로 분류
        groups.content.push(formattedValue)
      }
    })

    return (
      <Box>
        {groups.ids.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ID 정보:
            </Typography>
            <Box ml={4}>
              {groups.ids.map((value, index) => (
                <Typography key={index} variant="body2" gutterBottom>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {groups.status.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              상태 정보:
            </Typography>
            <Box ml={4}>
              {groups.status.map((value, index) => (
                <Typography key={index} variant="body2" gutterBottom>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {groups.content.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              내용 정보:
            </Typography>
            <Box ml={4}>
              {groups.content.map((value, index) => (
                <Typography key={index} variant="body2" gutterBottom>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {groups.links.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              링크 정보:
            </Typography>
            <Box ml={4}>
              {groups.links.map((value, index) => (
                <Typography key={index} variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', ml: 2 }}>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {groups.files.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              파일 정보:
            </Typography>
            <Box ml={4}>
              {groups.files.map((value, index) => (
                <Typography key={index} variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', ml: 2 }}>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {groups.dates.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              시간 정보:
            </Typography>
            <Box ml={4}>
              {groups.dates.map((value, index) => (
                <Typography key={index} variant="body2" gutterBottom>
                  {value}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    )
  }

  if (data.diff) {
    return groupData(Object.entries(data.diff))
  }
  return groupData(Object.entries(data))
}

const DataManagement: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [entityName, setEntityName] = useState<string>('')
  const [action, setAction] = useState<string>('')
  const [fromDate, setFromDate] = useState<string>('2024-01-01')
  const [toDate, setToDate] = useState<string>(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  const fetchLogs = async () => {
    try {
      const response = await logService.getLogs({
        page: page - 1,
        size: 10,
        entityName: entityName || undefined,
        action: action || undefined,
        from: fromDate ? `${fromDate}T00:00:00` : undefined,
        to: toDate ? `${toDate}T23:59:59` : undefined
      })
      setLogs(response.content)
      setTotalPages(Math.max(1, Math.ceil(response.totalElements / 10)))
    } catch (error) {
      console.error('로그 데이터를 불러오는데 실패했습니다:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, entityName, action, fromDate, toDate])

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Database size={24} style={{ marginRight: '8px' }} />
        <Typography variant="h5" component="h1">
          데이터 관리
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={3}>
          <FormControl fullWidth size="small">
            <InputLabel shrink>데이터 종류</InputLabel>
            <Select
              value={entityName}
              label="데이터 종류"
              onChange={(e) => {
                setEntityName(e.target.value)
                setPage(1)
              }}
              displayEmpty
              notched
              sx={{
                '& .MuiSelect-select': {
                  backgroundColor: 'white'
                }
              }}
            >
              <MenuItem value="">데이터 종류 전체</MenuItem>
              <MenuItem value="Article">게시글</MenuItem>
              <MenuItem value="Project">프로젝트</MenuItem>
              <MenuItem value="Company">회사</MenuItem>
              <MenuItem value="Stage">단계</MenuItem>
              <MenuItem value="Request">승인요청</MenuItem>
              <MenuItem value="Response">응답</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth size="small">
            <InputLabel shrink>액션</InputLabel>
            <Select
              value={action}
              label="액션"
              onChange={(e) => {
                setAction(e.target.value)
                setPage(1)
              }}
              displayEmpty
              notched
              sx={{
                '& .MuiSelect-select': {
                  backgroundColor: 'white'
                }
              }}
            >
              <MenuItem value="">액션 전체</MenuItem>
              <MenuItem value="CREATE">생성</MenuItem>
              <MenuItem value="UPDATE">수정</MenuItem>
              <MenuItem value="DELETE">삭제</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="시작일"
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value)
              setPage(1)
            }}
            sx={{
              '& .MuiInputBase-input': {
                backgroundColor: 'white'
              }
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="종료일"
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value)
              setPage(1)
            }}
            sx={{
              '& .MuiInputBase-input': {
                backgroundColor: 'white'
              }
            }}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>시간</TableCell>
              <TableCell>데이터 종류</TableCell>
              <TableCell>액션</TableCell>
              <TableCell>작업자</TableCell>
              <TableCell>
                {action === 'CREATE' ? '생성된 데이터' :
                 action === 'UPDATE' ? '변경된 데이터' :
                 action === 'DELETE' ? '삭제된 데이터' : '변경 내용'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.timestamp)}</TableCell>
                <TableCell>{log.entityName}</TableCell>
                <TableCell>
                  {log.action === 'CREATE' ? '생성' :
                   log.action === 'UPDATE' ? '수정' :
                   log.action === 'DELETE' ? '삭제' : log.action}
                </TableCell>
                <TableCell>{log.operator}</TableCell>
                <TableCell>
                  {log.action === 'CREATE' && log.afterData && (
                    <Box sx={{ whiteSpace: 'pre-line' }}>
                      {formatRequestData(log.afterData)}
                    </Box>
                  )}
                  {log.action === 'UPDATE' && log.diff && (
                    <Box sx={{ whiteSpace: 'pre-line' }}>
                      {formatRequestData({ diff: log.diff })}
                    </Box>
                  )}
                  {log.action === 'DELETE' && log.beforeData && (
                    <Box sx={{ whiteSpace: 'pre-line' }}>
                      {formatRequestData(log.beforeData)}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  )
}

export default DataManagement 