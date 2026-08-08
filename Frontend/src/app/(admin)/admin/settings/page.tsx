'use client';

import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Check } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [aiRateLimit, setAiRateLimit] = useState(20);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 500);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">System & Platform Settings</h1>
            <p className="text-xs text-zinc-400 mt-1">Configure global application parameters, AI engine rate limits, and maintenance modes.</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>System settings updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Security & Maintenance</h3>

            <div className="divide-y divide-zinc-800/80">
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <h4 className="text-xs font-bold text-white">Maintenance Mode</h4>
                  <p className="text-[11px] text-zinc-500">Temporarily restrict public access to the platform.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    maintenanceMode ? 'bg-indigo-600' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div>
                  <h4 className="text-xs font-bold text-white">Allow User Signups</h4>
                  <p className="text-[11px] text-zinc-500">Permit new user registrations via Clerk authentication.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowRegistration(!allowRegistration)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    allowRegistration ? 'bg-indigo-600' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowRegistration ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Recommendation Throttling</h3>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Max AI Survey Submissions Per User / Day</label>
              <input
                type="number"
                value={aiRateLimit}
                onChange={(e) => setAiRateLimit(parseInt(e.target.value) || 1)}
                className="w-48 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-bold text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
