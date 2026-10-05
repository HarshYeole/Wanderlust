import { Search } from "lucide-react";
const SearchBar = ({ value, onChange }) => <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><Search size={19} className="text-emerald-700" /><input value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search a destination or country" /></label>;
export default SearchBar;
