import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, LogOut, Folder, FileText, Trash2 } from 'lucide-react'
import '../styles/dashboard.css'

interface Project {
  id: string
  name: string
  description: string
  language: string
  created_at: string
  updated_at: string
}

interface DashboardProps {
  onSelectProject: (project: Project) => void
  onLogout: () => void
}

export default function Dashboard({ onSelectProject, onLogout }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectLanguage, setNewProjectLanguage] = useState('html-css-js')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err: any) {
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName,
          language: newProjectLanguage,
          description: '',
        })
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setProjects([data[0], ...projects])
        setNewProjectName('')
        setShowNewProject(false)
      }
    } catch (err: any) {
      console.error('Error creating project:', err)
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProjects(projects.filter(p => p.id !== id))
    } catch (err: any) {
      console.error('Error deleting project:', err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      'html-css-js': '#FF6B6B',
      'python': '#3776AB',
      'sql': '#CC2927',
      'typescript': '#3178C6',
      'json': '#FFD700',
    }
    return colors[lang] || '#6C757D'
  }

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      'html-css-js': 'HTML/CSS/JS',
      'python': 'Python',
      'sql': 'SQL',
      'typescript': 'TypeScript',
      'json': 'JSON',
    }
    return labels[lang] || lang
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>CodeCraft Dashboard</h1>
          <p>Welcome back! Start building your next project.</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className="dashboard-container">
        <div className="projects-section">
          <div className="section-header">
            <h2>Your Projects</h2>
            <button
              onClick={() => setShowNewProject(!showNewProject)}
              className="new-project-button"
            >
              <Plus size={18} />
              New Project
            </button>
          </div>

          {showNewProject && (
            <form onSubmit={createProject} className="new-project-form">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name..."
                autoFocus
              />
              <select
                value={newProjectLanguage}
                onChange={(e) => setNewProjectLanguage(e.target.value)}
              >
                <option value="html-css-js">HTML/CSS/JavaScript</option>
                <option value="python">Python</option>
                <option value="sql">SQL</option>
                <option value="typescript">TypeScript</option>
                <option value="json">JSON</option>
              </select>
              <button type="submit" className="create-button">Create</button>
              <button
                type="button"
                onClick={() => setShowNewProject(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </form>
          )}

          {loading ? (
            <div className="loading">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <Folder size={48} />
              <p>No projects yet. Create your first project to get started!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => onSelectProject(project)}
                >
                  <div
                    className="project-header"
                    style={{ borderTopColor: getLanguageColor(project.language) }}
                  >
                    <h3>{project.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProject(project.id)
                      }}
                      className="delete-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="project-body">
                    <span className="language-badge" style={{ backgroundColor: getLanguageColor(project.language) }}>
                      {getLanguageLabel(project.language)}
                    </span>
                    <p className="project-desc">{project.description || 'No description'}</p>
                    <small>{new Date(project.created_at).toLocaleDateString()}</small>
                  </div>
                  <div className="project-footer">
                    <FileText size={16} />
                    <span>Click to edit</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
