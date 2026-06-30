"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

interface JobCardData {
  name: string;
  schedule: string;
  status: "active" | "disabled" | "pending";
  lastRun: string;
  nextRun: string;
  agent: string;
  icon: string;
}

const mockJobs: JobCardData[] = [
  { name: "Daily Report Sync", schedule: "0 0 * * *", status: "active", lastRun: "2 hrs ago", nextRun: "in 22 hrs", agent: "Analyzer", icon: "chip_extraction" },
  { name: "Log Cleanup", schedule: "0 0 * * 0", status: "disabled", lastRun: "5 days ago", nextRun: "Paused", agent: "System", icon: "cleaning_services" },
  { name: "Digest Emailer", schedule: "30 8 * * 1-5", status: "pending", lastRun: "Friday 8:30AM", nextRun: "in 5 mins", agent: "Comms", icon: "mail" },
];

export default function JobsPage() {
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState(mockJobs);

  return (
    <>
      <header className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Jobs</h1>
          <p className="text-body-base font-body-base text-on-surface-variant max-w-xl">
            Manage scheduled tasks, cron jobs, and automated AI workflows. Ensure local daemon is running for execution.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <span className="material-symbols-outlined fill">add</span>
          New Job
        </Button>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
        {jobs.map((job) => (
          <GlassCard key={job.name} className="flex flex-col relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${
              job.status === "active" ? "bg-primary" : job.status === "pending" ? "bg-amber-400" : "bg-outline"
            }`} />
            <div className="flex justify-between items-start mb-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[28px]">{job.icon}</span>
                <h3 className="text-headline-md font-headline-md text-on-surface text-[20px]">{job.name}</h3>
              </div>
              <Badge variant={job.status === "active" ? "active" : job.status === "pending" ? "pending" : "disabled"}>
                {job.status.toUpperCase()}
              </Badge>
            </div>

            <div className="flex flex-col gap-sm mb-lg flex-1">
              <div className="flex justify-between items-center border-b border-primary/20 pb-2">
                <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Schedule</span>
                <span className="text-log-mono font-log-mono text-primary">{job.schedule}</span>
              </div>
              <div className="flex justify-between items-center border-b border-primary/20 pb-2">
                <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Last Run</span>
                <span className="text-body-base font-body-base text-on-surface">{job.lastRun}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Next Run</span>
                <span className="text-body-base font-body-base text-on-surface">{job.nextRun}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-md border-t border-primary/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant text-[10px] text-on-surface">
                  {job.agent.charAt(0)}
                </div>
                <span className="text-label-caps font-label-caps text-on-surface-variant">Agent: {job.agent}</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => alert(`Editing ${job.name}...`)} className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-outline hover:text-primary hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button onClick={() => alert(`Deleting ${job.name}...`)} className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-outline hover:text-error hover:bg-error/10 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* New Job Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Job" className="max-w-2xl">
        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Job Name</label>
            <input className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 font-body-base"
              placeholder="e.g., Weekly Data Rollup" type="text" />
          </div>
          <div className="grid grid-cols-2 gap-lg">
            <div className="flex flex-col gap-2">
              <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Schedule (Cron)</label>
              <input className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-3 text-primary font-log-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
                type="text" defaultValue="0 * * * *" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Assigned Employee</label>
              <select className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 appearance-none">
                <option>Analyzer Agent</option>
                <option>Comms Agent</option>
                <option>System Agent</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Execution Prompt</label>
            <textarea className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 font-body-base resize-none"
              placeholder="Describe what the agent should do when this job runs..." rows={4} />
          </div>
          <div className="flex justify-end gap-md pt-2 border-t border-outline-variant">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={() => setShowModal(false)}>Create Job</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
