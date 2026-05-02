import type { ImpactConfidence, Severity } from "../../types/src";

export function shouldTriggerImmediateAlert(input: {
  severity: Severity;
  packageMatched: boolean;
  currentVersionConfidence: ImpactConfidence;
  exploitStatus: "known_exploited" | "suspected" | "none" | "unknown";
}) {
  if (!input.packageMatched) {
    return false;
  }

  if (input.severity === "critical") {
    return true;
  }

  if (input.exploitStatus === "known_exploited") {
    return true;
  }

  return input.severity === "high" && input.currentVersionConfidence === "exact";
}

export function buildAlertCopy(input: {
  packageName: string;
  fixedVersion?: string;
  severity: Severity;
}) {
  return {
    title: `${input.packageName} ${input.severity} 보안 이슈 감지`,
    body: input.fixedVersion
      ? `주시 중인 ${input.packageName}가 영향을 받을 수 있습니다. ${input.fixedVersion} 이상으로 올리세요.`
      : `주시 중인 ${input.packageName}가 영향을 받을 수 있습니다. 원문 advisory를 확인하세요.`
  };
}
