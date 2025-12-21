import { Scale } from "lucide-react";
import { RoleSwitcher, UserRole } from "./RoleSwitcher";

interface HeaderProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Header = ({ role, onRoleChange }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-law-gold flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">LawBoard</h1>
              <p className="text-xs text-muted-foreground">AI Legal Assistant for Indian Law</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-3 py-1 rounded-full bg-law-gold-light text-accent font-medium">
                IPC • CrPC • Constitution
              </span>
            </div>
            <RoleSwitcher role={role} onRoleChange={onRoleChange} />
          </div>
        </div>
      </div>
    </header>
  );
};
