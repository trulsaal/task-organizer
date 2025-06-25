import TopNavButton from "./TopNavButton";

export default function TopNav() {
  const handleQuickSend = () => {
    const subject = encodeURIComponent("Task Summary");
    const body = encodeURIComponent("Here’s a summary of the current tasks...");
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleExportExcel = () => {
    window.electronAPI.exportToExcel();
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 shadow-md rounded-lg bg-gray-700 text-white">
      <TopNavButton label="Quick Send" onClick={handleQuickSend} />
      <TopNavButton label="Save as Excel" onClick={handleExportExcel} />
    </div>
  );
}
