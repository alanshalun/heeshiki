import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Plus, Save } from 'lucide-react'
import HTMLCSSConstructor from '../constructors/HTMLCSSConstructor'
import JavaScriptConstructor from '../constructors/JavaScriptConstructor'
import PythonConstructor from '../constructors/PythonConstructor'
import SQLConstructor from '../constructors/SQLConstructor'
import '../styles/constructor.css'

interface ConstructorProps {
  project: any
  onBack: () => void
}

export default function Constructor({ project, onBack }: ConstructorProps) {
  const [files, setFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [project.id])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', project.id)
        .order('order_index', { ascending: true })

      if (error) throw error

      if (data && data.length === 0) {
        await createDefaultFiles()
      } else {
        setFiles(data || [])
        if (data && data.length > 0) {
          setSelectedFile(data[0])
        }
      }
    } catch (err: any) {
      console.error('Error fetching files:', err)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultFiles = async () => {
    const defaultFiles = getDefaultFiles(project.language)
    try {
      const { data, error } = await supabase
        .from('project_files')
        .insert(defaultFiles)
        .select()

      if (error) throw error
      setFiles(data || [])
      if (data && data.length > 0) {
        setSelectedFile(data[0])
      }
    } catch (err: any) {
      console.error('Error creating default files:', err)
    }
  }

  const getDefaultFiles = (language: string) => {
    const now = new Date().toISOString()
    const baseFiles = {
      project_id: project.id,
      created_at: now,
      updated_at: now,
    }

    const filesByLanguage: Record<string, any[]> = {
      'html-css-js': [
        {
          ...baseFiles,
          name: 'index.html',
          language: 'html',
          file_type: 'html',
          is_main: true,
          order_index: 0,
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeCraft Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Welcome to CodeCraft</h1>
    <p>Start building your project here!</p>
  </div>
  <script src="script.js"><\/script>
</body>
</html>`,
        },
        {
          ...baseFiles,
          name: 'style.css',
          language: 'css',
          file_type: 'css',
          is_main: false,
          order_index: 1,
          content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
}`,
        },
        {
          ...baseFiles,
          name: 'script.js',
          language: 'javascript',
          file_type: 'javascript',
          is_main: false,
          order_index: 2,
          content: `console.log('CodeCraft loaded successfully!');

// Add your JavaScript code here
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded');
});`,
        },
      ],
      'python': [
        {
          ...baseFiles,
          name: 'main.py',
          language: 'python',
          file_type: 'python',
          is_main: true,
          order_index: 0,
          content: `# Welcome to CodeCraft Python Constructor
# Start building your Python application here

def hello_world():
    print("Hello from CodeCraft!")
    return "Success"

if __name__ == "__main__":
    result = hello_world()
    print(f"Result: {result}")`,
        },
      ],
      'sql': [
        {
          ...baseFiles,
          name: 'schema.sql',
          language: 'sql',
          file_type: 'sql',
          is_main: true,
          order_index: 0,
          content: `-- CodeCraft SQL Constructor
-- Design your database schema here

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);`,
        },
      ],
      'typescript': [
        {
          ...baseFiles,
          name: 'main.ts',
          language: 'typescript',
          file_type: 'typescript',
          is_main: true,
          order_index: 0,
          content: `// CodeCraft TypeScript Constructor

interface User {
  id: number;
  name: string;
  email: string;
}

const greetUser = (user: User): string => {
  return \`Hello, \${user.name}!\`;
};

const user: User = {
  id: 1,
  name: "CodeCraft",
  email: "codecraft@example.com"
};

console.log(greetUser(user));`,
        },
      ],
      'json': [
        {
          ...baseFiles,
          name: 'data.json',
          language: 'json',
          file_type: 'json',
          is_main: true,
          order_index: 0,
          content: `{
  "project": {
    "name": "CodeCraft",
    "version": "1.0.0",
    "description": "Universal Code Constructor Platform",
    "author": "You",
    "features": [
      "Visual Code Builders",
      "Multi-language Support",
      "Real-time Validation",
      "Live Preview"
    ]
  }
}`,
        },
      ],
    }

    return filesByLanguage[language] || filesByLanguage['html-css-js']
  }

  const updateFile = async (content: string) => {
    if (!selectedFile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('project_files')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', selectedFile.id)

      if (error) throw error

      setSelectedFile({ ...selectedFile, content })
      setFiles(files.map(f => f.id === selectedFile.id ? { ...f, content } : f))
    } catch (err: any) {
      console.error('Error updating file:', err)
    } finally {
      setSaving(false)
    }
  }

  const addNewFile = async () => {
    const fileName = prompt('Enter file name:')
    if (!fileName) return

    try {
      const { data, error } = await supabase
        .from('project_files')
        .insert({
          project_id: project.id,
          name: fileName,
          language: project.language,
          file_type: fileName.split('.').pop() || 'txt',
          content: '',
          order_index: files.length,
        })
        .select()

      if (error) throw error
      if (data && data.length > 0) {
        const newFile = data[0]
        setFiles([...files, newFile])
        setSelectedFile(newFile)
      }
    } catch (err: any) {
      console.error('Error adding file:', err)
    }
  }

  if (loading) {
    return <div className="loading">Loading constructor...</div>
  }

  const ConstructorComponent = {
    'html-css-js': HTMLCSSConstructor,
    'javascript': JavaScriptConstructor,
    'python': PythonConstructor,
    'sql': SQLConstructor,
  }[project.language] || HTMLCSSConstructor

  return (
    <div className="constructor">
      <header className="constructor-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={18} />
          Back
        </button>
        <h1>{project.name}</h1>
        <button onClick={() => { }} className="save-button" disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      <div className="constructor-content">
        <aside className="files-panel">
          <div className="files-header">
            <h2>Files</h2>
            <button onClick={addNewFile} className="add-file-button">
              <Plus size={16} />
            </button>
          </div>
          <div className="files-list">
            {files.map((file) => (
              <button
                key={file.id}
                className={`file-item ${selectedFile?.id === file.id ? 'active' : ''}`}
                onClick={() => setSelectedFile(file)}
              >
                <span className="file-name">{file.name}</span>
                <span className="file-type">{file.file_type}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="editor-section">
          {selectedFile && (
            <ConstructorComponent
              file={selectedFile}
              onSave={updateFile}
              project={project}
              allFiles={files}
            />
          )}
        </main>
      </div>
    </div>
  )
}
