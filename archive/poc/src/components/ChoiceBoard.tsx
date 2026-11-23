import { useState } from 'react';
import {
  DndContext, KeyboardSensor, MouseSensor, TouchSensor,
  useDraggable, useDroppable, useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MousePointerClick, MoveDown } from 'lucide-react';
import type { Option } from '../content/probabilities';
import { Math } from './Math';

type Props = { options: Option[]; slotLabel: string; disabled: boolean; correct?: Option; onSelect: (id: string) => void };

function Choice({ option, disabled, onSelect }: { option: Option; disabled: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({ id: option.id, disabled });
  return (
    <div ref={setNodeRef} className={`choice ${isDragging ? 'is-dragging' : ''} ${disabled ? 'is-disabled' : ''}`}
      style={{ transform: CSS.Translate.toString(transform) }}>
      <button className="choice-action" type="button" disabled={disabled} onClick={onSelect}>
        <span className="choice-label">{option.math ? <Math value={option.math} /> : option.label}</span>
      </button>
      <button ref={setActivatorNodeRef} type="button" className="choice-drag" disabled={disabled}
        aria-label={`Arrastar opção: ${option.label}`} title="Arrastar para a caixa"
        {...attributes} {...listeners}>
        <GripVertical size={19} aria-hidden="true" />
      </button>
    </div>
  );
}

function AnswerSlot({ slotLabel, correct }: { slotLabel: string; correct?: Option }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'answer-slot' });
  return (
    <div ref={setNodeRef} className={`answer-slot ${isOver ? 'slot-over' : ''} ${correct ? 'slot-correct' : ''}`}>
      <span className="slot-icon">{correct ? '✓' : <MoveDown size={18} />}</span>
      <div>
        <small>{slotLabel}</small>
        <strong>{correct ? (correct.math ? <Math value={correct.math} /> : correct.label) : 'Toca numa opção ou arrasta-a até aqui'}</strong>
      </div>
    </div>
  );
}

export function ChoiceBoard({ options, slotLabel, disabled, correct, onSelect }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 140, tolerance: 10 } }),
    useSensor(KeyboardSensor),
  );

  function onDragEnd(event: DragEndEvent) {
    setActive(null);
    if (!disabled && event.over?.id === 'answer-slot') onSelect(String(event.active.id));
  }

  return (
    <DndContext sensors={sensors}
      onDragStart={(event: DragStartEvent) => setActive(String(event.active.id))}
      onDragCancel={() => setActive(null)} onDragEnd={onDragEnd}>
      <AnswerSlot slotLabel={slotLabel} correct={correct} />
      <div className="choice-heading">
        <span>ESCOLHE UMA OPÇÃO</span>
        <span className="choice-instruction"><MousePointerClick size={14} /> toca ou arrasta pelo símbolo</span>
      </div>
      <div className="choices-grid">
        {options.map(option => <Choice key={option.id} option={option} disabled={disabled}
          onSelect={() => onSelect(option.id)} />)}
      </div>
      <span className="sr-only" aria-live="polite">{active ? `A arrastar ${options.find(x => x.id === active)?.label ?? 'opção'}` : ''}</span>
    </DndContext>
  );
}
