'use client';

import { useState, useEffect } from 'react';
import type { WorkflowType, ChannelType, AlertSeverity, AudienceType, Language, MessageTemplate } from '@/lib/comms/types';
import { CHANNEL_LABELS, WORKFLOW_LABELS, SEVERITY_CONFIG } from '@/lib/comms/types';
import { getMockZones, getMockSections, getMockStadiums } from '@/lib/comms/targeting';

interface Props {
  workflow: WorkflowType;
  defaultChannel: ChannelType;
  defaultSeverity: string;
  availableChannels: string[];
  onPreview: (data: ComposerData) => void;
  onSend: (data: ComposerData) => void;
  onBack: () => void;
}

export interface ComposerData {
  workflow: WorkflowType;
  channel: ChannelType;
  templateId?: string;
  subject: string;
  body: string;
  severity: AlertSeverity;
  audience: {
    type: AudienceType;
    stadiumId?: string;
    zoneIds?: string[];
    sectionIds?: string[];
    roles?: string[];
    languages?: Language[];
  };
  language: Language;
  variables: Record<string, string>;
}

export function MessageComposer({ workflow, defaultChannel, defaultSeverity, availableChannels, onPreview, onSend, onBack }: Props) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState<ChannelType>(defaultChannel as ChannelType);
  const [severity, setSeverity] = useState<AlertSeverity>(defaultSeverity as AlertSeverity);
  const [audienceType, setAudienceType] = useState<AudienceType>('all_fans');
  const [stadiumId, setStadiumId] = useState('');
  const [zoneIds, setZoneIds] = useState<string[]>([]);
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const [languages, setLanguages] = useState<Language[]>(['en']);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const zones = getMockZones();
  const sections = getMockSections();
  const stadiums = getMockStadiums();

  useEffect(() => {
    fetch(`/api/comms/templates?workflow=${workflow}`)
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []));
  }, [workflow]);

  useEffect(() => {
    if (selectedTemplate) {
      const tpl = templates.find((t) => t.id === selectedTemplate);
      if (tpl) {
        setSubject(tpl.subject);
        setBody(tpl.body);
        setChannel(tpl.channel);
        setSeverity(tpl.severity);
        const vars: Record<string, string> = {};
        tpl.variables.forEach((v) => { vars[v] = ''; });
        setVariables(vars);
      }
    }
  }, [selectedTemplate, templates]);

  const buildData = (): ComposerData => ({
    workflow,
    channel,
    templateId: selectedTemplate || undefined,
    subject,
    body,
    severity,
    audience: {
      type: audienceType,
      stadiumId: stadiumId || undefined,
      zoneIds: zoneIds.length ? zoneIds : undefined,
      sectionIds: sectionIds.length ? sectionIds : undefined,
      languages,
    },
    language: languages[0] || 'en',
    variables,
  });

  const toggleZone = (z: string) => setZoneIds((prev) => prev.includes(z) ? prev.filter((x) => x !== z) : [...prev, z]);
  const toggleSection = (s: string) => setSectionIds((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleLang = (l: Language) => setLanguages((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-sm text-text-muted hover:text-text-secondary">&larr; Back</button>
        <h3 className="text-sm font-semibold text-text-primary">{WORKFLOW_LABELS[workflow]} — Compose Message</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text-secondary">Template</label>
            <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary">
              <option value="">Custom message</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>[{t.language.toUpperCase()}] {t.subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary" placeholder="Alert subject" />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Body</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary" placeholder="Message body (use {{variable}} for dynamic content)" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary">Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value as ChannelType)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary">
                {availableChannels.map((c) => (
                  <option key={c} value={c}>{CHANNEL_LABELS[c as ChannelType]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary">Severity</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value as AlertSeverity)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary">
                {(Object.keys(SEVERITY_CONFIG) as AlertSeverity[]).map((s) => (
                  <option key={s} value={s}>{SEVERITY_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
          </div>

          {severity === 'high' || severity === 'critical' ? (
            <div className="p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
              This severity requires operator approval before sending.
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text-secondary">Audience Type</label>
            <select value={audienceType} onChange={(e) => setAudienceType(e.target.value as AudienceType)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary">
              <option value="all_fans">All Fans</option>
              <option value="all_operators">All Operators & Staff</option>
              <option value="zone">By Zone</option>
              <option value="section">By Section</option>
              <option value="role">By Role</option>
              <option value="language">By Language</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Stadium</label>
            <select value={stadiumId} onChange={(e) => setStadiumId(e.target.value)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary">
              <option value="">All stadiums</option>
              {stadiums.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {(audienceType === 'zone' || audienceType === 'all_fans') && (
            <div>
              <label className="text-xs font-medium text-text-secondary">Zones</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {zones.map((z) => (
                  <button key={z} onClick={() => toggleZone(z)}
                    className={`text-xs px-2 py-1 rounded ${zoneIds.includes(z) ? 'bg-primary/10 text-primary' : 'bg-surface-alt text-text-secondary'}`}>
                    {z}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(audienceType === 'section' || audienceType === 'all_fans') && (
            <div>
              <label className="text-xs font-medium text-text-secondary">Sections</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {sections.map((s) => (
                  <button key={s} onClick={() => toggleSection(s)}
                    className={`text-xs px-2 py-1 rounded ${sectionIds.includes(s) ? 'bg-primary/10 text-primary' : 'bg-surface-alt text-text-secondary'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-text-secondary">Languages</label>
            <div className="flex gap-1 mt-1">
              {(['en', 'es', 'fr', 'ar'] as Language[]).map((l) => (
                <button key={l} onClick={() => toggleLang(l)}
                  className={`text-xs px-2 py-1 rounded ${languages.includes(l) ? 'bg-primary/10 text-primary' : 'bg-surface-alt text-text-secondary'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {Object.keys(variables).length > 0 && (
            <div>
              <label className="text-xs font-medium text-text-secondary">Variables</label>
              <div className="space-y-1 mt-1">
                {Object.keys(variables).map((k) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-24 truncate">{`{{${k}}}`}</span>
                    <input value={variables[k]} onChange={(e) => setVariables((prev) => ({ ...prev, [k]: e.target.value }))}
                      className="flex-1 p-1 border border-border rounded text-xs bg-surface text-text-primary" placeholder={`Value for ${k}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={() => onPreview(buildData())}
          className="px-4 py-2 text-sm border border-border rounded hover:bg-surface-alt text-text-primary">
          Preview
        </button>
        <button onClick={() => onSend(buildData())}
          className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90">
          {severity === 'high' || severity === 'critical' ? 'Submit for Approval' : 'Send'}
        </button>
      </div>
    </div>
  );
}
