import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";

export type Country = "india" | "usa" | "russia" | "china" | "japan" | "uk";

interface CountryInfo {
  id: Country;
  name: string;
  flag: string;
  lawSystem: string;
}

export const countries: CountryInfo[] = [
  { id: "india", name: "India", flag: "🇮🇳", lawSystem: "IPC • CrPC • Constitution" },
  { id: "usa", name: "United States", flag: "🇺🇸", lawSystem: "US Code • State Laws" },
  { id: "russia", name: "Russia", flag: "🇷🇺", lawSystem: "Criminal Code • Civil Code" },
  { id: "china", name: "China", flag: "🇨🇳", lawSystem: "Criminal Law • Civil Code" },
  { id: "japan", name: "Japan", flag: "🇯🇵", lawSystem: "Penal Code • Civil Code" },
  { id: "uk", name: "United Kingdom", flag: "🇬🇧", lawSystem: "Common Law • Statutory Law" },
];

interface CountrySelectorProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
}

export const CountrySelector = ({ selectedCountry, onCountryChange }: CountrySelectorProps) => {
  const current = countries.find(c => c.id === selectedCountry) || countries[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 font-semibold">
          <Globe className="w-4 h-4" />
          <span className="text-lg">{current.flag}</span>
          <span className="hidden sm:inline">{current.name}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {countries.map((country) => (
          <DropdownMenuItem
            key={country.id}
            onClick={() => onCountryChange(country.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span className="text-xl">{country.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{country.name}</span>
              <span className="text-xs text-muted-foreground">{country.lawSystem}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
