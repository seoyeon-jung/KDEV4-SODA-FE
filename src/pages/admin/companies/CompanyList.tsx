import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  InputAdornment
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, RotateCcw, Search } from 'lucide-react'
import { useToast } from '../../../contexts/ToastContext'
import type { CompanyListItem } from '../../../types/api'
import DataTable from '../../../components/common/DataTable'
import { companyService } from '../../../services/companyService'

// DataTable 컴포넌트가 사용하는 Column 타입 정의 (이미 존재한다면 중복 정의 불필요)
interface Column<T> {
  id: string
  label: string
  render: (row: T) => React.ReactNode
  onClick?: (row: T) => void
}

// API 응답의 data 부분 타입을 명시적으로 정의
// getCompanyList가 CompanyListItem[] | null 또는 undefined를 반환한다고 가정
//interface CompanyListResponse extends ApiResponse<CompanyListItem[] | null> {}

const CompanyList: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [deletedCompanies, setDeletedCompanies] = useState<CompanyListItem[]>(
    []
  )
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentTab, setCurrentTab] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchCompanies()
  }, [currentTab, page, rowsPerPage, searchKeyword])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const view = currentTab === 0 ? 'ACTIVE' : 'DELETED'
      const response = await companyService.getAllCompanies({
        view,
        searchKeyword: searchKeyword.trim() || undefined,
        page,
        size: rowsPerPage
      })

      if (response?.status === 'success' && (response.data as any).content) {
        const companiesList = (response.data as any).content
        if (currentTab === 0) {
          setCompanies(companiesList)
        } else {
          setDeletedCompanies(companiesList)
        }
        // 페이지네이션 정보 설정
        const pageInfo = (response.data as any).page
        setTotalElements(pageInfo.totalElements)
        setTotalPages(pageInfo.totalPages)
      } else {
        console.error('회사 목록 API 응답 형식이 올바르지 않습니다:', response)
        showToast('회사 목록 데이터 형식이 올바르지 않습니다.', 'error')
        if (currentTab === 0) {
          setCompanies([])
        } else {
          setDeletedCompanies([])
        }
        setTotalElements(0)
        setTotalPages(0)
      }
    } catch (err) {
      console.error('회사 목록 조회 중 오류:', err)
      const errorMsg =
        err instanceof Error ? err.message : '알 수 없는 오류 발생'
      showToast(`회사 목록 조회 중 오류: ${errorMsg}`, 'error')
      if (currentTab === 0) {
        setCompanies([])
      } else {
        setDeletedCompanies([])
      }
      setTotalElements(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value)
    setPage(0) // 검색어가 변경되면 첫 페이지로 이동
  }

  const handleRowClick = (row: CompanyListItem) => {
    navigate(`/admin/companies/${row.id}`)
  }

  const handleRestore = async (companyId: number) => {
    try {
      await companyService.restoreCompany(companyId)
      showToast('회사가 복구되었습니다.', 'success')
      fetchCompanies() // 목록 새로고침
    } catch (err) {
      showToast('회사 복구에 실패했습니다.', 'error')
    }
  }

  const columns: Column<CompanyListItem>[] = [
    {
      id: 'name',
      label: '회사명',
      render: row => row.name,
      onClick: handleRowClick
    },
    {
      id: 'phoneNumber',
      label: '전화번호',
      render: row => row.phoneNumber || '-'
    },
    {
      id: 'companyNumber',
      label: '사업자번호',
      render: row => row.companyNumber || '-'
    },
    {
      id: 'address',
      label: '주소',
      render: row => row.address || '-'
    }
  ]

  const deletedColumns: Column<CompanyListItem>[] = [
    {
      id: 'name',
      label: '회사명',
      render: row => row.name
    },
    {
      id: 'phoneNumber',
      label: '전화번호',
      render: row => row.phoneNumber || '-'
    },
    {
      id: 'companyNumber',
      label: '사업자번호',
      render: row => row.companyNumber || '-'
    },
    {
      id: 'address',
      label: '주소',
      render: row => row.address || '-'
    },
    {
      id: 'actions',
      label: '작업',
      render: row => (
        <Button
          startIcon={<RotateCcw size={16} />}
          onClick={e => {
            e.stopPropagation()
            handleRestore(row.id)
          }}
          color="primary"
          size="small">
          복구
        </Button>
      )
    }
  ]

  const currentPageData =
    currentTab === 0
      ? companies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : deletedCompanies.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        )

  if (loading && companies.length === 0 && deletedCompanies.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh'
        }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 'bold' }}>
          회사 관리
        </Typography>
        {currentTab === 0 && (
          <Button
            variant="contained"
            startIcon={<PlusCircle size={18} />}
            onClick={() => navigate('/admin/companies/create')}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              color: 'white'
            }}>
            새 회사 등록
          </Button>
        )}
      </Box>

      <Tabs
        value={currentTab}
        onChange={(_, newValue) => setCurrentTab(newValue)}
        sx={{ mb: 3 }}>
        <Tab label="회사 목록" />
        <Tab label="삭제된 회사" />
      </Tabs>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="회사명으로 검색"
          value={searchKeyword}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            )
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      <DataTable<CompanyListItem>
        columns={currentTab === 0 ? columns : deletedColumns}
        data={currentTab === 0 ? companies : deletedCompanies}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalElements}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        loading={loading}
        onRowClick={handleRowClick}
      />
    </Box>
  )
}

export default CompanyList
