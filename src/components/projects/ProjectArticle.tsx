import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material'
import { Article, ArticleStatus, PriorityType } from '../../types/article'
import { Stage } from '../../types/project'
import { projectService } from '../../services/projectService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { Search, Plus, Link2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ProjectArticleProps {
  projectId: number
  stages: Stage[]
}

const ITEMS_PER_PAGE = 5

const ArticleRow: React.FC<{
  article: Article
  projectId: number
  level?: number
  index?: number
  totalCount?: number
  articles: Article[]
  getPriorityColor: (priority: PriorityType) => {
    color: string
    backgroundColor: string
  }
  getPriorityText: (priority: PriorityType) => string
  getStatusColor: (status: ArticleStatus) => {
    color: string
    backgroundColor: string
  }
  getStatusText: (status: ArticleStatus) => string
}> = ({
  article,
  projectId,
  level = 0,
  index,
  totalCount,
  articles,
  getPriorityColor,
  getPriorityText,
  getStatusColor,
  getStatusText
}) => {
  const navigate = useNavigate()
  const createdAt = new Date(article.createdAt)

  // 부모 게시물이 삭제된 경우
  if (article.deleted && !article.parentArticleId) {
    return (
      <>
        <TableRow
          sx={{
            backgroundColor: level > 0 ? '#f8f9fa' : 'inherit',
            '& > td:first-of-type': {
              paddingLeft: level * 3 + 2 + 'rem'
            }
          }}>
          <TableCell
            colSpan={6}
            align="center">
            <Typography color="text.secondary">삭제된 게시물입니다</Typography>
          </TableCell>
        </TableRow>
        {article.children &&
          article.children.length > 0 &&
          article.children
            .filter((child: any) => !child.deleted) // 삭제된 답글은 표시하지 않음
            .map((child: any) => (
              <ArticleRow
                key={child.id}
                article={child}
                projectId={projectId}
                level={level + 1}
                index={index}
                totalCount={totalCount}
                articles={articles}
                getPriorityColor={getPriorityColor}
                getPriorityText={getPriorityText}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            ))}
      </>
    )
  }

  return (
    <>
      <TableRow
        hover
        onClick={() =>
          navigate(`/user/projects/${projectId}/articles/${article.id}`)
        }
        sx={{
          cursor: 'pointer',
          backgroundColor: level > 0 ? '#f8f9fa' : 'inherit',
          '& > td:first-of-type': {
            paddingLeft: level * 3 + 2 + 'rem'
          }
        }}>
        <TableCell align="center">
          {level === 0 ? totalCount! - index! : ''}
        </TableCell>
        <TableCell align="center">
          <Chip
            label={getPriorityText(article.priority)}
            size="small"
            sx={getPriorityColor(article.priority)}
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={getStatusText(article.status)}
            size="small"
            sx={getStatusColor(article.status)}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {level > 0 && (
              <Box
                component="span"
                sx={{ color: 'text.secondary' }}>
                └
              </Box>
            )}
            {article.title}
            {article.linkList && article.linkList.length > 0 && (
              <Link2
                size={16}
                style={{ color: '#6b7280' }}
              />
            )}
          </Box>
        </TableCell>
        <TableCell align="center">{article.userName}</TableCell>
        <TableCell align="center">
          {createdAt.toLocaleDateString('ko-KR')}
        </TableCell>
      </TableRow>
      {article.children &&
        article.children.length > 0 &&
        article.children
          .filter((child: any) => !child.deleted) // 삭제된 답글은 표시하지 않음
          .map((child: any) => (
            <ArticleRow
              key={child.id}
              article={child}
              projectId={projectId}
              level={level + 1}
              index={index}
              totalCount={totalCount}
              articles={articles}
              getPriorityColor={getPriorityColor}
              getPriorityText={getPriorityText}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          ))}
    </>
  )
}

const ProjectArticle: React.FC<ProjectArticleProps> = ({
  projectId,
  stages: propStages
}) => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const data = await projectService.getProjectArticles(
          projectId,
          selectedStage
        )
        console.log('Fetched articles:', data)
        setArticles(data)
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [projectId, selectedStage])

  const getPriorityColor = (priority: PriorityType) => {
    switch (priority) {
      case PriorityType.HIGH:
        return { color: '#ef4444', backgroundColor: '#fef2f2' }
      case PriorityType.MEDIUM:
        return { color: '#f59e0b', backgroundColor: '#fffbeb' }
      case PriorityType.LOW:
        return { color: '#3b82f6', backgroundColor: '#eff6ff' }
      default:
        return { color: 'text.secondary', backgroundColor: 'grey.100' }
    }
  }

  const getPriorityText = (priority: PriorityType) => {
    switch (priority) {
      case PriorityType.HIGH:
        return '높음'
      case PriorityType.MEDIUM:
        return '보통'
      case PriorityType.LOW:
        return '낮음'
      default:
        return priority
    }
  }

  const getStatusColor = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.COMPLETED:
        return { color: '#22c55e', backgroundColor: '#f0fdf4' }
      case ArticleStatus.IN_PROGRESS:
        return { color: '#f59e0b', backgroundColor: '#fffbeb' }
      case ArticleStatus.PENDING:
        return { color: '#6b7280', backgroundColor: '#f3f4f6' }
      case ArticleStatus.REJECTED:
        return { color: '#ef4444', backgroundColor: '#fef2f2' }
      default:
        return { color: 'text.secondary', backgroundColor: 'grey.100' }
    }
  }

  const getStatusText = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.PENDING:
        return '답변대기'
      case ArticleStatus.COMMENTED:
        return '답변완료'
      case ArticleStatus.IN_PROGRESS:
        return '진행중'
      case ArticleStatus.COMPLETED:
        return '완료'
      case ArticleStatus.REJECTED:
        return '거절'
      default:
        return status
    }
  }

  const filteredArticles = articles
    .filter(article => {
      // 답글이 없는 게시글은 삭제된 경우 목록에서 제외
      if (
        !article.parentArticleId &&
        !article.children?.length &&
        article.deleted
      ) {
        return false
      }
      // 답글이 있는 게시글은 삭제 여부와 관계없이 표시
      return !article.parentArticleId
    })
    .filter(article =>
      searchQuery
        ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.userName.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  // Get total count of parent articles (excluding replies) for numbering
  const totalParentArticlesCount = filteredArticles.length

  // Get all articles including replies for pagination
  const getAllArticles = (articles: Article[]): Article[] => {
    return articles.reduce((acc: Article[], article) => {
      acc.push(article)
      if (article.children && article.children.length > 0) {
        acc.push(...getAllArticles(article.children))
      }
      return acc
    }, [])
  }

  const allArticles = getAllArticles(articles)
  const totalArticlesCount = allArticles.length
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE

  const getVisibleArticles = (
    articles: Article[],
    start: number,
    end: number
  ): Article[] => {
    let count = 0
    return articles.filter(article => {
      const shouldInclude = count >= start && count < end
      if (shouldInclude || (article.children && article.children.length > 0)) {
        const visibleChildren = article.children
          ? getVisibleArticles(
              article.children,
              Math.max(0, start - count),
              end - count
            )
          : []

        if (shouldInclude || visibleChildren.length > 0) {
          if (visibleChildren.length > 0) {
            article.children = visibleChildren
          }
          count++
          return true
        }
      }
      count++
      return false
    })
  }

  const paginatedArticles = getVisibleArticles(
    filteredArticles,
    startIndex,
    endIndex
  )

  const totalPages = Math.ceil(totalArticlesCount / ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() =>
            navigate(`/user/projects/${projectId}/articles/create`)
          }
          sx={{
            bgcolor: '#FFB800',
            '&:hover': {
              bgcolor: '#FFB800',
              opacity: 0.8
            }
          }}>
          글쓰기
        </Button>
        <TextField
          size="small"
          placeholder="검색어를 입력하세요"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            )
          }}
          sx={{
            width: '300px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#E0E0E0'
              },
              '&:hover fieldset': {
                borderColor: '#FFB800'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#FFB800'
              }
            }
          }}
        />
      </Box>

      <Box
        sx={{
          mb: 3,
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
            gap: 0,
            minWidth: 'min-content',
            px: 1,
            py: 1
          }}>
          <Box
            onClick={() => setSelectedStage(null)}
            sx={{
              py: 0.8,
              px: 2,
              fontSize: '0.9rem',
              fontWeight: selectedStage === null ? 'bold' : 'normal',
              color: selectedStage === null ? '#FFB800' : '#666',
              cursor: 'pointer',
              position: 'relative',
              '&:hover': {
                color: '#FFB800'
              },
              '&:not(:last-child)::before': {
                content: '"|"',
                position: 'absolute',
                right: 0,
                color: '#E0E0E0'
              }
            }}>
            전체
          </Box>
          {propStages.map((stage, _) => (
            <Box
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              sx={{
                py: 0.8,
                px: 2,
                fontSize: '0.9rem',
                fontWeight: selectedStage === stage.id ? 'bold' : 'normal',
                color: selectedStage === stage.id ? '#FFB800' : '#666',
                cursor: 'pointer',
                position: 'relative',
                '&:hover': {
                  color: '#FFB800'
                },
                '&:not(:last-child)::before': {
                  content: '"|"',
                  position: 'absolute',
                  right: 0,
                  color: '#E0E0E0'
                }
              }}>
              {stage.name}
            </Box>
          ))}
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                width={80}>
                번호
              </TableCell>
              <TableCell
                align="center"
                width={100}>
                우선순위
              </TableCell>
              <TableCell
                align="center"
                width={100}>
                상태
              </TableCell>
              <TableCell>제목</TableCell>
              <TableCell
                align="center"
                width={120}>
                작성자
              </TableCell>
              <TableCell
                align="center"
                width={120}>
                작성일
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedArticles.map((article, index) => (
              <ArticleRow
                key={article.id}
                article={article}
                projectId={projectId}
                index={index}
                totalCount={totalParentArticlesCount}
                articles={articles}
                getPriorityColor={getPriorityColor}
                getPriorityText={getPriorityText}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            mt: 2
          }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            sx={{ minWidth: 'auto', px: 1 }}>
            &lt;
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'contained' : 'outlined'}
              onClick={() => handlePageChange(page)}
              size="small"
              sx={{
                minWidth: 32,
                height: 32,
                p: 0
              }}>
              {page}
            </Button>
          ))}
          <Button
            variant="outlined"
            size="small"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            sx={{ minWidth: 'auto', px: 1 }}>
            &gt;
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default ProjectArticle
