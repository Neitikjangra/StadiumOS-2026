'use client';

import { useState } from 'react';
import type { WorkflowType } from '@/lib/comms/types';
import { WorkflowSelector } from './WorkflowSelector';
import { MessageComposer, type ComposerData } from './MessageComposer';
import { MessagePreview } from './MessagePreview';
import { ApprovalPanel } from './ApprovalPanel';
import { SendLogViewer } from './SendLogViewer';
import { DeliveryDashboard } from './DeliveryDashboard';
import { QuietPeriodManager } from './QuietPeriodManager';

type View = 'select' | 'compose' | 'preview' | 'logs' | 'approvals' | 'dashboard' | 'quiet';

interface SelectedWorkflow {
  type: WorkflowType;
  label: string;
  description: string;
  defaultSeverity: string;
  channels: string[];
  templateCount: number;
}

export function CommunicationsAdmin() {
  const [view, setView] = useState<View>('select');
  const [selectedWorkflow, setSelectedWorkflow] = useState<SelectedWorkflow | null>(null);
  const [previewData, setPreviewData] = useState<{ message: unknown; recipients: unknown[] } | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSelectWorkflow = (wf: SelectedWorkflow) => {
    setSelectedWorkflow(wf);
    setView('compose');
  };

  const handlePreview = async (data: ComposerData) => {
    const res = await fetch('/api/comms/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setPreviewData(result);
    setView('preview');
  };

  const handleSend = async (data: ComposerData) => {
    const res = await fetch('/api/comms/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, createdBy: 'admin-ui' }),
    });
    const result = await res.json();
    if (result.message) {
      if (result.message.status === 'approved') {
        const sendRes = await fetch(`/api/comms/messages/${result.message.id}/send`, { method: 'POST' });
        const sendResult = await sendRes.json();
        const delivered = sendResult.logs?.filter((l: { status: string }) => l.status === 'delivered').length || 0;
        setStatusMsg(`Sent! ${delivered} messages delivered.`);
      } else {
        setStatusMsg(`Message submitted for approval (ID: ${result.message.id})`);
      }
      setView('logs');
    }
  };

  const handleApprove = async (messageId: string) => {
    await fetch(`/api/comms/messages/${messageId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy: 'admin-ui', reason: 'Approved from dashboard' }),
    });
    setStatusMsg(`Message ${messageId} approved.`);
    setView('logs');
  };

  const handleReject = async (messageId: string, reason: string) => {
    await fetch(`/api/comms/messages/${messageId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectedBy: 'admin-ui', reason }),
    });
    setStatusMsg(`Message ${messageId} rejected.`);
    setView('approvals');
  };

  const navItems: { key: View; label: string }[] = [
    { key: 'select', label: 'New Alert' },
    { key: 'approvals', label: 'Approvals' },
    { key: 'logs', label: 'Send Log' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'quiet', label: 'Quiet Periods' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Communications & Alerting</h1>
        <nav className="flex gap-1">
          {navItems.map((item) => (
            <button key={item.key} onClick={() => setView(item.key)}
              className={`px-3 py-1 text-xs rounded ${view === item.key ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-alt'}`}>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {statusMsg && (
        <div className="p-2 bg-success/10 border border-success/20 rounded text-xs text-success flex justify-between">
          {statusMsg}
          <button onClick={() => setStatusMsg('')} className="text-success hover:text-success/80">&times;</button>
        </div>
      )}

      {view === 'select' && <WorkflowSelector onSelect={handleSelectWorkflow} />}

      {view === 'compose' && selectedWorkflow && (
        <MessageComposer
          workflow={selectedWorkflow.type}
          defaultChannel={selectedWorkflow.channels[0] as import('@/lib/comms/types').ChannelType}
          defaultSeverity={selectedWorkflow.defaultSeverity}
          availableChannels={selectedWorkflow.channels}
          onPreview={handlePreview}
          onSend={handleSend}
          onBack={() => setView('select')}
        />
      )}

      {view === 'preview' && previewData && (
        <MessagePreview
          message={previewData.message as never}
          recipients={previewData.recipients as never}
          onApprove={() => {
            const msg = previewData.message as { id: string };
            handleApprove(msg.id);
          }}
          onSend={() => {
            const msg = previewData.message as { id: string };
            fetch(`/api/comms/messages/${msg.id}/send`, { method: 'POST' }).then(() => {
              setStatusMsg('Message sent!');
              setView('logs');
            });
          }}
          onReject={() => {
            const msg = previewData.message as { id: string };
            handleReject(msg.id, 'Rejected from preview');
          }}
        />
      )}

      {view === 'approvals' && <ApprovalPanel onApprove={handleApprove} onReject={handleReject} />}
      {view === 'logs' && <SendLogViewer />}
      {view === 'dashboard' && <DeliveryDashboard />}
      {view === 'quiet' && <QuietPeriodManager />}
    </div>
  );
}
