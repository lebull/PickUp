import type { CSSProperties } from 'react'
import type { SlotCoord } from '../types.ts'

interface SequentialSlotCellProps {
  slotKey: string
  stageId: string
  evening: string
  eventIndex: number
  slotIndex: number
  assignedLabel: string | null
  isBlank: boolean
  isActive: boolean
  isDragOver: boolean
  isUnavailable: boolean
  unavailableTitle?: string
  genre?: string
  submissionNumber: string | null
  style?: CSSProperties
  onSetDragOver: (slotKey: string | null) => void
  onMoveAssignment: (from: SlotCoord, to: SlotCoord) => void
  onAssignSubmission: (submissionNumber: string) => void
  onSlotClick: () => void
  onRemove?: () => void
  onPeekEnter?: (rect: DOMRect) => void
  onPeekLeave?: () => void
}

export function SequentialSlotCell({
  slotKey,
  stageId,
  evening,
  eventIndex,
  slotIndex,
  assignedLabel,
  isBlank,
  isActive,
  isDragOver,
  isUnavailable,
  unavailableTitle,
  genre,
  submissionNumber,
  style,
  onSetDragOver,
  onMoveAssignment,
  onAssignSubmission,
  onSlotClick,
  onRemove,
  onPeekEnter,
  onPeekLeave,
}: SequentialSlotCellProps) {
  const isAssigned = assignedLabel !== null
  const isOccupied = isAssigned && !isBlank
  const targetCoord: SlotCoord = { stageId, evening, slotIndex, eventIndex }

  const baseClass = isAssigned
    ? `grid-cell grid-slot ${isBlank ? 'grid-slot--blank' : 'grid-slot--occupied'}`
    : 'grid-cell grid-slot grid-slot--empty'

  return (
    <button
      type="button"
      className={`${baseClass}${isActive ? ' grid-slot--active' : ''}${isDragOver ? ' grid-slot--drag-over' : ''}${isUnavailable ? ' grid-slot--availability-error' : ''}`}
      style={style}
      title={isUnavailable ? unavailableTitle : undefined}
      draggable={isOccupied}
      onDragStart={isOccupied && submissionNumber ? (e) => {
        e.dataTransfer.setData('application/dj-slot-key', JSON.stringify(targetCoord))
        e.dataTransfer.setData('application/dj-submission-number', submissionNumber)
        e.dataTransfer.effectAllowed = 'move'
      } : undefined}
      onDragEnter={(e) => {
        e.preventDefault()
        onSetDragOver(slotKey)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onSetDragOver(null)
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (!isDragOver) onSetDragOver(slotKey)
      }}
      onDrop={(e) => {
        e.preventDefault()
        onSetDragOver(null)
        const slotKeyData = e.dataTransfer.getData('application/dj-slot-key')
        if (slotKeyData) {
          onMoveAssignment(JSON.parse(slotKeyData) as SlotCoord, targetCoord)
          return
        }
        const subNum = e.dataTransfer.getData('application/dj-submission-number')
        if (subNum) onAssignSubmission(subNum)
      }}
      onMouseEnter={onPeekEnter ? (e) => onPeekEnter(e.currentTarget.getBoundingClientRect()) : undefined}
      onMouseLeave={onPeekLeave}
      onClick={onSlotClick}
    >
      {isAssigned ? assignedLabel : '+'}
      {isOccupied && genre && <span className="slot-genre">{genre}</span>}
      {isOccupied && onRemove && (
        <button
          type="button"
          className="slot-remove-btn"
          title="Remove DJ"
          onClick={(e) => {
            e.stopPropagation()
            onPeekLeave?.()
            onRemove()
          }}
        >
          ×
        </button>
      )}
    </button>
  )
}
