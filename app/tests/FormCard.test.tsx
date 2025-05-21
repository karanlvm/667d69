// tests/FormCard.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import type { GraphNode, FormDefinition } from '../src/helpers/types';

// Mock FieldRow to expose data-testid and trigger callbacks
jest.mock('../src/components/FieldRow', () => ({
  FieldRow: ({
    field,
    value,
    isPrefilled,
    sourceLabel,
    onClear,
    onConfigure,
    onChange,
  }: any) => (
    <div
      data-testid={`field-row-${field}`}
      data-value={value}
      data-prefilled={isPrefilled.toString()}
      data-sourcelabel={sourceLabel}
      onClick={() => onChange('new-value')}
      onDoubleClick={() => {
        onClear();
        onConfigure();
      }}
    />
  ),
}));

import { FormCard } from '../src/components/FormCard';

describe('FormCard component', () => {
  const node = {
    id: 'n1',
    type: 'form',
    data: {
      component_id: 'form1',
      name: 'My Test Form',
      input_mapping: {},
    },
  } as unknown as GraphNode;

  const definition = {
    id: 'form1',
    fields: [
      { name: 'first', label: 'First', type: 'text' },
      { name: 'second', label: 'Second', type: 'text' },
    ],
    field_schema: {
      properties: {
        first: {},
        second: {},
      },
    },
  } as unknown as FormDefinition;

  const baseProps = {
    node,
    definition,
    values: { first: 'A', second: 'B' },
    mappings: {},
    upstreamLabels: {},
    onFieldChange: jest.fn(),
    onClear: jest.fn(),
    onConfigure: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and an unchecked Prefill checkbox', () => {
    render(
      <FormCard
        {...baseProps}
        prefillEnabled={false}
        onTogglePrefill={jest.fn()}
        nextDisabled={true}
        onNext={jest.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /My Test Form/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Prefill/i })).not.toBeChecked();
  });

  it('renders one FieldRow per property with correct default props', () => {
    render(
      <FormCard
        {...baseProps}
        prefillEnabled={false}
        onTogglePrefill={jest.fn()}
        nextDisabled={true}
        onNext={jest.fn()}
      />
    );

    const rows = screen.getAllByTestId(/field-row-/);
    expect(rows).toHaveLength(2);

    expect(screen.getByTestId('field-row-first')).toHaveAttribute('data-value', 'A');
    expect(screen.getByTestId('field-row-first')).toHaveAttribute('data-prefilled', 'false');
    expect(screen.getByTestId('field-row-first')).toHaveAttribute('data-sourcelabel', '');

    expect(screen.getByTestId('field-row-second')).toHaveAttribute('data-value', 'B');
    expect(screen.getByTestId('field-row-second')).toHaveAttribute('data-prefilled', 'false');
  });

  it('toggles Prefill, calling onTogglePrefill and updating isPrefilled and sourceLabel on FieldRows', () => {
    const onTogglePrefill = jest.fn();
    // Provide a mapping so isPrefilled can become true
    const mappingsWithSource = { first: { sourceFormId: 'SRC1', sourceField: 'fld' } };
    const upstreamLabelsWithSource = { SRC1: 'SourceOne' };

    // Initial render: prefillEnabled = false
    const { rerender } = render(
      <FormCard
        {...baseProps}
        mappings={mappingsWithSource}
        upstreamLabels={upstreamLabelsWithSource}
        prefillEnabled={false}
        onTogglePrefill={onTogglePrefill}
        nextDisabled={true}
        onNext={jest.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /Prefill/i });
    fireEvent.click(checkbox);
    expect(onTogglePrefill).toHaveBeenCalledWith(true);

    // Rerender with prefillEnabled = true
    rerender(
      <FormCard
        {...baseProps}
        mappings={mappingsWithSource}
        upstreamLabels={upstreamLabelsWithSource}
        prefillEnabled={true}
        onTogglePrefill={onTogglePrefill}
        nextDisabled={true}
        onNext={jest.fn()}
      />
    );

    const firstRow = screen.getByTestId('field-row-first');
    expect(firstRow).toHaveAttribute('data-prefilled', 'true');
    expect(firstRow).toHaveAttribute('data-sourcelabel', 'SourceOne.fld');
  });

  it('renders a disabled "Submit" button when nextDisabled=true, then "Next" when false, and calls onNext', () => {
    const onNext = jest.fn();
    const { rerender } = render(
      <FormCard
        {...baseProps}
        prefillEnabled={false}
        onTogglePrefill={jest.fn()}
        nextDisabled={true}
        onNext={onNext}
      />
    );

    // Disabled Submit
    let btn = screen.getByRole('button', { name: /Submit/i });
    expect(btn).toBeDisabled();

    // Re-render with nextDisabled=false
    rerender(
      <FormCard
        {...baseProps}
        prefillEnabled={false}
        onTogglePrefill={jest.fn()}
        nextDisabled={false}
        onNext={onNext}
      />
    );

    // Enabled Next
    btn = screen.getByRole('button', { name: /Next/i });
    expect(btn).toBeEnabled();

    fireEvent.click(btn);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('propagates clear, configure, and change events from FieldRow', () => {
    const onFieldChange = jest.fn();
    const onClear = jest.fn();
    const onConfigure = jest.fn();

    render(
      <FormCard
        {...baseProps}
        prefillEnabled={false}
        onTogglePrefill={jest.fn()}
        nextDisabled={true}
        onNext={jest.fn()}
        onFieldChange={onFieldChange}
        onClear={onClear}
        onConfigure={onConfigure}
      />
    );

    // click simulates onChange
    fireEvent.click(screen.getByTestId('field-row-first'));
    expect(onFieldChange).toHaveBeenCalledWith('first', 'new-value');

    // double-click simulates onClear + onConfigure
    fireEvent.doubleClick(screen.getByTestId('field-row-first'));
    expect(onClear).toHaveBeenCalledWith('first');
    expect(onConfigure).toHaveBeenCalledWith('first');
  });
});
