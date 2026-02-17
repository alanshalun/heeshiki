import { useState, useEffect } from 'react'
import { Play, Copy, Terminal } from 'lucide-react'
import ValidationPanel from '../components/ValidationPanel'
import { validate } from '../utils/validator'
import '../styles/constructors.css'

interface JavaScriptConstructorProps {
  file: any
  onSave: (content: string) => void
  project: any
  allFiles: any[]
}

export default function JavaScriptConstructor({
  file,
  onSave,
  project,
  allFiles,
}: JavaScriptConstructorProps) {
  const [content, setContent] = useState(file.content || '')
  const [console, setConsole] = useState<string[]>([])
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [validationErrors, setValidationErrors] = useState<any[]>([])

  useEffect(() => {
    setContent(file.content || '')
  }, [file.id])

  useEffect(() => {
    const errors = validate(content, 'javascript')
    setValidationErrors(errors)
  }, [content])

  const handleSave = () => {
    onSave(content)
  }

  const runCode = () => {
    setConsole([])
    setOutput('')
    setIsRunning(true)

    try {
      const logs: string[] = []
      const originalLog = console.log
      const originalError = console.error

      ;(window as any).console = {
        log: (...args: any[]) => {
          logs.push(args.map(arg => {
            if (typeof arg === 'object') {
              return JSON.stringify(arg, null, 2)
            }
            return String(arg)
          }).join(' '))
          originalLog(...args)
        },
        error: (...args: any[]) => {
          logs.push(`Error: ${args.join(' ')}`)
          originalError(...args)
        }
      }

      const func = new Function(content)
      func()

      ;(window as any).console = { log: originalLog, error: originalError }
      setConsole(logs)
      setOutput('Code executed successfully!')
    } catch (err: any) {
      setConsole([`Error: ${err.message}`])
      setOutput('Code execution failed')
    } finally {
      setIsRunning(false)
    }
  }

  const jsSnippets = [
    {
      name: 'if/else',
      code: `if (condition) {\n  // do something\n} else {\n  // do something else\n}`
    },
    {
      name: 'for loop',
      code: `for (let i = 0; i < 10; i++) {\n  console.log(i);\n}`
    },
    {
      name: 'function',
      code: `function myFunction(param) {\n  return param * 2;\n}`
    },
    {
      name: 'arrow function',
      code: `const myFunc = (x) => x * 2;`
    },
    {
      name: 'async/await',
      code: `async function fetchData() {\n  const response = await fetch(url);\n  const data = await response.json();\n  return data;\n}`
    },
    {
      name: 'try/catch',
      code: `try {\n  // risky code\n} catch (err) {\n  console.error(err);\n}`
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
          {isRunning ? 'Running...' : 'Run Code'}
        </button>

        <button onClick={handleSave} className="save-btn">
          Save
        </button>
      </div>

      <div className="constructor-main">
        <div className="code-section full-width">
          <div className="editor-header">
            <h3>JavaScript Code</h3>
          </div>
          <textarea
            className="code-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your JavaScript code here..."
            spellCheck="false"
          />
        </div>

        <div className="snippets-panel">
          <div className="snippets-header">
            <Terminal size={16} />
            <h3>Code Snippets</h3>
          </div>
          <div className="snippets-list">
            {jsSnippets.map((snippet, idx) => (
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
            <h3>Console Output</h3>
            <span className="status">{output}</span>
          </div>
          <div className="console-output">
            {console.length === 0 ? (
              <p className="console-empty">Run code to see output here</p>
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
