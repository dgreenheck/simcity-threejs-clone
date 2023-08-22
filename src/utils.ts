export const exhaustiveSwitchGuard = (_: never): never => {
  throw new Error("Exhaustive switch guard");
};
