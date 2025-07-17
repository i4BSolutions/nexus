import { Steps } from "antd";

const steps = [
  { title: "Budget Details" },
  { title: "Financial Parameters" },
  { title: "Review & Submit" },
];

export default function CreationSteps({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <Steps
      current={currentStep}
      items={steps}
      size="default"
      style={{
        background: "white",
        margin: "12px 0",
        height: "76px",
        alignItems: "center",
      }}
    />
  );
}
