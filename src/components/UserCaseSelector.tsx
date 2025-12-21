import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Plane } from "lucide-react";

interface UserCaseType {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  examples: string[];
}

const userCaseTypes: UserCaseType[] = [
  {
    id: "general-emergency",
    label: "General Emergency",
    icon: <AlertTriangle className="w-6 h-6" />,
    description: "Criminal situations, witness protection, immediate legal help",
    examples: [
      "Witnessed a crime and need guidance",
      "Victim of theft or assault",
      "Harassment or threats",
      "Self-defense situations"
    ]
  },
  {
    id: "transport",
    label: "Transport & Immigration",
    icon: <Plane className="w-6 h-6" />,
    description: "Visa issues, travel problems, immigration emergencies",
    examples: [
      "Visa expired abroad",
      "Passport lost or stolen",
      "Detained at airport/border",
      "Immigration documentation issues"
    ]
  },
];

interface UserCaseSelectorProps {
  onSelect: (caseType: string) => void;
}

export const UserCaseSelector = ({ onSelect }: UserCaseSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">How Can We Help?</h2>
        <p className="text-muted-foreground">Select the type of situation you're facing</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {userCaseTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              "p-6 cursor-pointer transition-smooth hover:shadow-elegant hover:border-accent",
              "flex flex-col space-y-4"
            )}
            onClick={() => onSelect(type.id)}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-law-gold-light flex items-center justify-center text-accent">
                {type.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">{type.label}</h3>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </div>
            
            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Common situations:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {type.examples.map((example, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Our AI assistant will guide you through your situation with relevant legal information and protective measures.
        </p>
      </div>
    </div>
  );
};
