export const rad_to_deg = (rad: number) => {
  return rad * (180 / Math.PI);
}

export const average = (numbers: number[]) => {
  return (numbers.reduce((total, current) => total + current, 0)) / numbers.length;
}

export const absDifference = (numbers0: number[]) => {
  return Math.abs(Math.max(...numbers0) - Math.min(...numbers0));
}

export const isInRangeThr = (val: number, numbers: number[], threshold: number) => {
  return (Math.min(...numbers) - threshold) <= val && val <= (Math.max(...numbers) + threshold);
}