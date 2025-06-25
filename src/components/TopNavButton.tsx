type TopNavButtonProps = {
  label: string;
  onClick: () => void;
};

export default function TopNavButton({ label, onClick }: TopNavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="font-semibold  hover:bg-gray-300 transition-colors px-3 py-1 rounded-md  hover:text-gray-800 shadow-sm hover:shadow-md cursor-pointer"
    >
      <span>{label}</span>
    </button>
  );
}
