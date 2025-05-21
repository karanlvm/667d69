import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldRow } from '../src/components/FieldRow';

describe('FieldRow component', () => {
  const onChange = jest.fn();
  const onClear = jest.fn();
  const onConfigure = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label and input with correct value when not prefilled', () => {
    render(
      <FieldRow
        field="email"
        value="test@example.com"
        isPrefilled={false}
        onClear={onClear}
        onConfigure={onConfigure}
        onChange={onChange}
      />
    );
    // Label
    expect(screen.getByText('email')).toBeInTheDocument();
    // Input value and editable
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test@example.com');
    expect(input).not.toHaveAttribute('readOnly');
    // No clear button
    expect(screen.queryByRole('button', { name: '×' })).toBeNull();
    // Emphasis placeholder
    expect(screen.getByRole('emphasis')).toBeInTheDocument();
    // Change event
    fireEvent.change(input, { target: { value: 'new-value' } });
    expect(onChange).toHaveBeenCalledWith('new-value');
  });

  it('renders read-only input, clear button, and sourceLabel when prefilled', () => {
    render(
      <FieldRow
        field="name"
        value="John"
        isPrefilled={true}
        sourceLabel="Form1.name"
        onClear={onClear}
        onConfigure={onConfigure}
        onChange={onChange}
      />
    );
    // Input read-only
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readOnly');
    // Clicking input triggers onConfigure
    fireEvent.click(input);
    expect(onConfigure).toHaveBeenCalledTimes(1);
    // Clear button presence and click
    const clearBtn = screen.getByRole('button', { name: '×' });
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);
    // Source label button and click
    const sourceBtn = screen.getByRole('button', { name: 'Form1.name' });
    expect(sourceBtn).toBeInTheDocument();
    fireEvent.click(sourceBtn);
    expect(onConfigure).toHaveBeenCalledTimes(2);
  });
});
