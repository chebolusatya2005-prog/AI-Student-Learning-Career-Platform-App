/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings } from 'lucide-react';

interface TrainerSettingsViewProps {
  trainerEmail?: string;
}

export function TrainerSettingsView({
  trainerEmail,
}: TrainerSettingsViewProps) {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [riskNotifications, setRiskNotifications] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] p-6 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-[#273449] pb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Trainer Preferences & Mentorship Alerts</h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Configure mentorship notifications and alert preferences
            </p>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-[#273449]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Mentorship Alerts</h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">High-Risk Student Alerts</span>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Receive instant notifications when an assigned mentee enters High Risk tier</p>
              </div>
              <input
                type="checkbox"
                checked={riskNotifications}
                onChange={(e) => setRiskNotifications(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#273449] bg-slate-50/50 dark:bg-[#111827] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">Weekly Cohort Summary Email</span>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Digest sent to {trainerEmail || 'your email'}</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
