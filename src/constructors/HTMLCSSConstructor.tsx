import { useState, useEffect } from 'react'
import { Eye, Code, Settings } from 'lucide-react'
import ValidationPanel from '../components/ValidationPanel'
import { validate } from '../utils/validator'
import '../styles/constructors.css'

interface HTMLCSSConstructorProps {
  file: any
  onSave: (content: string) => void
  project: any
  allFiles: any[]
}

export default function HTMLCSSConstructor({
  file,
  onSave,
  project,
  allFiles,
}: HTMLCSSConstructorProps) {
  const [content, setContent] = useState(file.content || '')
  const [preview, setPreview] = useState(true)
  const [mode, setMode] = useState<'code' | 'visual'>('code')
  const [draggedElements, setDraggedElements] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<any[]>([])

  useEffect(() => {
    setContent(file.content || '')
  }, [file.id])

  useEffect(() => {
    const errors = validate(content, file.file_type)
    setValidationErrors(errors)
  }, [content, file.file_type])

  const handleSave = () => {
    onSave(content)
  }

  const getPreviewContent = () => {
    const htmlFile = allFiles.find(f => f.file_type === 'html')
    const cssFiles = allFiles.filter(f => f.file_type === 'css')
    const jsFiles = allFiles.filter(f => f.file_type === 'javascript')

    if (!htmlFile) return ''

    let html = htmlFile.content

    cssFiles.forEach((cssFile) => {
      html = html.replace(
        '</head>',
        `<style>${cssFile.content}</style></head>`
      )
    })

    jsFiles.forEach((jsFile) => {
      html = html.replace(
        '</body>',
        `<script>${jsFile.content}<\/script></body>`
      )
    })

    return html
  }

  const elementTemplates = [
    { name: 'Heading 1', tag: '<h1>Title</h1>' },
    { name: 'Heading 2', tag: '<h2>Subtitle</h2>' },
    { name: 'Paragraph', tag: '<p>Your text here</p>' },
    { name: 'Button', tag: '<button>Click me</button>' },
    { name: 'Input', tag: '<input type="text" placeholder="Enter text">' },
    { name: 'Link', tag: '<a href="#">Link</a>' },
    { name: 'Image', tag: '<img src="image.jpg" alt="description">' },
    { name: 'Div Container', tag: '<div class="container">Content</div>' },
  ]

  const insertElement = (tag: string) => {
    const cursorPos = (document.querySelector('.code-editor') as HTMLTextAreaElement)?.selectionStart || content.length
    const newContent = content.slice(0, cursorPos) + '\n' + tag + '\n' + content.slice(cursorPos)
    setContent(newContent)
  }

  return (
    <div className="constructor-view">
      <div className="constructor-toolbar">
        <div className="toolbar-group">
          <button
            className={`mode-button ${mode === 'code' ? 'active' : ''}`}
            onClick={() => setMode('code')}
          >
            <Code size={16} />
            Code
          </button>
          <button
            className={`mode-button ${mode === 'visual' ? 'active' : ''}`}
            onClick={() => setMode('visual')}
          >
            <Settings size={16} />
            Visual
          </button>
        </div>

        <button
          className={`preview-toggle ${preview ? 'active' : ''}`}
          onClick={() => setPreview(!preview)}
        >
          <Eye size={16} />
          {preview ? 'Hide' : 'Show'} Preview
        </button>

        <button onClick={handleSave} className="save-btn">
          Save Changes
        </button>
      </div>

      <div className="constructor-main">
        {mode === 'visual' && (
          <div className="visual-editor">
            <div className="elements-palette">
              <h3>HTML Elements</h3>
              <div className="element-grid">
                {elementTemplates.map((el, idx) => (
                  <button
                    key={idx}
                    className="element-button"
                    onClick={() => insertElement(el.tag)}
                    title={el.tag}
                  >
                    {el.name}
                  </button>
                ))}
              </div>
            </div>

            {file.file_type === 'css' && (
              <div className="css-properties">
                <h3>CSS Properties</h3>
                <div className="properties-list">
                  <div className="property-group">
                    <label>Background Color</label>
                    <input type="color" defaultValue="#ffffff" />
                  </div>
                  <div className="property-group">
                    <label>Text Color</label>
                    <input type="color" defaultValue="#000000" />
                  </div>
                  <div className="property-group">
                    <label>Padding</label>
                    <input type="number" placeholder="20" />
                  </div>
                  <div className="property-group">
                    <label>Margin</label>
                    <input type="number" placeholder="10" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'code' && (
          <div className="code-section">
            <textarea
              className="code-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your HTML/CSS code here..."
              spellCheck="false"
            />
          </div>
        )}

        {preview && (
          <div className="preview-section">
            <div className="preview-header">
              <h3>Preview</h3>
              <select defaultValue="desktop" className="device-select">
                <option value="mobile">Mobile (375px)</option>
                <option value="tablet">Tablet (768px)</option>
                <option value="desktop">Desktop (1024px)</option>
              </select>
            </div>
            <iframe
              className="preview-frame"
              srcDoc={getPreviewContent()}
              sandbox="allow-scripts"
            />
          </div>
        )}

        <ValidationPanel errors={validationErrors} />
      </div>
    </div>
  )
}
