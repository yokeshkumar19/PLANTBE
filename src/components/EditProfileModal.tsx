import { useState } from "react";
import Icon from "./BotanicalIcon";

interface EditProfileModalProps {
  initialName: string;
  initialEmail: string;
  onSave: (name: string, email: string) => void;
  onClose: () => void;
}

export default function EditProfileModal({
  initialName,
  initialEmail,
  onSave,
  onClose,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), email.trim());
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#153D27]/40 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[340px] rounded-[24px] border border-[#E3E5DC] bg-white p-5 shadow-[0_20px_50px_rgba(21,61,39,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E3E5DC]">
          <h3 className="font-heading text-[16px] font-bold text-[#1D3023]">
            Edit Profile
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-full bg-[#EAF2EB] text-[#1D3023] hover:bg-[#D7E6D9] transition active:scale-95"
          >
            <Icon name="close" size={14} strokeWidth={2.4} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#1D3023]">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-[10px] border border-[#E3E5DC] bg-[#F7F7F1] px-3 py-2 text-[12px] text-[#1D3023] focus:border-[#176B3A] focus:outline-none"
              placeholder="e.g. Yokesh Kumar"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#1D3023]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-[10px] border border-[#E3E5DC] bg-[#F7F7F1] px-3 py-2 text-[12px] text-[#1D3023] focus:border-[#176B3A] focus:outline-none"
              placeholder="e.g. yokesh@example.com"
              required
            />
          </div>

          <div className="mt-5 flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[10px] border border-[#E3E5DC] py-2 text-[12px] font-semibold text-[#485C4E] hover:bg-[#F7F7F1]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-[10px] bg-[#176B3A] py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-[#153D27]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
