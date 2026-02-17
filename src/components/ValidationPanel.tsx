import { ValidationError } from '../utils/validator'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import '../styles/validation.css'

interface ValidationPanelProps {
  errors: ValidationError[]
  onErrorClick?: (error: ValidationError) => void
}

export default function ValidationPanel({ errors, onErrorClick }: ValidationPanelProps) {
  const errorCount = errors.filter(e => e.severity === 'error').length
  const warningCount = errors.filter(e => e.severity === 'warning').length
  const infoCount = errors.filter(e => e.severity === 'info').length

  if (errors.length === 0) {
    return (
      <div className="validation-panel">
        <div className="validation-header">
          <h3>Validation</h3>
          <span className="validation-status success">All clear</span>
        </div>
        <div className="validation-empty">
          <Info size={20} />
          <p>No issues found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="validation-panel">
      <div className="validation-header">
        <h3>Validation Issues</h3>
        <div className="validation-counts">
          {errorCount > 0 && <span className="count error">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
          {warningCount > 0 && <span className="count warning">{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>}
          {infoCount > 0 && <span className="count info">{infoCount} info</span>}
        </div>
      </div>

      <div className="validation-list">
        {errors.map((error, idx) => (
          <div
            key={idx}
            className={`validation-item ${error.severity}`}
            onClick={() => onErrorClick?.(error)}
          >
            <div className="error-icon">
              {error.severity === 'error' && <AlertCircle size={16} />}
              {error.severity === 'warning' && <AlertTriangle size={16} />}
              {error.severity === 'info' && <Info size={16} />}
            </div>
            <div className="error-content">
              <div className="error-line">
                <span className="line-number">Line {error.line}</span>
                <span className="error-type">{error.type}</span>
              </div>
              <p className="error-message">{error.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
