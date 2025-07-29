import { Steps } from "antd";

export default function CreationSteps({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: { title: string }[];
}) {
  return (
    <Steps
      current={currentStep}
      items={steps}
      size="default"
      style={{
        margin: "12px 0",
        height: "76px",
        alignItems: "center",
      }}
    />
  );
}
