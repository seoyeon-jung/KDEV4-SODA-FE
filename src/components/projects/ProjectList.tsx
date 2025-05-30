import React from 'react'
import { Box, Typography } from '@mui/material'
import type { Project } from '../../types/project'
import ProjectCard from '../projects/ProjectCard'
import { useNavigate } from 'react-router-dom'

interface ProjectWithProgress extends Project {
  progress: number
}

interface ProjectListProps {
  title: string
  projects: ProjectWithProgress[]
  onProjectClick: (projectId: number) => void
}

const ProjectList: React.FC<ProjectListProps> = ({ title, projects }) => {
  const navigate = useNavigate()

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 2
        }}>
        {projects.map(project => (
          <Box key={project.id}>
            <ProjectCard
              project={project}
              onClick={() => navigate(`/user/projects/${project.id}`)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default ProjectList
