import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Gavel, Users, Shield, FileText, AlertTriangle, Briefcase } from "lucide-react";

interface CaseType {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const caseTypes: CaseType[] = [
  {
    id: "criminal",
    label: "Criminal Law",
    icon: <Gavel className="w-6 h-6" />,
    description: "IPC violations, criminal proceedings",
  },
  {
    id: "civil",
    label: "Civil Law",
    icon: <FileText className="w-6 h-6" />,
    description: "Property, contracts, disputes",
  },
  {
    id: "family",
    label: "Family Law",
    icon: <Users className="w-6 h-6" />,
    description: "Marriage, divorce, custody",
  },
  {
    id: "consumer",
    label: "Consumer Rights",
    icon: <Shield className="w-6 h-6" />,
    description: "Product liability, service issues",
  },
  {
    id: "labor",
    label: "Labor Law",
    icon: <Briefcase className="w-6 h-6" />,
    description: "Employment, workplace rights",
  },
  {
    id: "other",
    label: "Other",
    icon: <AlertTriangle className="w-6 h-6" />,
    description: "General legal inquiry",
  },
];

interface CaseTypeSelectorProps {
  onSelect: (caseType: string) => void;
}

export const CaseTypeSelector = ({ onSelect }: CaseTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Select Case Type</h2>
        <p className="text-muted-foreground">Choose the area of law for your case</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {caseTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              "p-6 cursor-pointer transition-smooth hover:shadow-elegant hover:border-accent",
              "flex flex-col items-center text-center space-y-3"
            )}
            onClick={() => onSelect(type.id)}
          >
            <div className="w-12 h-12 rounded-xl bg-law-gold-light flex items-center justify-center text-accent">
              {type.icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{type.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
