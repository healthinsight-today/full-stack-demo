import React, { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  ConfirmModal,
  Pagination,
  Table,
  StatusCell,
  useToast,
  Tabs
} from '../components/ui';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const ComponentsShowcasePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { showToast } = useToast();
  
  // Sample data for the table
  const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', lastLogin: '2023-10-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'inactive', lastLogin: '2023-09-20' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'pending', lastLogin: '2023-10-01' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'active', lastLogin: '2023-10-12' },
    { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'User', status: 'error', lastLogin: '2023-08-30' },
  ];
  
  // Table columns
  const columns = [
    { key: 'name', title: 'Name', dataIndex: 'name' },
    { key: 'email', title: 'Email', dataIndex: 'email' },
    { key: 'role', title: 'Role', dataIndex: 'role' },
    { 
      key: 'status', 
      title: 'Status', 
      render: (_: any, record: User) => <StatusCell status={record.status} /> 
    },
    { key: 'lastLogin', title: 'Last Login', dataIndex: 'lastLogin' },
  ];
  
  // Create toast notifications
  const handleCreateToast = (type: 'success' | 'error' | 'info' | 'warning') => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'An error occurred. Please try again.',
      info: 'Here is some information you might find useful.',
      warning: 'Please be aware of this important warning.'
    };
    
    showToast({
      message: messages[type],
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      duration: 5000
    });
  };

  // Tabs content
  const tabItems = [
    {
      id: 'features',
      label: 'Features',
      content: (
        <div className="py-4">
          <p>The UI components in this library feature a clean, modern design with consistent spacing and typography.</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li>Accessible by default</li>
            <li>Dark mode support</li>
            <li>Responsive design</li>
            <li>Customizable with design tokens</li>
          </ul>
        </div>
      )
    },
    {
      id: 'usage',
      label: 'Usage',
      content: (
        <div className="py-4">
          <p>Import components from the UI library:</p>
          <pre className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md mt-3 overflow-x-auto">
            <code>{`import { Button, Card, Input } from '../components/ui';`}</code>
          </pre>
        </div>
      )
    },
    {
      id: 'theming',
      label: 'Theming',
      content: (
        <div className="py-4">
          <p>All components are themeable using CSS variables defined in <code>src/styles/tokens.css</code>.</p>
          <pre className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md mt-3 overflow-x-auto">
            <code>{`:root {
  --brand-purple: #5C4EE5;
  --font-size-md: 16px;
  --spacing-lg: 24px;
}`}</code>
          </pre>
        </div>
      )
    }
  ];
  
  return (
    <div>
      <h1 className="mb-[var(--spacing-lg)]">UI Component Showcase</h1>
      
      <div className="mb-[var(--spacing-xl)]">
        <Tabs tabs={tabItems} />
      </div>
      
      {/* Buttons Section */}
      <section className="mb-[var(--spacing-xl)]">
        <h2 className="mb-[var(--spacing-md)]">Buttons</h2>
        <Card>
          <div className="flex flex-wrap gap-[var(--spacing-md)]">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="text">Text</Button>
          </div>
          
          <div className="flex flex-wrap gap-[var(--spacing-md)] mt-[var(--spacing-lg)]">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
          
          <div className="flex flex-wrap gap-[var(--spacing-md)] mt-[var(--spacing-lg)]">
            <Button variant="primary" isLoading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
          
          <div className="mt-[var(--spacing-lg)]">
            <Button variant="primary" fullWidth>Full Width Button</Button>
          </div>
        </Card>
      </section>
      
      {/* Badges Section */}
      <section className="mb-[var(--spacing-xl)]">
        <h2 className="mb-[var(--spacing-md)]">Badges</h2>
        <Card>
          <div className="flex flex-wrap gap-[var(--spacing-md)]">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
          
          <div className="flex flex-wrap gap-[var(--spacing-md)] mt-[var(--spacing-lg)]">
            <Badge variant="primary" outlined>Primary</Badge>
            <Badge variant="secondary" outlined>Secondary</Badge>
            <Badge variant="success" outlined>Success</Badge>
            <Badge variant="danger" outlined>Danger</Badge>
            <Badge variant="warning" outlined>Warning</Badge>
            <Badge variant="info" outlined>Info</Badge>
            <Badge variant="neutral" outlined>Neutral</Badge>
          </div>
          
          <div className="flex flex-wrap gap-[var(--spacing-md)] mt-[var(--spacing-lg)]">
            <Badge variant="primary" pill>Pill</Badge>
            <Badge variant="primary" dot>With Dot</Badge>
            <Badge variant="primary" removable onRemove={() => alert('Badge removed')}>Removable</Badge>
          </div>
        </Card>
      </section>
      
      {/* Forms Section */}
      <section className="mb-[var(--spacing-xl)]">
        <h2 className="mb-[var(--spacing-md)]">Form Controls</h2>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-lg)]">
            <Input
              id="name"
              label="Name"
              placeholder="Enter your name"
              helperText="This is a helper text"
            />
            
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              error="Please enter a valid email address"
            />
            
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              required
            />
            
            <Input
              id="disabled"
              label="Disabled Input"
              placeholder="This input is disabled"
              disabled
            />
          </div>
        </Card>
      </section>
      
      {/* Cards Section */}
      <section className="mb-[var(--spacing-xl)]">
        <h2 className="mb-[var(--spacing-md)]">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-lg)]">
          <Card
            title="Simple Card"
            subtitle="With title and subtitle"
          >
            <p>This is a basic card with a title and subtitle.</p>
          </Card>
          
          <Card
            title="Card with Footer"
            footer={
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="mr-2">Cancel</Button>
                <Button variant="primary" size="sm">Save</Button>
              </div>
            }
          >
            <p>This card has a footer with action buttons.</p>
          </Card>
          
          <Card
            elevated
            onClick={() => alert('Card clicked')}
          >
            <h3 className="font-[var(--font-weight-medium)] text-[var(--font-size-md)] mb-[var(--spacing-sm)]">Clickable Card</h3>
            <p>This card is elevated and clickable.</p>
          </Card>
          
          <Card
            loading
            title="Loading Card"
          >
            <p>This content won't be visible while loading.</p>
          </Card>
        </div>
      </section>
      
      {/* Table Section */}
      <section className="mb-[var(--spacing-xl)]">
        <h2 className="mb-[var(--spacing-md)]">Table</h2>
        <Card>
          <Table
            data={users}
            columns={columns}
            rowKey="id"
            striped
            hoverable
            bordered
            onRowClick={(record) => alert(`Clicked on ${record.name}`)}
          />
        </Card>
      </section>
      
      {/* Pagination Section */}
      <section className="mb-[var(--spacing-xl)]">
        <h2 className="mb-[var(--spacing-md)]">Pagination</h2>
        <Card>
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={10}
              onPageChange={setCurrentPage}
            />
          </div>
        </Card>
      </section>
      
      {/* Modal Section */}
      <section className="mb-[var(--spacing-xl)]">
        <h2 className="mb-[var(--spacing-md)]">Modals</h2>
        <Card>
          <div className="flex flex-wrap gap-[var(--spacing-md)]">
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
            
            <Button variant="danger" onClick={() => setIsConfirmModalOpen(true)}>
              Open Confirm Modal
            </Button>
          </div>
        </Card>
      </section>
      
      {/* Toast Section */}
      <section className="mb-[var(--spacing-xl)]">
        <h2 className="mb-[var(--spacing-md)]">Toast Notifications</h2>
        <Card>
          <div className="flex flex-wrap gap-[var(--spacing-md)]">
            <Button variant="success" onClick={() => handleCreateToast('success')}>
              Success Toast
            </Button>
            
            <Button variant="danger" onClick={() => handleCreateToast('error')}>
              Error Toast
            </Button>
            
            <Button variant="info" onClick={() => handleCreateToast('info')}>
              Info Toast
            </Button>
            
            <Button variant="warning" onClick={() => handleCreateToast('warning')}>
              Warning Toast
            </Button>
          </div>
        </Card>
      </section>
      
      {/* Modals (rendered outside the main flow) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {
              setIsModalOpen(false);
              handleCreateToast('success');
            }}>
              Save Changes
            </Button>
          </div>
        }
      >
        <p className="mb-4">This is an example modal dialog window.</p>
        <Input 
          id="modal-input"
          label="Sample Input"
          placeholder="Type something here"
          fullWidth
        />
      </Modal>
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Action"
        message="Are you sure you want to perform this action? This cannot be undone."
        confirmText="Yes, Continue"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={() => {
          handleCreateToast('success');
        }}
      />
    </div>
  );
};

export default ComponentsShowcasePage; 