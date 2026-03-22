import { Bell, Menu, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

export default function Navbar({ onOpenSidebar }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="lg:hidden" onClick={onOpenSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-lg font-semibold text-slate-900">Hospital Management</p>
          <p className="text-sm text-slate-500">Monitor operations and patient care</p>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-3 sm:justify-end">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search patients, doctors, appointments" />
        </div>
        <Button variant="outline" size="icon" className="hidden sm:inline-flex">
          <Bell className="h-5 w-5 text-slate-600" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 transition hover:bg-slate-50">
              <Avatar className="h-8 w-8">
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-slate-700">Dr. Sharma</p>
                <p className="text-[11px] text-slate-400">Administrator</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
