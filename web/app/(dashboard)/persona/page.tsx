"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import FileTree from "@/components/ui/FileTree";

const personaContents: Record<string, string> = {
  "default.yml": `name: "Default Assistant"
model: claude-3-5-sonnet
temperature: 0.7
max_tokens: 4096
system_prompt: |
  You are Clara, a helpful and capable AI assistant.
  You respond clearly and concisely, adapting to the user's needs.
  You prioritize accuracy and helpfulness in all interactions.

capabilities:
  - code_generation
  - analysis
  - conversation
  - file_operations

constraints:
  - refuse_harmful_requests: true
  - verify_information: true
  - maintain_context: true`,
  "creative.yml": `name: "Creative Mode"
model: claude-3-5-sonnet
temperature: 0.9
max_tokens: 8192
system_prompt: |
  You are Clara in Creative Mode.
  You think outside the box, generate novel ideas,
  and embrace unconventional solutions.
  You write vividly and imaginatively.

capabilities:
  - creative_writing
  - brainstorming
  - design
  - storytelling`,
  "precise.yml": `name: "Precise Mode"
model: claude-3-5-sonnet
temperature: 0.2
max_tokens: 2048
system_prompt: |
  You are Clara in Precise Mode.
  You give short, factual, well-sourced answers.
  You avoid speculation and clearly state uncertainty.

capabilities:
  - fact_checking
  - data_analysis
  - verification
  - technical_docs`,
  "support.yml": `name: "Support Agent"
model: claude-3-5-sonnet
temperature: 0.5
max_tokens: 4096
system_prompt: |
  You are Clara, a customer support agent.
  You are patient, empathetic, and thorough.
  You guide users step-by-step to resolve their issues.

capabilities:
  - customer_support
  - troubleshooting
  - documentation`,
  "technical.yml": `name: "Technical Mode"
model: claude-3-5-sonnet
temperature: 0.3
max_tokens: 8192
system_prompt: |
  You are Clara in Technical Mode.
  You provide detailed technical explanations,
  code snippets with best practices, and architectural insights.

capabilities:
  - code_review
  - architecture
  - debugging
  - system_design`,
};

export default function PersonaPage() {
  const [selectedFile, setSelectedFile] = useState("default.yml");
  const [code, setCode] = useState(personaContents["default.yml"]);
  const [isDirty, setIsDirty] = useState(false);

  const handleSelect = (name: string) => {
    setSelectedFile(name);
    setCode(personaContents[name]);
    setIsDirty(false);
  };

  const handleEdit = (value: string) => {
    setCode(value);
    setIsDirty(true);
  };

  return (
    <>
      <header className="mb-sm">
        <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Personas</h1>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-2xl">
          Define and manage AI personality profiles. Each persona sets model parameters, system instructions, and capability constraints.
        </p>
      </header>

      <GlassCard className="overflow-hidden p-0">
        <div className="flex h-[65vh]">
          <aside className="w-64 border-r border-outline-variant/50 flex-shrink-0 flex flex-col bg-surface-container-lowest/80">
            <div className="px-lg py-md border-b border-outline-variant/50 flex justify-between items-center">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Files</span>
              <button className="text-primary hover:text-primary/80 transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FileTree selected={selectedFile} onSelect={handleSelect} />
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-lg py-md border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-low/60">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">description</span>
                <span className="text-log-mono font-log-mono text-on-surface text-[13px]">{selectedFile}</span>
                {isDirty && (
                  <span className="w-2 h-2 rounded-full bg-primary" title="Unsaved changes" />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCode(personaContents[selectedFile]);
                    setIsDirty(false);
                  }}
                  disabled={!isDirty}
                >
                  Reset
                </Button>
                <Button onClick={() => setIsDirty(false)} disabled={!isDirty}>
                  <span className="material-symbols-outlined mr-1 text-[16px]">save</span>
                  Save
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute top-0 right-0 px-4 py-2 text-label-caps font-label-caps text-on-surface-variant uppercase select-none z-10">
                YAML
              </div>
              <textarea
                className="w-full h-full bg-surface-container-lowest text-log-mono font-log-mono text-[13px] leading-relaxed text-on-surface p-6 resize-none focus:outline-none border-0"
                value={code}
                onChange={(e) => handleEdit(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </>
  );
}
