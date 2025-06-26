import { useState, useRef, useEffect } from "react";
import { Check, Trash2, CornerDownRight } from "lucide-react";

type Task = {
  id: string;
  text: string;
  finished: boolean;
};

type TaskSectionProps = {
  icon: React.ReactNode;
  title: string;
};

declare global {
  interface Window {
    electronAPI: {
      exportToExcel(): unknown;
      getTasks: (section: string) => Promise<Task[]>;
      setTasks: (section: string, tasks: Task[]) => void;
    };
  }
}

export default function TaskSection({ title, icon }: TaskSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Load tasks on mount
  useEffect(() => {
    window.electronAPI.getTasks(title).then((saved) => {
      console.log("🧠 Loaded:", title, saved);
      setTasks(saved);
      setLoaded(true);
    });
  }, [title]);

  // Save tasks when changed
  useEffect(() => {
    if (loaded) {
      window.electronAPI.setTasks(title, tasks);
      console.log("💾 Saved:", title, tasks);
    }
  }, [tasks, title, loaded]);

  // Auto-refresh listener (for the backlog only)
  useEffect(() => {
    if (title !== "Postponed/Backlog") return;

    const handler = async () => {
      const updated = await window.electronAPI.getTasks("Postponed/Backlog");
      setTasks(updated);
      console.log("🔁 Refreshed backlog:", updated);
    };

    window.addEventListener("refresh-backlog", handler);
    return () => window.removeEventListener("refresh-backlog", handler);
  }, [title]);

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, finished: false },
    ]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addTask();
    }
  };

  const markAsFinished = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, finished: true } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const sendToBacklog = async (id: string) => {
    const taskToMove = tasks.find((t) => t.id === id);
    if (!taskToMove) return;

    // Remove from current section
    setTasks((prev) => prev.filter((t) => t.id !== id));

    // Append to backlog
    const backlog = await window.electronAPI.getTasks("Postponed/Backlog");
    const updatedBacklog = [...backlog, taskToMove];
    await window.electronAPI.setTasks("Postponed/Backlog", updatedBacklog);

    // Notify backlog to refresh itself
    window.dispatchEvent(new Event("refresh-backlog"));
  };

  return (
    <div className="shadow-md p-4 border border-gray-300 bg-white my-4 rounded-lg h-full">
      <h2 className="text-lg flex items-center font-semibold mb-2 gap-2">
        {icon}
        {title}
      </h2>

      {/* Active Tasks */}
      {tasks
        .filter((t) => !t.finished)
        .map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 mb-2 group hover:bg-gray-50 rounded p-1"
          >
            <div className="w-2 h-2 rounded-full bg-gray-400 mt-1" />
            <span className="flex-1 text-sm">{task.text}</span>
            <button
              onClick={() => sendToBacklog(task.id)}
              className="text-blue-500 cursor-pointer hover:text-blue-700"
              title="Send to Backlog"
            >
              <CornerDownRight size={16} />
            </button>
            <button
              onClick={() => markAsFinished(task.id)}
              className="text-green-600 cursor-pointer hover:text-green-800"
              title="Mark as Done"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 cursor-pointer hover:text-red-700"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

      {/* Input Field */}
      <div className="flex items-center gap-2 mt-2">
        <div className="w-2 h-2 rounded-full bg-gray-400" />
        <textarea
          ref={inputRef}
          placeholder="Add a task..."
          className="flex-1 bg-gray-100 border border-gray-300 p-2 rounded resize-none focus:outline-amber-400 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
      </div>

      {/* Finished Tasks */}
      {tasks.some((t) => t.finished) && (
        <div className="mt-4">
          <h3 className="text-xs text-gray-500 uppercase mb-1">Finished</h3>
          {tasks
            .filter((t) => t.finished)
            .map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 text-gray-400 line-through text-sm mb-1"
              >
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1" />
                <span className="flex-1">{task.text}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
