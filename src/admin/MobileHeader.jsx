import { getUserInfo } from "./utils/userInfo";

export default function MobileHeader({ pageTitle }) {
  const { name, initials } = getUserInfo();
  return (
    <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-600 font-semibold text-sm">Ishita Gallery</p>
          <p className="text-lg font-semibold text-gray-900 mt-0.5">
            {pageTitle}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center !font-semibold text-sm">
          {initials}
        </div>
      </div>
    </div>
  );
}
