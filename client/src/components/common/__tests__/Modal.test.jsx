import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal';

describe('Modal Component', () => {
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    const closeButton = screen.getByLabelText(/close/i);
    await user.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    const backdrop = screen.getByTestId('modal-backdrop');
    await user.click(backdrop);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside modal content', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    await user.click(screen.getByText('Modal content'));
    
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('does not close when closeOnBackdrop is false', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnBackdrop={false} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    const backdrop = screen.getByTestId('modal-backdrop');
    await user.click(backdrop);
    
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('renders different sizes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()} size="sm" title="Small">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText('Content').closest('.modal-content')).toHaveClass('max-w-sm');

    rerender(
      <Modal isOpen={true} onClose={jest.fn()} size="lg" title="Large">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText('Content').closest('.modal-content')).toHaveClass('max-w-4xl');
  });

  it('hides close button when showClose is false', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} showClose={false} title="No Close">
        <p>Content</p>
      </Modal>
    );
    expect(screen.queryByLabelText(/close/i)).not.toBeInTheDocument();
  });

  it('renders without title', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <p>Content without title</p>
      </Modal>
    );
    expect(screen.getByText('Content without title')).toBeInTheDocument();
  });

  it('renders with footer', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={jest.fn()} 
        title="Modal"
        footer={<button>Save</button>}
      >
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} className="custom-modal" title="Custom">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText('Content').closest('.modal-content')).toHaveClass('custom-modal');
  });

  it('locks body scroll when opened', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test">
        <p>Content</p>
      </Modal>
    );
    
    rerender(
      <Modal isOpen={false} onClose={jest.fn()} title="Test">
        <p>Content</p>
      </Modal>
    );
    
    expect(document.body.style.overflow).toBe('');
  });
});
