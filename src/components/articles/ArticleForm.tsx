import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  IconButton,
  styled
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import { Stage } from '../../types/stage'
import { PriorityType } from '../../types/article'
import { ArrowLeft, Link2, Upload, FileText, Trash2 } from 'lucide-react'

const UploadBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#F8F9FA',
  borderRadius: theme.shape.borderRadius,
  border: '1px dashed #DDE2E6',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    backgroundColor: '#F0F2F4'
  }
}))

export interface ArticleFormData {
  title: string
  content: string
  stageId: number
  priority: PriorityType
  deadLine: Date | null
  files?: File[]
  links?: { title: string; url: string }[]
}

interface ArticleFormProps {
  mode: 'create' | 'edit'
  formData: ArticleFormData
  stages: Stage[]
  isLoading?: boolean
  validationErrors?: {
    title?: string
    content?: string
    stageId?: string
  }
  onChange: (data: ArticleFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  mode,
  formData,
  stages,
  isLoading,
  validationErrors = {},
  onChange,
  onSubmit,
  onCancel
}) => {
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  const handleChange = (
    field: keyof ArticleFormData,
    value:
      | string
      | number
      | Date
      | null
      | File[]
      | { title: string; url: string }[]
  ) => {
    onChange({ ...formData, [field]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleChange('files', [...(formData.files || []), ...Array.from(files)])
    }
  }

  const handleAddLink = () => {
    if (linkTitle && linkUrl) {
      handleChange('links', [
        ...(formData.links || []),
        { title: linkTitle, url: linkUrl }
      ])
      setLinkTitle('')
      setLinkUrl('')
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onCancel}>
          <ArrowLeft />
        </IconButton>
        <Typography variant="h6">새 게시글 작성</Typography>
      </Box>

      <form onSubmit={onSubmit}>
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* 필수사항 */}
          <Box sx={{ flex: 2 }}>
            <Typography
              variant="subtitle1"
              color="primary"
              sx={{ mb: 2 }}>
              필수사항
            </Typography>
            <Stack spacing={3}>
              <FormControl error={!!validationErrors.stageId}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1 }}>
                  단계
                </Typography>
                <Select
                  value={formData.stageId}
                  onChange={e =>
                    handleChange('stageId', e.target.value as number)
                  }
                  required
                  size="small">
                  {stages.map(stage => (
                    <MenuItem
                      key={stage.id}
                      value={stage.id}>
                      {stage.name}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.stageId && (
                  <FormHelperText>{validationErrors.stageId}</FormHelperText>
                )}
              </FormControl>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1 }}>
                  제목
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  error={!!validationErrors.title}
                  helperText={validationErrors.title}
                  required
                  placeholder="제목을 입력하세요"
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1 }}>
                  내용
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={formData.content}
                  onChange={e => handleChange('content', e.target.value)}
                  error={!!validationErrors.content}
                  helperText={validationErrors.content}
                  required
                  placeholder="내용을 입력하세요"
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: 'block' }}>
                  관련 링크 (선택사항, 최대 10개)
                </Typography>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    spacing={1}>
                    <TextField
                      size="small"
                      placeholder="링크 제목"
                      value={linkTitle}
                      onChange={e => setLinkTitle(e.target.value)}
                    />
                    <TextField
                      size="small"
                      placeholder="URL"
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <Link2
                            size={16}
                            color="#6B7280"
                          />
                        )
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddLink}
                      disabled={
                        !linkTitle ||
                        !linkUrl ||
                        (formData.links?.length ?? 0) >= 10
                      }
                      size="small">
                      추가
                    </Button>
                  </Stack>
                  {formData.links && formData.links.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1, display: 'block' }}>
                        추가된 링크
                      </Typography>
                      <Stack spacing={1}>
                        {formData.links.map((link, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1,
                              bgcolor: 'grey.50',
                              borderRadius: 1
                            }}>
                            <Link2 size={16} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2">
                                {link.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary">
                                {link.url}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newLinks = [...(formData.links || [])]
                                newLinks.splice(index, 1)
                                handleChange('links', newLinks)
                              }}>
                              <Trash2 size={16} />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: 'block' }}>
                  첨부 파일 (선택사항)
                </Typography>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <UploadBox>
                    <Upload size={24} />
                    <Typography
                      variant="body2"
                      sx={{ mt: 1 }}>
                      클릭하여 파일 선택
                    </Typography>
                  </UploadBox>
                </label>
                {formData.files && formData.files.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, display: 'block' }}>
                      첨부된 파일
                    </Typography>
                    <Stack spacing={1}>
                      {formData.files.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            bgcolor: 'grey.50',
                            borderRadius: 1
                          }}>
                          <FileText size={16} />
                          <Typography
                            variant="body2"
                            sx={{ flex: 1 }}>
                            {file.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newFiles = [...(formData.files || [])]
                              newFiles.splice(index, 1)
                              handleChange('files', newFiles)
                            }}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>

          {/* 선택사항 */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              color="primary"
              sx={{ mb: 2 }}>
              선택사항
            </Typography>
            <Stack spacing={3}>
              <FormControl>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1 }}>
                  우선순위
                </Typography>
                <Select
                  value={formData.priority}
                  onChange={e =>
                    handleChange('priority', e.target.value as PriorityType)
                  }
                  size="small">
                  <MenuItem value={PriorityType.HIGH}>높음</MenuItem>
                  <MenuItem value={PriorityType.MEDIUM}>중간</MenuItem>
                  <MenuItem value={PriorityType.LOW}>낮음</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1 }}>
                  마감일
                </Typography>
                <DateTimePicker
                  value={formData.deadLine}
                  onChange={newValue => handleChange('deadLine', newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Box>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{ minWidth: 120 }}>
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ minWidth: 120 }}>
            {isLoading ? '처리 중...' : mode === 'create' ? '등록' : '수정'}
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export default ArticleForm
