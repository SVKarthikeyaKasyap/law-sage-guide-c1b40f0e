import { Scale } from "lucide-react";
import { RoleSwitcher, UserRole } from "./RoleSwitcher";
import { CountrySelector, Country, countries } from "./CountrySelector";

interface HeaderProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  country: Country;
  onCountryChange: (country: Country) => void;
}

export const Header = ({ role, onRoleChange, country, onCountryChange }: HeaderProps) => {
  const currentCountry = countries.find(c => c.id === country) || countries[0];
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-gold shadow-glow flex items-center justify-center">
              <Scale className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display tracking-tight text-foreground">
                LawBoard
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                AI Legal Assistant • {currentCountry.flag} {currentCountry.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-3 py-1.5 rounded-full bg-law-gold-light text-accent font-bold uppercase tracking-wide">
                {currentCountry.lawSystem}
              </span>
            </div>
            <CountrySelector selectedCountry={country} onCountryChange={onCountryChange} />
            <RoleSwitcher role={role} onRoleChange={onRoleChange} />
          </div>
        </div>
      </div>
    </header>
  );
};
