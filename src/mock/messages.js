export const conversations = [
  {
    id: 'conv-1',
    participant: { name: 'John Doe', department: 'Sales' },
    lastMessage: 'Network issue still occurring',
    unread: true,
    online: true,
    updatedAt: '2026-08-18T10:12:00Z',
    messages: [
      { id: 'm1', from: 'employee', text: 'Hi, my connection keeps dropping again.', time: '09:58', read: true },
      { id: 'm2', from: 'agent', text: 'Thanks for the update, John — we are looking into it now.', time: '10:02', read: true },
      { id: 'm3', from: 'employee', text: 'Network issue still occurring', time: '10:12', read: false },
    ],
  },
  {
    id: 'conv-2',
    participant: { name: 'Sarah Ahmed', department: 'Marketing' },
    lastMessage: 'VPN problem',
    unread: true,
    online: false,
    updatedAt: '2026-08-18T09:20:00Z',
    messages: [
      { id: 'm1', from: 'employee', text: 'VPN problem — can someone take a look?', time: '09:20', read: false },
    ],
  },
  {
    id: 'conv-3',
    participant: { name: 'Fatima Noor', department: 'HR' },
    lastMessage: 'Thank you, all working now!',
    unread: false,
    online: true,
    updatedAt: '2026-08-17T16:45:00Z',
    messages: [
      { id: 'm1', from: 'employee', text: 'Any update on the Acrobat install?', time: '16:20', read: true },
      { id: 'm2', from: 'agent', text: 'Installed just now, please restart and confirm.', time: '16:40', read: true },
      { id: 'm3', from: 'employee', text: 'Thank you, all working now!', time: '16:45', read: true },
    ],
  },
];
