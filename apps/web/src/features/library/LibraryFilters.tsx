import type { RefObject } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { CatalogFilters } from './filter';
import type { Topic } from './types';

const schoolYears = [10, 11, 12];

type LibraryFiltersProps = {
  topics: Topic[];
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  searchRef: RefObject<HTMLInputElement>;
};

export function LibraryFilters({ topics, filters, onChange, searchRef }: LibraryFiltersProps) {
  const visibleTopics = topics.filter(topic => filters.year === null || filters.year === topic.schoolYear);

  return (
    <div className="catalog-filters" role="search" aria-label="Filtrar exercícios">
      <label className="search-field">
        <span>Pesquisar</span>
        <span className="field-with-icon search-input">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            ref={searchRef}
            value={filters.query}
            onChange={event => onChange({ ...filters, query: event.target.value })}
            placeholder="Ex.: probabilidade"
          />
        </span>
      </label>

      <label>
        <span>Ano escolar</span>
        <span className="field-with-icon">
          <select
            value={filters.year ?? ''}
            onChange={event => onChange({
              ...filters,
              year: event.target.value ? Number(event.target.value) : null,
              topicId: '',
            })}
          >
            <option value="">Todos</option>
            {schoolYears.map(year => <option value={year} key={year}>{year}.º ano</option>)}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </span>
      </label>

      <label>
        <span>Tópico</span>
        <span className="field-with-icon">
          <select value={filters.topicId} onChange={event => onChange({ ...filters, topicId: event.target.value })}>
            <option value="">Todos</option>
            {visibleTopics.map(topic => (
              <option key={topic.id} value={topic.id}>{topic.parentId ? '↳ ' : ''}{topic.name}</option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </span>
      </label>
    </div>
  );
}
