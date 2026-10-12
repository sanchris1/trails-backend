export function checkValueSign(value: number): string {
  if (value > 0) {
    return "pos";
  } else if (value < 0) {
    return "neg";
  } else {
    return "none";
  }
}
