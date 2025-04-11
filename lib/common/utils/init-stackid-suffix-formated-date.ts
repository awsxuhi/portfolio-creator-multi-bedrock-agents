import { Fn } from "aws-cdk-lib";

export function StackIdSuffix(stackId: string): string {
  const shortStackId = Fn.select(2, Fn.split("/", stackId));
  const Suffix = Fn.select(4, Fn.split("-", shortStackId));
  return Suffix;
}

// stackId = arn:aws:cloudformation:us-east-1:123456789012:stack/my-stack-name/3b6c1fd0-d77e-11e9-9cec-02f9aeab5b58
// shortStackId = 3b6c1fd0-d77e-11e9-9cec-02f9aeab5b58
// Suffix = 02f9aeab5b58

export function FormattedDate(): string {
  const today: Date = new Date();
  const year: number = today.getFullYear();
  const month: number = today.getMonth() + 1;
  const day: number = today.getDate();

  const stringOfToday = `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`; //example: "2023-03-14"
  return stringOfToday;
}
