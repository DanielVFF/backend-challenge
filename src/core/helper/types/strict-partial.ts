export type StrictPartial<T> = {
  [P in keyof T]?: T[P] extends object ? StrictPartial<T[P]> : T[P];
};
