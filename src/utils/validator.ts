export interface ValidationError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
  type: string
}

export const validateHTML = (code: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const lines = code.split('\n')

  let inTag = false
  let tagDepth = 0
  const openTags: { tag: string; line: number }[] = []

  lines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1

    // Check for unclosed tags
    const tagMatches = line.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*(?:\/?>)/g)
    if (tagMatches) {
      tagMatches.forEach((tag) => {
        const tagName = tag.match(/<([a-zA-Z][a-zA-Z0-9]*)/)?.[1] || ''
        const isSelfClosing = tag.endsWith('/>')
        const isClosing = tag.startsWith('</')

        if (!isClosing && !isSelfClosing) {
          if (!['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(tagName.toLowerCase())) {
            openTags.push({ tag: tagName, line: lineNum })
          }
        } else if (isClosing && openTags.length > 0) {
          openTags.pop()
        }
      })
    }

    // Check for basic syntax errors
    if ((line.match(/</g) || []).length !== (line.match(/>/g) || []).length) {
      errors.push({
        line: lineNum,
        column: line.indexOf('<') + 1,
        message: 'Mismatched angle brackets',
        severity: 'warning',
        type: 'syntax',
      })
    }

    // Check for missing attributes
    if (/img\s+src=/.test(line) === false && /<img/.test(line)) {
      errors.push({
        line: lineNum,
        column: line.indexOf('<img') + 1,
        message: 'img tag missing src attribute',
        severity: 'warning',
        type: 'attribute',
      })
    }
  })

  if (openTags.length > 0) {
    const unclosed = openTags[0]
    errors.push({
      line: unclosed.line,
      column: 1,
      message: `Unclosed tag: <${unclosed.tag}>`,
      severity: 'error',
      type: 'syntax',
    })
  }

  return errors
}

export const validateCSS = (code: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const lines = code.split('\n')

  lines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1
    const trimmed = line.trim()

    if (trimmed.length === 0) return

    // Check for missing semicolons
    const propertyMatch = trimmed.match(/:\s*[^;{}]+$/)
    if (propertyMatch && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
      errors.push({
        line: lineNum,
        column: line.length,
        message: 'Missing semicolon at end of property',
        severity: 'warning',
        type: 'syntax',
      })
    }

    // Check for mismatched braces
    const openBraces = (line.match(/{/g) || []).length
    const closeBraces = (line.match(/}/g) || []).length
    if (openBraces > closeBraces) {
      errors.push({
        line: lineNum,
        column: line.lastIndexOf('{') + 1,
        message: 'Mismatched braces',
        severity: 'warning',
        type: 'syntax',
      })
    }

    // Check for invalid color values
    if (/(color|background|border):\s*[^;]+/.test(line)) {
      const colorMatch = line.match(/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})/)
      if (colorMatch && colorMatch[1].length !== 3 && colorMatch[1].length !== 6) {
        errors.push({
          line: lineNum,
          column: line.indexOf(colorMatch[0]) + 1,
          message: 'Invalid hex color format',
          severity: 'error',
          type: 'value',
        })
      }
    }
  })

  return errors
}

export const validateJavaScript = (code: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const lines = code.split('\n')

  lines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1
    const trimmed = line.trim()

    if (trimmed.length === 0 || trimmed.startsWith('//')) return

    // Check for missing semicolons
    if (/[a-zA-Z0-9_)\]}\s]$/.test(trimmed) && !trimmed.endsWith('{') && !trimmed.endsWith(',') && !trimmed.endsWith(':')) {
      if (!trimmed.endsWith(';') && !trimmed.startsWith('if') && !trimmed.startsWith('for') && !trimmed.startsWith('while')) {
        errors.push({
          line: lineNum,
          column: line.length,
          message: 'Missing semicolon',
          severity: 'warning',
          type: 'syntax',
        })
      }
    }

    // Check for unmatched parentheses
    const openParens = (line.match(/\(/g) || []).length
    const closeParens = (line.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push({
        line: lineNum,
        column: line.length,
        message: 'Unmatched parentheses',
        severity: 'error',
        type: 'syntax',
      })
    }

    // Check for console.log without arguments
    if (/console\.log\(\s*\)/.test(line)) {
      errors.push({
        line: lineNum,
        column: line.indexOf('console.log') + 1,
        message: 'console.log has no arguments',
        severity: 'warning',
        type: 'logic',
      })
    }

    // Check for undefined variables (basic check)
    if (/\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*$/.test(trimmed)) {
      errors.push({
        line: lineNum,
        column: line.length,
        message: 'Variable declaration without initialization',
        severity: 'warning',
        type: 'logic',
      })
    }
  })

  return errors
}

export const validatePython = (code: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const lines = code.split('\n')

  let indentStack: number[] = [0]

  lines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1
    const trimmed = line.trim()

    if (trimmed.length === 0 || trimmed.startsWith('#')) return

    // Check indentation
    const indent = line.search(/\S/)
    if (indent === -1) return

    if (indent % 2 !== 0 && indent !== 0) {
      errors.push({
        line: lineNum,
        column: 1,
        message: 'Inconsistent indentation',
        severity: 'warning',
        type: 'indentation',
      })
    }

    // Check for missing colons
    if (/(if|elif|else|for|while|def|class|try|except|finally|with)\s*/.test(trimmed) && !trimmed.endsWith(':')) {
      errors.push({
        line: lineNum,
        column: line.length,
        message: 'Missing colon at end of statement',
        severity: 'error',
        type: 'syntax',
      })
    }

    // Check for unmatched parentheses
    const openParens = (line.match(/\(/g) || []).length
    const closeParens = (line.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push({
        line: lineNum,
        column: line.length,
        message: 'Unmatched parentheses',
        severity: 'error',
        type: 'syntax',
      })
    }

    // Check for print statement (Python 2 vs 3)
    if (/print\s+\w+/.test(trimmed)) {
      errors.push({
        line: lineNum,
        column: line.indexOf('print') + 1,
        message: 'Python 2 print statement detected. Use print() function instead.',
        severity: 'warning',
        type: 'compatibility',
      })
    }
  })

  return errors
}

export const validateSQL = (code: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const lines = code.split('\n')
  const upperCode = code.toUpperCase()

  lines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1
    const trimmed = line.trim()

    if (trimmed.length === 0 || trimmed.startsWith('--')) return

    // Check for missing semicolon at end of statement
    if (/(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+/.test(trimmed.toUpperCase()) && !trimmed.endsWith(';')) {
      if (!line.includes('/*')) {
        errors.push({
          line: lineNum,
          column: line.length,
          message: 'SQL statement may be missing semicolon',
          severity: 'warning',
          type: 'syntax',
        })
      }
    }

    // Check for potential SQL injection patterns (basic)
    if (/'\s*\+\s*/.test(line) || /'\s*\|\|\s*/.test(line)) {
      errors.push({
        line: lineNum,
        column: line.indexOf('+' || '||') + 1,
        message: 'Potential SQL injection risk: Use parameterized queries',
        severity: 'warning',
        type: 'security',
      })
    }

    // Check for unmatched quotes
    const singleQuotes = (line.match(/'/g) || []).length
    if (singleQuotes % 2 !== 0) {
      errors.push({
        line: lineNum,
        column: line.lastIndexOf("'") + 1,
        message: 'Unmatched single quotes',
        severity: 'error',
        type: 'syntax',
      })
    }
  })

  return errors
}

export const validate = (code: string, language: string): ValidationError[] => {
  switch (language) {
    case 'html':
      return validateHTML(code)
    case 'css':
      return validateCSS(code)
    case 'javascript':
      return validateJavaScript(code)
    case 'python':
      return validatePython(code)
    case 'sql':
      return validateSQL(code)
    default:
      return []
  }
}
