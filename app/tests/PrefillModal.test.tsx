import { render, screen, fireEvent } from '@testing-library/react';
import type { Option } from '../src/components/PrefillModal';

// Gotta mock framer-motion so animations don’t interfere
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    AnimatePresence: ({ children }: any) => <div>{children}</div>,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
      li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    },
  };
});

import { PrefillModal, GLOBAL_VALUES } from '../src/components/PrefillModal';

describe('PrefillModal', () => {
  const upstreamOptions: Option[] = [
    { key: 'FORM1.email', label: 'FORM1.email', sourceFormId: 'FORM1', sourceField: 'email' },
    { key: 'FORM2.name',  label: 'FORM2.name',  sourceFormId: 'FORM2', sourceField: 'name'  },
  ];
  const onSelect = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render anything when isOpen=false', () => {
    const { container } = render(
      <PrefillModal
        fieldName="testField"
        isOpen={false}
        options={upstreamOptions}
        onSelect={onSelect}
        onClose={onClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the header, search input, and group labels', () => {
    render(
      <PrefillModal
        fieldName="testField"
        isOpen={true}
        options={upstreamOptions}
        onSelect={onSelect}
        onClose={onClose}
      />
    );

    // Header title
    expect(screen.getByRole('heading', { name: /Configure “testField”/ })).toBeInTheDocument();

    // Search input
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();

    // Group labels: one for globals, one per upstream
    expect(screen.getByText('Global values')).toBeInTheDocument();
    expect(screen.getByText('FORM1')).toBeInTheDocument();
    expect(screen.getByText('FORM2')).toBeInTheDocument();
  });

  it('toggles a group open and selects a global option', () => {
    render(
      <PrefillModal
        fieldName="testField"
        isOpen={true}
        options={[]}
        onSelect={onSelect}
        onClose={onClose}
      />
    );

    // Expand Global vals
    const globalLabel = screen.getByText('Global values');
    fireEvent.click(globalLabel);

    // Take the first field key from global vals
    const firstGlobalField = Object.keys(GLOBAL_VALUES)[0];

    // Option should appear with its fieldLabel
    const optionItem = screen.getByText(firstGlobalField);
    expect(optionItem).toBeInTheDocument();

    fireEvent.click(optionItem);
    // Select button becomes enabled
    const selectBtn = screen.getByRole('button', { name: 'Select' });
    expect(selectBtn).toBeEnabled();

    // Click "Select" and verify
    fireEvent.click(selectBtn);
    expect(onSelect).toHaveBeenCalledWith({
      key: `GLOBAL.${firstGlobalField}`,
      label: `Global values.${firstGlobalField}`,
      sourceFormId: 'GLOBAL',
      sourceField: firstGlobalField,
    });
  });

  it('clicking Cancel calls onClose', () => {
    render(
      <PrefillModal
        fieldName="testField"
        isOpen={true}
        options={upstreamOptions}
        onSelect={onSelect}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
