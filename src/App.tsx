import { ArrowRight, CalendarDays, ListRestart } from "lucide-react";
import TaskSection from "./components/TaskSection";
import TopNav from "./components/TopNav";
import Home from "./pages/Home";

export default function App() {
  return (
    <div className="h-screen flex flex-col dark:bg-gray-800 bg-gray-200 p-4">
      <Home />
      <TopNav />
      <div className="flex flex-col h-full  overflow-auto">
        <TaskSection icon={<CalendarDays />} title="Today" />
        <TaskSection icon={<ArrowRight />} title="Tomorrow" />
        <TaskSection icon={<ListRestart />} title="Postponed/Backlog" />
      </div>
    </div>
  );
}
