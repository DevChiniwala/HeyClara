"use client";

import { useState, useMemo } from "react";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { useMCPJobs } from "@/lib/use-mcp";
import { parseJobs } from "@/lib/parsers";

const STATUS_ICONS: Record<string, string> = {
  active: "chip_extraction",
  disabled: "cleaning_services",
  archived: "archive",
};

interface JobForm {
  name: string;
  schedule: string;
  prompt: string;
  schedule_type: string;
  agent: string;
}

const emptyForm: JobForm = { name: "", schedule: "0 * * * *", prompt: "", schedule_type: "cron", agent: "" };

export default function JobsPage() {
  const { data: raw, loading, error, refetch } = useMCPJobs();
  const jobs = useMemo(() => raw ? parseJobs(raw) : [], [raw]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<JobForm>(emptyForm);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const doAction = async (action: string, name: string) => {
    setActionLoading(`${action}:${name}`);
    try {
      const resp = await fetch(`/api/jobs/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      refetch();
    } catch (err) {
      alert(`Failed to ${action} job: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      const resp = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          schedule: form.schedule,
          prompt: form.prompt,
          schedule_type: form.schedule_type,
          agent: form.agent || undefined,
        }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      setShowModal(false);
      setForm(emptyForm);
      refetch();
    } catch (err) {
      alert(`Failed to create job: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const statusVariant = (s: string) => {
    if (s === "active") return "active";
    if (s === "disabled") return "disabled";
    return "pending";
  };

  return (
    <>
      <header className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Jobs</h1>
          <p className="text-body-base font-body-base text-on-surface-variant max-w-xl">
            Manage scheduled tasks, cron jobs, and automated AI workflows. Ensure local daemon is running for execution.
          </p>
          {error && <div className="mt-md text-error text-sm">{error}</div>}
        </div>
        <Button onClick={() => setShowModal(true)}>
          <span className="material-symbols-outlined fill">add</span>
          New Job
        </Button>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="flex flex-col">
              <Skeleton className="h-5 w-40 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </GlassCard>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && jobs.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl block mb-3">schedule</span>
            <p className="text-headline-md font-headline-md text-on-surface mb-2">No jobs configured</p>
            <p className="text-body-base font-body-base mb-4">Create your first scheduled job to automate tasks.</p>
            <Button onClick={() => setShowModal(true)}>
              <span className="material-symbols-outlined fill">add</span>
              Create Job
            </Button>
          </div>
        </div>
      )}

      {/* Bento Grid */}
      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
          {jobs.map((job) => (
            <GlassCard key={job.name} className="flex flex-col relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${
                job.status === "active" ? "bg-primary" : job.status === "disabled" ? "bg-outline" : "bg-amber-400"
              }`} />
              <div className="flex justify-between items-start mb-md">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary text-[28px]">{STATUS_ICONS[job.status] || "schedule"}</span>
                  <h3 className="text-headline-md font-headline-md text-on-surface text-[20px]">{job.name}</h3>
                </div>
                <Badge variant={statusVariant(job.status)}>{job.status.toUpperCase()}</Badge>
              </div>

              <div className="flex flex-col gap-sm mb-lg flex-1">
                <div className="flex justify-between items-center border-b border-primary/20 pb-2">
                  <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Schedule</span>
                  <span className="text-log-mono font-log-mono text-primary">{job.schedule}</span>
                </div>
                <div className="flex justify-between items-center border-b border-primary/20 pb-2">
                  <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Type</span>
                  <span className="text-body-base font-body-base text-on-surface">{job.scheduleType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Next Run</span>
                  <span className="text-body-base font-body-base text-on-surface">{job.nextRun}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-md border-t border-primary/20">
                <div className="flex gap-2">
                  {job.status === "active" && (
                    <button
                      onClick={() => doAction("disable", job.name)}
                      disabled={actionLoading === `disable:${job.name}`}
                      className="px-3 py-1 text-label-caps font-label-caps border border-outline-variant text-on-surface-variant rounded hover:border-amber-400 hover:text-amber-400 transition-colors uppercase"
                    >
                      {actionLoading === `disable:${job.name}` ? "..." : "Disable"}
                    </button>
                  )}
                  {job.status === "disabled" && (
                    <button
                      onClick={() => doAction("enable", job.name)}
                      disabled={actionLoading === `enable:${job.name}`}
                      className="px-3 py-1 text-label-caps font-label-caps border border-primary/50 text-primary rounded hover:bg-primary/10 transition-colors uppercase"
                    >
                      {actionLoading === `enable:${job.name}` ? "..." : "Enable"}
                    </button>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {job.status !== "archived" && (
                    <button
                      onClick={() => doAction("archive", job.name)}
                      disabled={actionLoading === `archive:${job.name}`}
                      className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-outline hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">archive</span>
                    </button>
                  )}
                  <button
                    onClick={() => doAction("remove", job.name)}
                    disabled={actionLoading === `remove:${job.name}`}
                    className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-outline hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* New Job Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Job" className="max-w-2xl">
        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Job Name</label>
            <input className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 font-body-base"
              placeholder="e.g., Weekly Data Rollup" type="text" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-lg">
            <div className="flex flex-col gap-2">
              <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Schedule (Cron)</label>
              <input className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-3 text-primary font-log-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
                type="text" value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Type</label>
              <select className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 appearance-none"
                value={form.schedule_type}
                onChange={(e) => setForm({ ...form, schedule_type: e.target.value })}>
                <option value="cron">Cron</option>
                <option value="interval">Interval</option>
                <option value="once">Once</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps font-label-caps text-on-surface-variant uppercase">Execution Prompt</label>
            <textarea className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 font-body-base resize-none"
              placeholder="Describe what the agent should do when this job runs..." rows={4} value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })} />
          </div>
          <div className="flex justify-end gap-md pt-2 border-t border-outline-variant">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Job</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
