// tests/Sidebar.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {Sidebar} from '../src/components/Sidebar';
import type { GraphNode } from '../src/helpers/types';

describe('Sidebar component', () => {
  const forms: GraphNode[] = [
    {
      id: 'a',
      type: 'form',
      data: {
        component_id: 'c1',
        name: 'Form A',              // ← satisfies `name: string`
        input_mapping: {},           // ← satisfies `input_mapping: Record<string, any>`
      },
    },
    {
      id: 'b',
      type: 'form',
      data: {
        component_id: 'c2',
        name: 'Form B',
        input_mapping: {},
      },
    },
  ];

  it('renders form names and highlights the active one', () => {
    render(
      <Sidebar
        forms={forms}
        activeId="b"
        onSelect={() => {}}
        open={true}
        toggle={() => {}}
      />
    );

    expect(screen.getByText('Form A')).toBeInTheDocument();
    expect(screen.getByText('Form B')).toBeInTheDocument();

    const activeItem = screen.getByText('Form B');
    expect(activeItem).toHaveClass('active');
  });

  it('calls onSelect with the form ID when a name is clicked', () => {
    const onSelect = jest.fn();
    render(
      <Sidebar
        forms={forms}
        activeId=""
        onSelect={onSelect}
        open={true}
        toggle={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Form A'));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('calls toggle when the collapse button is clicked', () => {
    const toggle = jest.fn();
    render(
      <Sidebar
        forms={forms}
        activeId=""
        onSelect={() => {}}
        open={false}
        toggle={toggle}
      />
    );

    const btn = screen.getByRole('button', { name: /«/ });
    fireEvent.click(btn);
    expect(toggle).toHaveBeenCalled();
  });
});
