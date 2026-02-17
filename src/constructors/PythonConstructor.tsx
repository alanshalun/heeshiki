import { useState, useEffect } from 'react'
import { Play, Terminal } from 'lucide-react'
import ValidationPanel from '../components/ValidationPanel'
import { validate } from '../utils/validator'
import '../styles/constructors.css'

interface PythonConstructorProps {
  file: any
  onSave: (content: string) => void
  project: any
  allFiles: any[]
}

export default function PythonConstructor({
  file,
  onSave,
  project,
  allFiles,
}: PythonConstructorProps) {
  const [content, setContent] = useState(file.content || '')
  const [console, setConsole] = useState<string[]>([])
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [validationErrors, setValidationErrors] = useState<any[]>([])

  useEffect(() => {
    setContent(file.content || '')
  }, [file.id])

  useEffect(() => {
    const errors = validate(content, 'python')
    setValidationErrors(errors)
  }, [content])

  const handleSave = () => {
    onSave(content)
  }

  const runCode = async () => {
    setConsole([])
    setOutput('')
    setIsRunning(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/python-executor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(window as any).authToken || ''}`,
          },
          body: JSON.stringify({ code: content }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setConsole(data.output ? data.output.split('\n') : ['Code executed successfully'])
        setOutput('Success')
      } else {
        setConsole([`Error: ${data.error}`])
        setOutput('Execution failed')
      }
    } catch (err: any) {
      setConsole([
        'Note: Python execution requires a backend service.',
        'In the meantime, you can verify syntax and use the visual builder.'
      ])
      setOutput('Backend required')
    } finally {
      setIsRunning(false)
    }
  }

  const pythonSnippets = [
    {
      name: 'print statement',
      code: `print("Hello, CodeCraft!")`
    },
    {
      name: 'variable',
      code: `name = "Python"\nage = 25\nprint(f"Hello {name}, you are {age} years old")`
    },
    {
      name: 'if/else',
      code: `if age >= 18:\n    print("Adult")\nelse:\n    print("Minor")`
    },
    {
      name: 'for loop',
      code: `for i in range(5):\n    print(i)`
    },
    {
      name: 'function',
      code: `def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("CodeCraft"))`
    },
    {
      name: 'list',
      code: `items = [1, 2, 3, 4, 5]\nfor item in items:\n    print(item * 2)`
    },
    {
      name: 'dict',
      code: `user = {"name": "John", "age": 30}\nprint(user["name"])`
    },
    {
      name: 'class',
      code: `class Person:\n    def __init__(self, name):\n        self.name = name\n    def greet(self):\n        print(f"Hello {self.name}")`
    },
  ]

  const insertSnippet = (code: string) => {
    const textarea = document.querySelector('.code-editor') as HTMLTextAreaElement
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    const newContent = content.slice(0, cursorPos) + '\n' + code + '\n' + content.slice(cursorPos)
    setContent(newContent)
  }

  return (
    <div className="constructor-view">
      <div className="constructor-toolbar">
        <button onClick={runCode} disabled={isRunning} className="run-button">
          <Play size={16} />
          {isRunning ? 'Executing...' : 'Execute Code'}
        </button>

        <button onClick={handleSave} className="save-btn">
          Save
        </button>
      </div>

      <div className="constructor-main">
        <div className="code-section full-width">
          <div className="editor-header">
            <h3>Python Code</h3>
          </div>
          <textarea
            className="code-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your Python code here..."
            spellCheck="false"
          />
        </div>

        <div className="snippets-panel">
          <div className="snippets-header">
            <Terminal size={16} />
            <h3>Code Snippets</h3>
          </div>
          <div className="snippets-list">
            {pythonSnippets.map((snippet, idx) => (
              <button
                key={idx}
                className="snippet-button"
                onClick={() => insertSnippet(snippet.code)}
                title={snippet.code}
              >
                {snippet.name}
              </button>
            ))}
          </div>
        </div>

        <div className="console-panel">
          <div className="console-header">
            <h3>Output</h3>
            <span className="status">{output}</span>
          </div>
          <div className="console-output">
            {console.length === 0 ? (
              <p className="console-empty">Execute code to see output here</p>
            ) : (
              console.map((log, idx) => (
                <div key={idx} className="console-line">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <ValidationPanel errors={validationErrors} />
      </div>
    </div>
  )
}
