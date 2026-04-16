import { useRef, type HTMLAttributes } from 'react'
import {
  type PlaceholderFieldKind,
  formatDateFromIso,
  formatSuggestedDate,
  formatSuggestedTime,
  formatTimeFromTimeInput,
  inferPlaceholderFieldKind,
} from '../templatePlaceholderKind.ts'

type TemplatePlaceholderInputProps = {
  fieldKey: string
  value: string
  onChange: (next: string) => void
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="template-fill-glyph">
      <path
        fill="currentColor"
        d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm13 9H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9ZM8 6H5a1 1 0 0 0-1 1v2h16V7a1 1 0 0 0-1-1h-1v1a1 1 0 1 1-2 0V6H9v1a1 1 0 0 1-2 0V6Z"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="template-fill-glyph">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm1-13h-2v6l5.25 3.15.75-1.23-4-2.37V7Z"
      />
    </svg>
  )
}

function openPicker(el: HTMLInputElement | null) {
  if (!el) {
    return
  }
  if (typeof el.showPicker === 'function') {
    void el.showPicker()
  } else {
    el.click()
  }
}

function FieldHint({
  hintId,
  suggestion,
  onUse,
  useLabel,
}: {
  hintId: string
  suggestion: string
  onUse: () => void
  useLabel: string
}) {
  return (
    <p className="template-fill-hint" id={hintId}>
      <span className="template-fill-hint-k">Suggestion:</span>{' '}
      <span className="template-fill-hint-val">{suggestion}</span>
      <button
        type="button"
        className="template-fill-chip"
        onClick={onUse}
        aria-label={`${useLabel} suggestion: ${suggestion}`}
      >
        {useLabel}
      </button>
    </p>
  )
}

function renderInputByKind(
  kind: PlaceholderFieldKind,
  props: {
    value: string
    onChange: (next: string) => void
    placeholder: string
    autoComplete?: string
    inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  },
) {
  const { value, onChange, placeholder, autoComplete, inputMode } = props
  switch (kind) {
    case 'email':
      return (
        <input
          type="email"
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete ?? 'email'}
          inputMode="email"
          onChange={(event) => onChange(event.target.value)}
        />
      )
    case 'tel':
      return (
        <input
          type="tel"
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete ?? 'tel'}
          inputMode="tel"
          onChange={(event) => onChange(event.target.value)}
        />
      )
    case 'url':
      return (
        <input
          type="url"
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete ?? 'url'}
          inputMode="url"
          onChange={(event) => onChange(event.target.value)}
        />
      )
    case 'number':
      return (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          inputMode={inputMode ?? 'decimal'}
          onChange={(event) => onChange(event.target.value)}
        />
      )
    default:
      return (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
        />
      )
  }
}

function TemplatePlaceholderInput({ fieldKey, value, onChange }: TemplatePlaceholderInputProps) {
  const kind = inferPlaceholderFieldKind(fieldKey)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const timeInputRef = useRef<HTMLInputElement>(null)
  const hintId = `template-fill-hint-${fieldKey.replace(/[^a-zA-Z0-9_-]+/g, '-')}`
  const placeholder = `[${fieldKey}]`

  if (kind === 'date') {
    const suggested = formatSuggestedDate()
    return (
      <div className="template-fill-field template-fill-field--kind">
        <span className="template-fill-label">{fieldKey}</span>
        <FieldHint
          hintId={hintId}
          suggestion={suggested}
          onUse={() => onChange(suggested)}
          useLabel="Use"
        />
        <div className="template-fill-input-row">
          <input
            type="text"
            aria-label={fieldKey}
            aria-describedby={hintId}
            value={value}
            placeholder={placeholder}
            autoComplete="off"
            onChange={(event) => onChange(event.target.value)}
          />
          <button
            type="button"
            className="template-fill-native-btn"
            onClick={() => openPicker(dateInputRef.current)}
            title="Choose a date"
            aria-label="Open calendar to choose a date"
          >
            <CalendarIcon />
          </button>
          <input
            ref={dateInputRef}
            type="date"
            className="template-fill-sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              const iso = event.target.value
              if (iso) {
                onChange(formatDateFromIso(iso))
              }
            }}
          />
        </div>
      </div>
    )
  }

  if (kind === 'time') {
    const suggested = formatSuggestedTime()
    return (
      <div className="template-fill-field template-fill-field--kind">
        <span className="template-fill-label">{fieldKey}</span>
        <FieldHint
          hintId={hintId}
          suggestion={suggested}
          onUse={() => onChange(suggested)}
          useLabel="Now"
        />
        <div className="template-fill-input-row">
          <input
            type="text"
            aria-label={fieldKey}
            aria-describedby={hintId}
            value={value}
            placeholder={placeholder}
            autoComplete="off"
            onChange={(event) => onChange(event.target.value)}
          />
          <button
            type="button"
            className="template-fill-native-btn"
            onClick={() => openPicker(timeInputRef.current)}
            title="Choose a time"
            aria-label="Open clock to choose a time"
          >
            <ClockIcon />
          </button>
          <input
            ref={timeInputRef}
            type="time"
            className="template-fill-sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              const v = event.target.value
              if (v) {
                onChange(formatTimeFromTimeInput(v))
              }
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <label className="template-fill-field template-fill-field--kind">
      <span className="template-fill-label">{fieldKey}</span>
      {renderInputByKind(kind, { value, onChange, placeholder })}
    </label>
  )
}

export default TemplatePlaceholderInput
