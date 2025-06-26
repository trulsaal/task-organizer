"use client";

import { Clipboard, MailCheck, Sheet } from "lucide-react";
import TopNavButton from "./TopNavButton";
import { useEffect, useState } from "react";

type Task = {
  id: string;
  text: string;
  finished: boolean;
};

export default function TopNav() {
  const [allTasks, setAllTasks] = useState<Record<string, Task[]>>({});
  const [copied, setCopied] = useState(false); // ✅ New state for notification

  const sections = ["Today", "Tomorrow", "This Week", "Postponed/Backlog"];

  useEffect(() => {
    const loadAllTasks = async () => {
      const tasksBySection: Record<string, Task[]> = {};

      for (const section of sections) {
        const tasks = await window.electronAPI.getTasks(section);
        tasksBySection[section] = tasks;
      }

      setAllTasks(tasksBySection);
    };

    loadAllTasks();
  }, []);

  const generateTaskSummary = () => {
    let bodyText = "Here’s a summary of your current to-do's:\n\n";

    for (const section of sections) {
      const sectionTasks = allTasks[section]?.filter((t) => !t.finished);
      if (sectionTasks && sectionTasks.length > 0) {
        bodyText += `${section}:\n`;
        bodyText += sectionTasks.map((t) => `• ${t.text}`).join("\n");
        bodyText += "\n\n";
      }
    }

    return bodyText;
  };

  const handleQuickSend = () => {
    const subject = encodeURIComponent("Task Summary");
    const body = encodeURIComponent(generateTaskSummary());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyToClipboard = async () => {
    const text = generateTaskSummary();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true); // ✅ Show notification

      // ✅ Hide after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("❌ Failed to copy to clipboard:", error);
    }
  };

  const handleExportExcel = () => {
    window.electronAPI.exportToExcel();
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 shadow-md rounded-lg bg-gray-700 text-white relative">
      <TopNavButton
        icon={<MailCheck />}
        label="Quick Send"
        onClick={handleQuickSend}
      />
      <TopNavButton
        icon={<Sheet />}
        label="Save as Excel"
        onClick={handleExportExcel}
      />
      <TopNavButton
        icon={<Clipboard />}
        label="Copy to Clipboard"
        onClick={handleCopyToClipboard}
      />

      {/* ✅ Notification */}
      {copied && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-green-500 text-white text-sm px-3 py-1 rounded shadow-lg">
          ✅ Copied to clipboard!
        </div>
      )}
    </div>
  );
}
