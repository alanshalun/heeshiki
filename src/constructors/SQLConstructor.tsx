import { useState, useEffect } from 'react'
import { Play, Database } from 'lucide-react'
import ValidationPanel from '../components/ValidationPanel'
import { validate } from '../utils/validator'
import '../styles/constructors.css'

interface SQLConstructorProps {
  file: any
  onSave: (content: string) => void
  project: any
  allFiles: any[]
}

export default function SQLConstructor({
  file,
  onSave,
  project,
  allFiles,
}: SQLConstructorProps) {
  const [content, setContent] = useState(file.content || '')
  const [results, setResults] = useState<any[]>([])
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [validationErrors, setValidationErrors] = useState<any[]>([])

  useEffect(() => {
    setContent(file.content || '')
  }, [file.id])

  useEffect(() => {
    const errors = validate(content, 'sql')
    setValidationErrors(errors)
  }, [content])

  const handleSave = () => {
    onSave(content)
  }

  const runQuery = async () => {
    setResults([])
    setOutput('')
    setIsRunning(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sql-executor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(window as any).authToken || ''}`,
          },
          body: JSON.stringify({ query: content }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setResults(data.results || [])
        setOutput(`Query executed successfully. ${data.rows || 0} rows affected.`)
      } else {
        setOutput(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setOutput('Error: Could not execute query')
    } finally {
      setIsRunning(false)
    }
  }

  const sqlSnippets = [
    {
      name: 'SELECT',
      code: `SELECT * FROM table_name;`
    },
    {
      name: 'WHERE',
      code: `SELECT * FROM table_name WHERE column = value;`
    },
    {
      name: 'INSERT',
      code: `INSERT INTO table_name (column1, column2) VALUES ('value1', 'value2');`
    },
    {
      name: 'UPDATE',
      code: `UPDATE table_name SET column1 = 'value' WHERE id = 1;`
    },
    {
      name: 'DELETE',
      code: `DELETE FROM table_name WHERE id = 1;`
    },
    {
      name: 'JOIN',
      code: `SELECT * FROM table1 \nINNER JOIN table2 ON table1.id = table2.table1_id;`
    },
    {
      name: 'GROUP BY',
      code: `SELECT column1, COUNT(*) FROM table_name GROUP BY column1;`
    },
    {
      name: 'ORDER BY',
      code: `SELECT * FROM table_name ORDER BY column1 DESC;`
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
        <button onClick={runQuery} disabled={isRunning} className="run-button">
          <Play size={16} />
          {isRunning ? 'Running...' : 'Execute Query'}
        </button>

        <button onClick={handleSave} className="save-btn">
          Save
        </button>
      </div>

      <div className="constructor-main">
        <div className="code-section full-width">
          <div className="editor-header">
            <Database size={16} />
            <h3>SQL Query</h3>
          </div>
          <textarea
            className="code-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your SQL query here..."
            spellCheck="false"
          />
        </div>

        <div className="snippets-panel">
          <div className="snippets-header">
            <Database size={16} />
            <h3>SQL Snippets</h3>
          </div>
          <div className="snippets-list">
            {sqlSnippets.map((snippet, idx) => (
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
            <h3>Results</h3>
            <span className="status">{output}</span>
          </div>
          <div className="results-table">
            {results.length === 0 ? (
              <p className="console-empty">Run a query to see results here</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val: any, vidx) => (
                        <td key={vidx}>{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <ValidationPanel errors={validationErrors} />
      </div>
    </div>
  )
}
