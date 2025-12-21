import { User, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UserRole = "user" | "lawyer";

interface RoleSwitcherProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher = ({ role, onRoleChange }: RoleSwitcherProps) => {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2 transition-all",
          role === "user" && "bg-background shadow-sm"
        )}
        onClick={() => onRoleChange("user")}
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">User</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2 transition-all",
          role === "lawyer" && "bg-background shadow-sm"
        )}
        onClick={() => onRoleChange("lawyer")}
      >
        <Scale className="w-4 h-4" />
        <span className="hidden sm:inline">Lawyer</span>
      </Button>
    </div>
  );
};
