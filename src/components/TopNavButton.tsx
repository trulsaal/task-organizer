type TopNavButtonProps = {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  onClick: () => void;
};

export default function TopNavButton({
  className = "font-semibold items-center  hover:bg-gray-300 transition-colors flex gap-2 px-3 py-1 rounded-md  hover:text-gray-800 text-sm shadow-sm hover:shadow-md cursor-pointer",
  icon,
  label,
  onClick,
}: TopNavButtonProps) {
  return (
    <button onClick={onClick} className={className}>
      {icon && <span className="">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
